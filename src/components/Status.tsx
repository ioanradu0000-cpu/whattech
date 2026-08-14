import { AlertTriangle, Check, HelpCircle, X } from 'lucide-react'
import type { CompatibilityStatus } from '../types/device'

export function StatusIcon({ status }: {status:CompatibilityStatus}) {
  const Icon = status==='compatible'?Check:status==='partial'?AlertTriangle:status==='incompatible'?X:HelpCircle
  return <span className={`statusIcon ${status}`}><Icon/></span>
}
