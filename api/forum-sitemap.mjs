const SITE_ORIGIN = 'https://www.askwhattech.com'
const DEFAULT_API_ORIGIN = 'https://whattech-api.onrender.com'

function escapeXml(value) {
  return String(value).replace(/[<>&'"]/g, character => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;',
  })[character] ?? character)
}

function sitemap(posts = []) {
  const entries = posts
    .filter(post => post?.id)
    .map(post => {
      const location = `${SITE_ORIGIN}/forum/${encodeURIComponent(post.id)}`
      const lastModified = post.updatedAt ? `<lastmod>${escapeXml(post.updatedAt)}</lastmod>` : ''
      return `  <url><loc>${escapeXml(location)}</loc>${lastModified}</url>`
    })

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`
}

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    response.status(405).send('Method Not Allowed')
    return
  }

  response.setHeader('Content-Type', 'application/xml; charset=utf-8')
  response.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')

  try {
    const configuredOrigin = process.env.VITE_API_URL?.trim().replace(/\/$/, '')
    const apiOrigin = configuredOrigin || DEFAULT_API_ORIGIN
    const upstream = await fetch(`${apiOrigin}/api/forum`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(50_000),
    })

    if (!upstream.ok) throw new Error(`Forum API returned ${upstream.status}`)
    const data = await upstream.json()
    response.status(200).send(sitemap(Array.isArray(data.posts) ? data.posts : []))
  } catch (error) {
    console.error('Forum sitemap generation failed', error)
    response.setHeader('Cache-Control', 'no-store')
    response.status(502).send(sitemap())
  }
}
