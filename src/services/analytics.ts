export type AnalyticsEvent = { name: string; detail?: Record<string, string>; createdAt: string }
const KEY = 'whattech.analytics.v1'

export function track(name: string, detail?: Record<string, string>) {
  try {
    const events = JSON.parse(localStorage.getItem(KEY) || '[]') as AnalyticsEvent[]
    events.push({ name, detail, createdAt: new Date().toISOString() })
    localStorage.setItem(KEY, JSON.stringify(events.slice(-500)))
  } catch { /* Analytics must never block a user flow. */ }
}

export function getAnalytics(): AnalyticsEvent[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}
