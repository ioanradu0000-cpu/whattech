import { createHash } from 'node:crypto'

const WINDOW_MS = 10 * 60 * 1000
const MAX_REQUESTS = 10
const CACHE_TTL_MS = 24 * 60 * 60 * 1000
const MAX_CACHE_ENTRIES = 250
const MAX_SOURCES = 12
const requestsByClient = new Map()
const communityCache = new Map()

const blockedHosts = new Set([
  'amazon.com', 'ebay.com', 'facebook.com', 'instagram.com', 'pinterest.com',
  'tiktok.com', 'twitter.com', 'x.com', 'youtube.com',
])
const ignoredTerms = new Set([
  'a', 'an', 'and', 'for', 'from', 'in', 'is', 'it', 'my', 'not', 'of', 'on',
  'or', 'the', 'to', 'with', 'wont', 'will', 'device', 'problem', 'issue', 'other',
  'does', 'have', 'has', 'this', 'that', 'but', 'still', 'very', 'really', 'sometimes',
  'at', 'if', 'when', 'only', 'even', 'unless', 'while', 'then', 'than', 'also',
])
const issueAliases = {
  battery: ['battery drain', 'poor battery life', 'battery problem'],
  charging: ['not charging', 'charging problem', 'charges intermittently'],
  screen: ['screen problem', 'display problem', 'black screen'],
  performance: ['slow performance', 'lagging', 'freezing'],
  overheating: ['running hot', 'gets hot', 'thermal shutdown'],
  camera: ['camera not working', 'camera problem'],
  audio: ['sound not working', 'audio problem'],
  connectivity: ['connection problem', 'disconnecting'],
  'wont turn on': ['will not turn on', 'no power', 'dead device'],
  'wont boot': ['boot problem', 'stuck on logo', 'boot loop'],
  'no display': ['black screen', 'no signal', 'display not working'],
  crashing: ['keeps crashing', 'random crashes'],
  'internet wi fi': ['wifi not working', 'wifi disconnecting', 'internet problem'],
  'bluetooth connectivity': ['bluetooth not connecting', 'bluetooth disconnecting', 'pairing problem'],
  storage: ['storage problem', 'drive not detected', 'disk error'],
  'usb peripherals': ['usb not working', 'peripheral not detected'],
  noise: ['unusual noise', 'buzzing', 'clicking noise'],
  power: ['power problem', 'loses power'],
  'physical damage': ['damaged', 'broken'],
  flickering: ['screen flickering', 'display flicker'],
  'wrong resolution': ['resolution problem', 'wrong display resolution'],
  'no audio': ['no sound', 'audio not working'],
  distortion: ['distorted sound', 'audio distortion'],
}

function send(response, status, body) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  response.end(JSON.stringify(body))
}

function clean(value, maxLength) {
  return typeof value === 'string'
    ? value.replace(/[\u0000-\u001f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLength)
    : ''
}

function stripMarkup(value, maxLength = 900) {
  return clean(value, maxLength * 2)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

function clientFingerprint(request) {
  const forwarded = request.headers['x-forwarded-for']
  const ip = clean(Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0] || request.socket?.remoteAddress || 'unknown', 100)
  return createHash('sha256').update(`${process.env.SAFETY_ID_SALT || 'whattech'}:${ip}`).digest('hex').slice(0, 32)
}

function isRateLimited(clientId) {
  const now = Date.now()
  const recent = (requestsByClient.get(clientId) || []).filter(timestamp => now - timestamp < WINDOW_MS)
  recent.push(now)
  requestsByClient.set(clientId, recent)
  return recent.length > MAX_REQUESTS
}

function safeUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url : null
  } catch {
    return null
  }
}

function normalizedUrl(url) {
  const normalized = new URL(url)
  normalized.hash = ''
  normalized.search = ''
  normalized.hostname = normalized.hostname.toLowerCase().replace(/^www\./, '')
  normalized.pathname = normalized.pathname.replace(/\/+$/, '') || '/'
  return normalized.href
}

