import type { Device } from '../types/device'
import type { ResearchResult } from '../types/research'

type ResearchRequest = {
  device: Device
  issue: string
  details: string
}

type StoredResearch = {
  expiresAt: number
  result: ResearchResult
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000
const CACHE_PREFIX = 'whattech:community:v2:'

function cacheKey(device: Device, issue: string, details: string) {
  return `${CACHE_PREFIX}${[device.brand, device.model, device.category, issue, details]
    .join('|')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()}`
}

function isResearchResult(value: unknown): value is ResearchResult {
  if (!value || typeof value !== 'object') return false
  const result = value as Partial<ResearchResult>
  return Boolean(
    Array.isArray(result.sources)
    && Array.isArray(result.queries)
    && typeof result.searchedAt === 'string',
  )
}

function readCache(key: string): ResearchResult | null {
  try {
    const stored = JSON.parse(localStorage.getItem(key) || 'null') as StoredResearch | null
    if (!stored || stored.expiresAt <= Date.now() || !isResearchResult(stored.result)) {
      localStorage.removeItem(key)
      return null
    }
    return { ...stored.result, cacheStatus: 'browser' }
  } catch {
    return null
  }
}

function writeCache(key: string, result: ResearchResult) {
  try {
    localStorage.setItem(key, JSON.stringify({ expiresAt: Date.now() + CACHE_TTL_MS, result } satisfies StoredResearch))
  } catch {
    // A full or blocked browser cache should not prevent Community Search from working.
  }
}

export async function researchDeviceProblem({ device, issue, details }: ResearchRequest): Promise<ResearchResult> {
  const key = cacheKey(device, issue, details)
  const cached = readCache(key)
  if (cached) return cached

  const response = await fetch('/api/research', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      device: { brand: device.brand, model: device.model, category: device.category },
      issue,
      details,
    }),
  })
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    throw new Error(import.meta.env.DEV
      ? 'The local Community Search API is not running. Restart npm run dev so Vite loads the API middleware.'
      : 'Community Search is unavailable on this deployment.')
  }
  const data: unknown = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
      ? data.error
      : 'Community Search could not be completed.'
    throw new Error(message)
  }
  if (!isResearchResult(data)) throw new Error('Community Search returned an invalid response.')
  writeCache(key, data)
  return data
}
