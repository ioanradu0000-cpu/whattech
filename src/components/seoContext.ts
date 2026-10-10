import { createContext } from 'react'

export type SeoMetadata = {
  title: string
  description: string
  canonicalUrl: string | null
}

export const SeoCollectorContext = createContext<SeoMetadata | null>(null)
