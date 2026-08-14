import type { Device } from '../types/device'

function normalize(value: string) { return value.toLowerCase().replace(/[^a-z0-9]/g, '') }
function distance(a: string, b: string) {
  const table = Array.from({ length: a.length + 1 }, (_, i) => [i])
  for (let j = 1; j <= b.length; j++) table[0][j] = j
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) table[i][j] = Math.min(table[i-1][j]+1, table[i][j-1]+1, table[i-1][j-1]+(a[i-1]===b[j-1]?0:1))
  return table[a.length][b.length]
}

export function searchDevices(devices: Device[], query: string, limit = 8) {
  const q = normalize(query)
  if (!q) return devices.slice(0, limit)
  return devices.map(device => {
    const candidates = [`${device.brand}${device.model}`, device.model, ...device.aliases].map(normalize)
    const exact = candidates.some(value => value.includes(q))
    const fuzzy = Math.min(...candidates.map(value => distance(q, value.slice(0, Math.max(q.length, Math.min(value.length, q.length + 3))))))
    return { device, score: exact ? 0 : fuzzy }
  }).filter(item => item.score <= Math.max(2, Math.floor(q.length * .35))).sort((a,b) => a.score-b.score).slice(0,limit).map(item => item.device)
}
