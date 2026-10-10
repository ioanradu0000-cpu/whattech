import { useContext, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { SITE_ORIGIN } from '../data/staticRoutes'
import { SeoCollectorContext } from './seoContext'

function upsertMeta(attribute: 'name' | 'property', key: string, content: string) {
  let meta = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute(attribute, key)
    document.head.append(meta)
  }
  meta.content = content
}

function updateCanonical(canonicalUrl: string | null) {
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  const openGraphUrl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]')
  if (!canonicalUrl) {
    canonical?.remove()
    openGraphUrl?.remove()
    return
  }
  const link = canonical ?? document.createElement('link')
  link.rel = 'canonical'
  link.href = canonicalUrl
  if (!canonical) document.head.append(link)
  upsertMeta('property', 'og:url', canonicalUrl)
}

export function Seo({ title, description, canonical = true }: { title: string; description: string; canonical?: boolean }) {
  const location = useLocation()
  const fullTitle = `${title} | WhatTech`
  const canonicalUrl = canonical ? new URL(location.pathname, SITE_ORIGIN).href : null
  const collector = useContext(SeoCollectorContext)

  if (collector) Object.assign(collector, { title: fullTitle, description, canonicalUrl })

  useEffect(() => {
    document.title = fullTitle
    upsertMeta('name', 'description', description)
    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', description)
    updateCanonical(canonicalUrl)
  }, [canonicalUrl, description, fullTitle])

  return null
}
