export type DeviceCategory = 'phone' | 'laptop' | 'desktop' | 'component' | 'tablet' | 'monitor' | 'tv' | 'console' | 'handheld' | 'audio' | 'camera' | 'charger' | 'cable' | 'adapter' | 'dock' | 'storage' | 'networking' | 'smart-home' | 'wearable' | 'peripheral' | 'other'

export type DeviceCategoryDefinition = {
  id: DeviceCategory
  label: string
  shortLabel: string
  subcategories?: string[]
}

export type Device = {
  id: string
  brand: string
  model: string
  category: DeviceCategory
  subcategory?: string
  releaseYear: number
  aliases: string[]
  ports: string[]
  protocols: string[]
  maxInputWatts?: number
  maxOutputWatts?: number
  display?: { maxResolution: string; maxRefreshHz: number; hdmiVersion?: string }
  estimatedValueEur: [number, number]
  estimatedLifespanYears: number
  repairability: 'easy' | 'moderate' | 'professional'
  softwareSupportUntil?: number
  source: string
  updatedAt: string
  confidence: 'high' | 'medium' | 'low'
  highlights?: Record<string, string | number>
}

export type CompatibilityStatus = 'compatible' | 'partial' | 'incompatible' | 'unknown'

export type CompatibilityResult = {
  status: CompatibilityStatus
  confidence: Device['confidence']
  headline: string
  works: string[]
  limitations: string[]
  safety: string[]
  requiredAdapters: string[]
  explanation: string
  assumptions: string[]
  dataQuality: string
}

export type DiagnosisResult = {
  title: string
  confidence: Device['confidence']
  causes: Array<{ label: string; probability: number }>
  steps: string[]
  safety?: string
  repairCost: [number, number]
  professionalRecommended: boolean
  evidence: string[]
  uncertainty: string
}

export type DecisionAction = 'KEEP' | 'FIX' | 'UPGRADE' | 'REPLACE' | 'SELL' | 'BUY USED' | 'WAIT'

export type DecisionResult = {
  action: DecisionAction
  modifier?: string
  reason: string
  score: number
  factors: string[]
  nextStep: string
  counterpoint: string
}
