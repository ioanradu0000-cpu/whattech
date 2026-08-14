import { seedDevices } from '../data/seedDevices'
import type { Device } from '../types/device'

const DEVICES_KEY = 'whattech.devices.v5'
const LEGACY_DEVICES_KEYS = ['whattech.devices.v4','whattech.devices.v3','whattech.devices.v2']
const REQUESTS_KEY = 'whattech.missing-products.v1'

const safeId = (device: Device) => `${device.brand}-${device.model}`.toLowerCase().replace(/\+/g,' plus ').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')

export function getDevices(): Device[] {
  try {
    const stored = localStorage.getItem(DEVICES_KEY)
    if (stored) return JSON.parse(stored) as Device[]
    const legacyKey = LEGACY_DEVICES_KEYS.find(key=>localStorage.getItem(key))
    const legacy = JSON.parse(legacyKey?localStorage.getItem(legacyKey)||'[]':'[]') as Device[]
    if (!legacy.length) return seedDevices
    const merged = new Map(seedDevices.map(device => [device.id, device]))
    legacy.forEach(device => {
      const bundled=merged.get(device.id)
      const id=bundled&&(bundled.brand!==device.brand||bundled.model!==device.model)?safeId(device):device.id
      merged.set(id,{...device,id})
    })
    const devices = Array.from(merged.values())
    localStorage.setItem(DEVICES_KEY, JSON.stringify(devices))
    return devices
  } catch { return seedDevices }
}

export function saveDevices(devices: Device[]) {
  localStorage.setItem(DEVICES_KEY, JSON.stringify(devices))
  window.dispatchEvent(new Event('whattech:devices'))
}

export function resetDevices() { localStorage.removeItem(DEVICES_KEY); window.dispatchEvent(new Event('whattech:devices')) }

export function requestMissingProduct(query: string) {
  const requests = getMissingProducts()
  requests.push({ query, createdAt: new Date().toISOString() })
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests))
}

export function getMissingProducts(): Array<{query:string;createdAt:string}> {
  try { return JSON.parse(localStorage.getItem(REQUESTS_KEY) || '[]') } catch { return [] }
}
