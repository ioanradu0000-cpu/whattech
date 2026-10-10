import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distDirectory = path.join(projectRoot, 'dist')
const expectedOrigin = 'https://www.askwhattech.com'

function pagePath(pathname) {
  return pathname === '/'
    ? path.join(distDirectory, 'index.html')
    : path.join(distDirectory, `${pathname.slice(1)}.html`)
}

function requirePattern(html, pattern, message) {
  const match = html.match(pattern)
  if (!match) throw new Error(message)
  return match[1]
}

const sitemap = await readFile(path.join(distDirectory, 'pages-sitemap.xml'), 'utf8')
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]))
if (!urls.length) throw new Error('The static sitemap contains no URLs.')

const seenCanonicals = new Set()
for (const url of urls) {
  if (url.origin !== expectedOrigin) throw new Error(`Unexpected sitemap origin: ${url.href}`)
  const html = await readFile(pagePath(url.pathname), 'utf8')
  const title = requirePattern(html, /<title>([^<]+)<\/title>/, `Missing title for ${url.pathname}`)
  const description = requirePattern(html, /<meta name="description" content="([^"]+)" \/>/, `Missing description for ${url.pathname}`)
  const canonical = requirePattern(html, /<link rel="canonical" href="([^"]+)" \/>/, `Missing canonical for ${url.pathname}`)
  const openGraphTitle = requirePattern(html, /<meta property="og:title" content="([^"]+)" \/>/, `Missing Open Graph title for ${url.pathname}`)
  const openGraphDescription = requirePattern(html, /<meta property="og:description" content="([^"]+)" \/>/, `Missing Open Graph description for ${url.pathname}`)
  const openGraphUrl = requirePattern(html, /<meta property="og:url" content="([^"]+)" \/>/, `Missing Open Graph URL for ${url.pathname}`)

  if (title === 'WhatTech' || !description) throw new Error(`Generic metadata remained on ${url.pathname}`)
  if (openGraphTitle !== title || openGraphDescription !== description) throw new Error(`Open Graph metadata differs on ${url.pathname}`)
  if (canonical !== url.href || openGraphUrl !== url.href) throw new Error(`Canonical metadata differs from the sitemap on ${url.pathname}`)
  if (seenCanonicals.has(canonical)) throw new Error(`Duplicate canonical generated for ${url.pathname}`)
  seenCanonicals.add(canonical)
  if (html.includes('<div id="root"></div>') || !html.includes('<main')) throw new Error(`Initial page content is empty for ${url.pathname}`)
  if (url.pathname.split('/').length > 3 && url.pathname.startsWith('/devices/') && !html.includes('Important specifications')) {
    throw new Error(`Device specifications are missing from ${url.pathname}`)
  }
  const hasHomeStructuredData = html.includes('<script type="application/ld+json">')
  if ((url.pathname === '/') !== hasHomeStructuredData) throw new Error(`Homepage structured data leaked on ${url.pathname}`)
}

const forumFallback = await readFile(path.join(distDirectory, 'forum-question.html'), 'utf8')
if (forumFallback.includes('rel="canonical"') || forumFallback.includes('property="og:url"')) {
  throw new Error('The dynamic forum fallback must not contain a static canonical URL.')
}
if (!forumFallback.includes('Loading question')) throw new Error('The dynamic forum fallback has no meaningful loading content.')

console.log(`Verified ${urls.length} prerendered sitemap URLs with populated HTML and matching metadata.`)