function rootHost(hostname) {
  return hostname.toLowerCase().replace(/^www\./, '')
}

function isBlockedHost(hostname) {
  const host = rootHost(hostname)
  return [...blockedHosts].some(blocked => host === blocked || host.endsWith(`.${blocked}`))
}

function searchTerms(value) {
  return clean(value, 240)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter(term => term.length > 1 && !ignoredTerms.has(term))
}

function normalizedPhrase(value) {
  return clean(value, 240).toLowerCase().normalize('NFKD').replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim()
}

function aliasesForIssue(issue) {
  return issueAliases[normalizedPhrase(issue)] || []
}

function problemTerms(issue, details) {
  return [...new Set([
    ...searchTerms(issue),
    ...aliasesForIssue(issue).flatMap(searchTerms),
    ...searchTerms(details),
  ])]
}

function relevanceScore(result, device, issue, details, sourceType) {
  const haystack = normalizedPhrase(`${result.title} ${result.description} ${result.url}`)
  const model = normalizedPhrase(`${device.brand} ${device.model}`)
  let score = haystack.includes(model) ? 8 : 0
  const deviceMatches = searchTerms(device.model).filter(term => haystack.includes(term)).length
  const matchedProblemTerms = problemTerms(issue, details).filter(term => haystack.includes(term))
  score += deviceMatches * 3
  score += matchedProblemTerms.length * 4
  if (haystack.includes(device.brand.toLowerCase())) score += 2
  const host = safeUrl(result.url)?.hostname || ''
  if (sourceType === 'reddit' && /(^|\.)reddit\.com$/i.test(host)) score += 5
  if (/forum|community|discussion|thread|answers|support/i.test(`${host} ${result.url}`)) score += 2
  return { score, deviceMatches, problemMatches: matchedProblemTerms.length }
}

function quoteQueryPart(value) {
  return `"${clean(value, 180).replace(/["\\]/g, ' ')}"`
}

function buildQueries(device, issue, details) {
  const deviceName = `${device.brand} ${device.model}`
  const issuePhrases = [issue, ...aliasesForIssue(issue).slice(0, 2)].map(quoteQueryPart).join(' OR ')
  const detailKeywords = [...new Set(searchTerms(details))].slice(0, 10).join(' ')
  const problemClause = `(${issuePhrases})${detailKeywords ? ` ${detailKeywords}` : ''}`
  return [
    { type: 'reddit', query: `${quoteQueryPart(deviceName)} ${problemClause} site:reddit.com` },
    { type: 'forum', query: `${quoteQueryPart(deviceName)} ${problemClause} (forum OR community OR discussion)` },
  ]
}

function cacheKey(device, issue, details) {
  return createHash('sha256')
    .update(`${device.brand}|${device.model}|${device.category}|${issue}|${details}`.toLowerCase().replace(/\s+/g, ' ').trim())
    .digest('hex')
}

function getCached(key) {
  const entry = communityCache.get(key)
  if (!entry) return null
  if (entry.expiresAt <= Date.now()) {
    communityCache.delete(key)
    return null
  }
  communityCache.delete(key)
  communityCache.set(key, entry)
  return { ...entry.value, cacheStatus: 'server' }
}

function setCached(key, value) {
  communityCache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, value })
  while (communityCache.size > MAX_CACHE_ENTRIES) communityCache.delete(communityCache.keys().next().value)
}

async function braveSearch(search) {
  const url = new URL('https://api.search.brave.com/res/v1/web/search')
  url.searchParams.set('q', search.query)
  url.searchParams.set('count', '10')
  url.searchParams.set('result_filter', 'web')
  url.searchParams.set('safesearch', 'moderate')
  url.searchParams.set('spellcheck', '1')
  url.searchParams.set('text_decorations', 'false')
  url.searchParams.set('extra_snippets', 'true')

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip',
      'X-Subscription-Token': process.env.BRAVE_SEARCH_API_KEY,
    },
    signal: AbortSignal.timeout(15000),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(response.status === 429
      ? 'Community search has reached its Brave API limit. Please try again later.'
      : response.status === 401 || response.status === 403
        ? 'The Brave Search API key is invalid or does not have Search access.'
        : 'Brave Search could not complete the community search.')
    error.status = response.status === 429 ? 429 : 502
    error.code = response.status === 429 ? 'brave_rate_limit' : 'brave_provider_error'
    throw error
  }
  return { search, results: Array.isArray(data?.web?.results) ? data.web.results : [] }
}

