import react from '@vitejs/plugin-react'
import type { IncomingMessage } from 'node:http'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import researchHandler from './api/research.mjs'
import { seedDevices } from './src/data/seedDevices.ts'

const SITE_ORIGIN = 'https://www.askwhattech.com'
const PUBLIC_ROUTES = [
  '/',
  '/tools',
  '/tools/will-it-work',
  '/tools/fix-my-device',
  '/tools/should-i-upgrade',
  '/tools/repair-or-replace',
  '/tools/whats-it-worth',
  '/tools/what-do-i-need',
  '/tools/what-should-i-buy',
  '/tools/compare',
  '/devices',
  '/forum',
  '/about',
] as const

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, character => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;',
  })[character] ?? character)
}

function brandSlug(brand: string) {
  return brand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function staticSitemap() {
  const routeEntries = PUBLIC_ROUTES.map(path => `  <url><loc>${escapeXml(`${SITE_ORIGIN}${path}`)}</loc></url>`)
  const deviceEntries = seedDevices.map(device => {
    const url = `${SITE_ORIGIN}/devices/${brandSlug(device.brand)}/${encodeURIComponent(device.id)}`
    return `  <url><loc>${escapeXml(url)}</loc><lastmod>${escapeXml(device.updatedAt)}</lastmod></url>`
  })

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...routeEntries, ...deviceEntries].join('\n')}\n</urlset>\n`
}

function sitemapIndex() {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap><loc>${SITE_ORIGIN}/pages-sitemap.xml</loc></sitemap>\n  <sitemap><loc>${SITE_ORIGIN}/forum-sitemap.xml</loc></sitemap>\n</sitemapindex>\n`
}

function seoSitemaps(): Plugin {
  return {
    name: 'whattech-seo-sitemaps',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemapIndex() })
      this.emitFile({ type: 'asset', fileName: 'pages-sitemap.xml', source: staticSitemap() })
    },
  }
}

type LocalApiRequest = IncomingMessage & { body?: string }

function localResearchApi(mode:string):Plugin {
  const env=loadEnv(mode,process.cwd(),'')
  for(const key of ['BRAVE_SEARCH_API_KEY','SAFETY_ID_SALT'])if(env[key])process.env[key]=env[key]

  return {
    name:'whattech-local-research-api',
    configureServer(server){
      server.middlewares.use('/api/research',(request,response,next)=>{
        void (async()=>{
          try{
            const localRequest=request as LocalApiRequest
            const chunks:Buffer[]=[]
            let size=0
            for await(const chunk of request){
              const buffer=Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk)
              size+=buffer.length
              if(size>50_000){response.statusCode=413;response.end(JSON.stringify({error:'Research request is too large.'}));return}
              chunks.push(buffer)
            }
            localRequest.body=Buffer.concat(chunks).toString('utf8')
            await researchHandler(localRequest,response)
          }catch(error){next(error)}
        })()
      })
    },
  }
}

export default defineConfig(({mode})=>({plugins:[react(),localResearchApi(mode),seoSitemaps()]}))
