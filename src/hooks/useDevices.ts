import { useEffect, useState } from 'react'
import { seedDevices } from '../data/seedDevices'
import { getDevices } from '../services/storage'

export function useDevices() {
  const [devices, setDevices] = useState(seedDevices)
  useEffect(() => {
    const refresh = () => setDevices(getDevices())
    refresh()
    window.addEventListener('whattech:devices', refresh)
    return () => window.removeEventListener('whattech:devices', refresh)
  }, [])
  return devices
}
