import { useEffect } from 'react'

const SITE_ORIGIN = 'https://www.askwhattech.com'

export function Seo({ title, description }: { title: string; description: string }) {
  useEffect(() => {
    document.title = `${title} | WhatTech`
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) { meta = document.createElement('meta'); meta.setAttribute('name','description'); document.head.append(meta) }
    meta.setAttribute('content', description)
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel','canonical'); document.head.append(canonical) }
    const canonicalUrl = new URL(window.location.pathname, SITE_ORIGIN).href
    canonical.setAttribute('href', canonicalUrl)
    let openGraphUrl = document.querySelector('meta[property="og:url"]')
    if (!openGraphUrl) { openGraphUrl = document.createElement('meta'); openGraphUrl.setAttribute('property','og:url'); document.head.append(openGraphUrl) }
    openGraphUrl.setAttribute('content', canonicalUrl)
  }, [title, description])
  return null
}
