import type { Device } from '../types/device'
import { devicePath } from '../data/staticRoutes'

export type SearchIntent = {
  route: string
  tool: string
  devices: Device[]
  issue?: string
}

const intentWords = /\b(?:fix|repair|replace|troubleshoot|diagnose|broken|compare|versus|vs|compatible|compatibility|connect|upgrade|worth|value|sell|trade|buy|recommend|best|should|does|will|work|working|with|my|device|phone|laptop|tablet|monitor|console|how|much|is|it|to|and|or|not|turn|on)\b/gi

function normalizedWords(value: string) {
  return value.toLowerCase().normalize('NFKD').replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim()
}

function candidateNames(device: Device) {
  return [...new Set([`${device.brand} ${device.model}`, device.model, ...device.aliases])]
    .map(name => ({ raw: name, normalized: normalizedWords(name) }))
    .filter(candidate => candidate.normalized.length >= 3)
    .sort((a, b) => b.normalized.length - a.normalized.length)
}

export function devicesMentionedInQuery(devices: Device[], query: string, limit = 2) {
  const normalizedQuery = ` ${normalizedWords(query)} `
  const matches = devices.flatMap(device => {
    const matched = candidateNames(device).find(candidate => normalizedQuery.includes(` ${candidate.normalized} `))
    return matched ? [{ device, length: matched.normalized.length, index: normalizedQuery.indexOf(` ${matched.normalized} `) }] : []
  })
  matches.sort((a, b) => a.index - b.index || b.length - a.length)

  const selected: Device[] = []
  const selectedRanges: Array<{ start: number; end: number }> = []
  for (const match of matches) {
    if (selected.some(device => device.id === match.device.id)) continue
    const range = { start: match.index + 1, end: match.index + 1 + match.length }
    if (selectedRanges.some(selectedRange => range.start < selectedRange.end && range.end > selectedRange.start)) continue
    selected.push(match.device)
    selectedRanges.push(range)
    if (selected.length >= limit) break
  }
  return selected
}

function fallbackDevice(devices: Device[], query: string) {
  const remaining = normalizedWords(query.replace(intentWords, ' '))
  if (remaining.length < 3) return undefined
  return devices
    .map(device => {
      const names = candidateNames(device)
      const exact = names.some(candidate => remaining === candidate.normalized)
      const contained = names.some(candidate => remaining.includes(candidate.normalized) || candidate.normalized.includes(remaining))
      return { device, score: exact ? 2 : contained ? 1 : 0 }
    })
    .filter(match => match.score > 0)
    .sort((a, b) => b.score - a.score || b.device.model.length - a.device.model.length)[0]?.device
}

function inferredIssue(query: string, device?: Device) {
  const text = normalizedWords(query)
  if (/physical|cracked|broken glass|liquid|water damage|dropped/.test(text)) return 'Physical damage'
  if (/wont turn on|will not turn on|no power|dead/.test(text)) return 'Won’t turn on'
  if (/wont boot|boot loop|stuck on logo/.test(text)) return 'Won’t boot'
  if (/overheat|overheating|gets hot|running hot/.test(text)) return 'Overheating'
  if (/battery|drain/.test(text)) return 'Battery'
  if (/charg|usb c port/.test(text)) return 'Charging'
  if (/black screen|no display|no signal/.test(text)) return device && ['monitor', 'tv', 'desktop', 'laptop'].includes(device.category) ? 'No display' : 'Screen'
  if (/flicker/.test(text)) return 'Flickering'
  if (/camera/.test(text)) return 'Camera'
  if (/no sound|no audio|speaker|microphone|audio/.test(text)) return device?.category === 'audio' ? 'No audio' : 'Audio'
  if (/wifi|wi fi|internet/.test(text)) return device && ['laptop', 'desktop'].includes(device.category) ? 'Internet / Wi-Fi' : 'Connectivity'
  if (/bluetooth|connectivity|disconnect/.test(text)) return 'Connectivity'
  if (/crash|freez/.test(text)) return 'Crashing'
  if (/slow|lag|performance/.test(text)) return 'Slow performance'
  return undefined
}

function withDevices(route: string, devices: Device[], issue?: string) {
  const params = new URLSearchParams()
  if (devices[0]) params.set('device', devices[0].id)
  if (devices[1]) params.set('second', devices[1].id)
  if (issue) params.set('issue', issue)
  const query = params.toString()
  return query ? `${route}?${query}` : route
}

export function interpretSearch(devices: Device[], query: string): SearchIntent {
  const text = normalizedWords(query)
  const mentioned = devicesMentionedInQuery(devices, query)
  const selected = mentioned.length ? mentioned : [fallbackDevice(devices, query)].filter((device): device is Device => Boolean(device))

  if (/\b(compare|comparison|versus|vs)\b/.test(text)) return { route: withDevices('/tools/compare', selected), tool: 'Compare Devices', devices: selected }
  if (/\b(compatible|compatibility)\b|will .+ work|work with/.test(text)) return { route: withDevices('/tools/will-it-work', selected), tool: 'Will It Work?', devices: selected }
  if (/\b(upgrade|newer model)\b/.test(text)) return { route: withDevices('/tools/should-i-upgrade', selected), tool: 'Should I Upgrade?', devices: selected }
  if (/repair or replace|replace or repair|worth fixing|repair quote|\breplace\b|\brepair\b/.test(text)) return { route: withDevices('/tools/repair-or-replace', selected, inferredIssue(query, selected[0])), tool: 'Repair or Replace?', devices: selected }
  if (/\b(fix|troubleshoot|diagnose|broken)\b|not working|wont |will not |overheat|battery drain|black screen|no display|crash|freez|charging problem/.test(text)) {
    const issue = inferredIssue(query, selected[0])
    return { route: withDevices('/tools/fix-my-device', selected, issue), tool: 'Fix My Device', devices: selected, issue }
  }
  if (/\b(worth|value|sell|trade in|tradein)\b|how much/.test(text)) return { route: withDevices('/tools/whats-it-worth', selected), tool: 'What’s It Worth?', devices: selected }
  if (/\b(charger|cable|adapter|dock)\b|what do i need|connect .+ to|monitor setup/.test(text)) return { route: withDevices('/tools/what-do-i-need', selected), tool: 'What Do I Need?', devices: selected }
  if (/\b(buy|recommend|recommendation|best)\b|under [€$£]|what should i get/.test(text)) return { route: '/tools/what-should-i-buy', tool: 'What Should I Buy?', devices: selected }
  if (selected[0]) return { route: devicePath(selected[0]), tool: 'Device page', devices: selected }
  return { route: `/devices?q=${encodeURIComponent(query.trim())}`, tool: 'Device search', devices: [] }
}

export function deviceFromSearch(devices: Device[], key: 'device' | 'second') {
  const search = typeof window === 'undefined' ? '' : window.location.search
  const id = new URLSearchParams(search).get(key)
  return id ? devices.find(device => device.id === id) : undefined
}

export function valueFromSearch(key: string) {
  const search = typeof window === 'undefined' ? '' : window.location.search
  return new URLSearchParams(search).get(key) || undefined
}
