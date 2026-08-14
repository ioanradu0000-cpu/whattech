import { useEffect, useState } from 'react'
import { getDevices } from '../services/storage'

export function useDevices() {
  const [devices, setDevices] = useState(getDevices)
  useEffect(() => {
    const refresh = () => setDevices(getDevices())
    window.addEventListener('whattech:devices', refresh)
    return () => window.removeEventListener('whattech:devices', refresh)
  }, [])
  return devices
}
