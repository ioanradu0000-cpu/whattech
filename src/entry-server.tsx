import { PassThrough } from 'node:stream'
import { StrictMode } from 'react'
import { renderToPipeableStream } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { AppRoutes } from './App'
import { SeoCollectorContext, type SeoMetadata } from './components/seoContext'

export { staticRoutes } from './data/staticRoutes'

export function render(url: string) {
  const seo: SeoMetadata = {
    title: 'WhatTech',
    description: 'Practical tools and structured device information for better technology decisions.',
    canonicalUrl: null,
  }

  return new Promise<{ html: string; seo: SeoMetadata }>((resolve, reject) => {
    const output = new PassThrough()
    let html = ''
    let renderError: unknown

    output.setEncoding('utf8')
    output.on('data', chunk => { html += chunk })
    output.on('end', () => renderError ? reject(renderError) : resolve({ html, seo }))
    output.on('error', reject)

    const stream = renderToPipeableStream(
      <StrictMode>
        <StaticRouter location={url}>
          <SeoCollectorContext.Provider value={seo}>
            <AppRoutes />
          </SeoCollectorContext.Provider>
        </StaticRouter>
      </StrictMode>,
      {
        onAllReady() {
          if (renderError) {
            stream.abort()
            reject(renderError)
            return
          }
          stream.pipe(output)
        },
        onShellError: reject,
        onError(error) { renderError ??= error },
      },
    )
  })
}