function selectSources(searchResponses, device, issue, details) {
  const candidates = []
  for (const { search, results } of searchResponses) {
    for (const result of results) {
      const parsedUrl = safeUrl(result?.url)
      if (!parsedUrl || isBlockedHost(parsedUrl.hostname)) continue
      if (search.type === 'reddit' && !/(^|\.)reddit\.com$/i.test(parsedUrl.hostname)) continue
      const title = stripMarkup(result?.title, 220)
      const description = stripMarkup(result?.description, 650)
      if (!title || !description) continue
      const extra = Array.isArray(result?.extra_snippets)
        ? result.extra_snippets.slice(0, 2).map(snippet => stripMarkup(snippet, 300)).filter(Boolean)
        : []
      const relevance = relevanceScore({ title, description, url: parsedUrl.href }, device, issue, details, search.type)
      if (relevance.deviceMatches === 0 || relevance.problemMatches === 0) continue
      candidates.push({
        title,
        url: parsedUrl.href,
        snippet: stripMarkup([description, ...extra].join(' '), 900),
        sourceType: search.type,
        score: relevance.score,
      })
    }
  }

  candidates.sort((a, b) => b.score - a.score)
  const seenUrls = new Set()
  const seenTitles = new Set()
  const selected = []
  for (const candidate of candidates) {
    const urlKey = normalizedUrl(candidate.url)
    const titleKey = candidate.title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
    if (seenUrls.has(urlKey) || seenTitles.has(titleKey)) continue
    seenUrls.add(urlKey)
    seenTitles.add(titleKey)
    selected.push({
      id: selected.length + 1,
      title: candidate.title,
      url: candidate.url,
      snippet: candidate.snippet,
      sourceType: candidate.sourceType,
    })
    if (selected.length >= MAX_SOURCES) break
  }
  return selected
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return send(response, 405, { error: 'Method not allowed.' })
  }

  let body
  try {
    body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body
  } catch {
    return send(response, 400, { error: 'Invalid request.' })
  }

  const device = {
    brand: clean(body?.device?.brand, 80),
    model: clean(body?.device?.model, 120),
    category: clean(body?.device?.category, 40),
  }
  const issue = clean(body?.issue, 120)
  const details = clean(body?.details, 300)
  if (!device.brand || !device.model || !issue) return send(response, 400, { error: 'Device and issue are required.' })

  const key = cacheKey(device, issue, details)
  const cached = getCached(key)
  if (cached) return send(response, 200, cached)

  if (!process.env.BRAVE_SEARCH_API_KEY) {
    return send(response, 503, {
      code: 'not_configured',
      error: 'Community Search needs BRAVE_SEARCH_API_KEY on the server. Add the key, then restart or redeploy the site.',
    })
  }

  const clientId = clientFingerprint(request)
  if (isRateLimited(clientId)) return send(response, 429, { error: 'Too many community searches. Please wait a few minutes and try again.' })

  const searches = buildQueries(device, issue, details)
  try {
    const searchResponses = await Promise.all(searches.map(braveSearch))
    const sources = selectSources(searchResponses, device, issue, details)
    const result = {
      sources,
      queries: searches.map(search => search.query),
      searchedAt: new Date().toISOString(),
      cacheStatus: 'fresh',
    }
    setCached(key, result)
    return send(response, 200, result)
  } catch (error) {
    if (error && typeof error === 'object' && 'status' in error) return send(response, error.status, { code: error.code, error: error.message })
    console.error('Community research failed', error instanceof Error ? error.name : 'UnknownError')
    return send(response, 504, { error: 'Community Search timed out. Please try again.' })
  }
}
