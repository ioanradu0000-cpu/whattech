import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distDirectory = path.join(projectRoot, 'dist')
const serverDirectory = path.join(projectRoot, 'dist-ssr')
const serverEntry = path.join(serverDirectory, 'entry-server.js')
const templatePath = path.join(distDirectory, 'index.html')

const homeStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'WhatTech',
  url: 'https://www.askwhattech.com/',
  applicationCategory: 'UtilitiesApplication',
  description: 'A consumer technology compatibility, diagnosis, and decision platform.',
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character])
}

function outputPath(route) {
  return route === '/'
    ? path.join(distDirectory, 'index.html')
    : path.join(distDirectory, `${route.slice(1)}.html`)
}

function documentForRoute(template, body, seo, includeHomeStructuredData = false) {
  const head = [
    `<meta name="description" content="${escapeHtml(seo.description)}" />`,
    `<meta property="og:title" content="${escapeHtml(seo.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(seo.description)}" />`,
  ]
  if (seo.canonicalUrl) {
    head.push(`<meta property="og:url" content="${escapeHtml(seo.canonicalUrl)}" />`)
    head.push(`<link rel="canonical" href="${escapeHtml(seo.canonicalUrl)}" />`)
  }
  if (includeHomeStructuredData) {
    head.push(`<script type="application/ld+json">${JSON.stringify(homeStructuredData).replace(/</g, '\\u003c')}</script>`)
  }

  const withTitle = template.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(seo.title)}</title>`)
  const withHead = withTitle.replace(/<meta name="whattech-prerender"[^>]*>/, head.join('\n    '))
  const withBody = withHead.replace('<div id="root"></div>', `<div id="root">${body}</div>`)
  if (withBody === template || withBody.includes('name="whattech-prerender"')) {
    throw new Error('The Vite HTML template did not contain the expected prerender markers.')
  }
  return withBody
}

try {
  const template = await readFile(templatePath, 'utf8')
  const { render, staticRoutes } = await import(pathToFileURL(serverEntry).href)

  for (const route of staticRoutes) {
    const rendered = await render(route)
    const destination = outputPath(route)
    await mkdir(path.dirname(destination), { recursive: true })
    await writeFile(destination, documentForRoute(template, rendered.html, rendered.seo, route === '/'))
  }

  const forumFallback = await render('/forum/__loading__')
  await writeFile(
    path.join(distDirectory, 'forum-question.html'),
    documentForRoute(template, forumFallback.html, forumFallback.seo),
  )

  const appShellSeo = {
    title: 'WhatTech',
    description: 'Practical tools and structured device information for better technology decisions.',
    canonicalUrl: null,
  }
  await writeFile(path.join(distDirectory, 'app-shell.html'), documentForRoute(template, '', appShellSeo))

  await import('./verify-prerender.mjs')
} finally {
  await rm(serverDirectory, { recursive: true, force: true })
}
