import { seedDevices } from './seedDevices.ts'
import type { Device } from '../types/device.ts'

export const SITE_ORIGIN = 'https://www.askwhattech.com'

export const PUBLIC_ROUTES = [
  '/',
  '/tools',
  '/tools/will-it-work',
  '/tools/fix-my-device',
  '/tools/should-i-upgrade',
  '/tools/repair-or-replace',
  '/tools/whats-it-worth',
  '/tools/what-do-i-need',
  '/tools/what-should-i-buy',
  '/tools/compare',
  '/devices',
  '/forum',
  '/about',
] as const

export function brandSlug(brand: string) {
  return brand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function devicePath(device: Pick<Device, 'brand' | 'id'>) {
  return `/devices/${brandSlug(device.brand)}/${encodeURIComponent(device.id)}`
}

export const staticRoutes = [
  ...PUBLIC_ROUTES,
  ...seedDevices.map(devicePath),
]
