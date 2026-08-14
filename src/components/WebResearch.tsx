import { ExternalLink, MessageSquareText, RefreshCw, Search, ShieldCheck } from 'lucide-react'
import type { ResearchState } from '../types/research'

function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return 'community source'
  }
}

export function WebResearch({ state, onStart, onRetry }: { state: ResearchState; onStart: () => void; onRetry: () => void }) {
  return <section className="webResearch" aria-live="polite">
    <header>
      <span><MessageSquareText /></span>
      <div><small>Community Search</small><h3>Reddit and forum posts about this problem</h3></div>
    </header>

    {state.status === 'idle' ? <div className="communityStart">
      <div><b>See what other owners posted</b><p>We’ll search the exact device, selected issue, and symptom description across Reddit and technical forums, then remove pages that do not mention the problem.</p></div>
      <button className="communityButton" onClick={onStart}><Search />Search Community</button>
    </div> : null}

    {state.status === 'loading' ? <div className="researchLoading"><RefreshCw /><div><b>Finding relevant community posts…</b><p>Searching Reddit and technical forums, then filtering duplicate and unrelated results.</p></div></div> : null}

    {state.status === 'error' ? <div className="researchError"><p>{state.message}</p><button onClick={onRetry}><RefreshCw />Try Community Search again</button></div> : null}

    {state.status === 'success' ? <div className="researchComplete">
      <div className="communityResultsHead">
        <div><b>{state.data.sources.length} relevant {state.data.sources.length === 1 ? 'post' : 'posts'} found</b>{state.data.cacheStatus !== 'fresh' ? <span className="cacheBadge">Cached result</span> : null}</div>
        <p>These are search-result excerpts. Open a post to read its full context, replies, and date.</p>
      </div>

      {state.data.sources.length ? <div className="communityPostList">{state.data.sources.map(source => <article key={source.url}>
        <div className="communityPostMeta"><span>{source.id}</span><small>{source.sourceType === 'reddit' ? 'Reddit' : 'Forum'} · {hostname(source.url)}</small></div>
        <h4>{source.title}</h4>
        <p>{source.snippet}</p>
        <a href={source.url} target="_blank" rel="noreferrer">Open original post <ExternalLink /></a>
      </article>)}</div> : <div className="communityNoResults"><b>No close community matches found</b><p>Try a more specific issue description or choose a different symptom.</p></div>}

      <details className="searchTransparency"><summary>How this was searched</summary>{state.data.queries.map(query => <code key={query}>{query}</code>)}<small>Saved for 24 hours by device, issue, and symptom description to avoid repeat Brave API requests.</small></details>
    </div> : null}

    <footer><ShieldCheck /><p>Community posts are anecdotal experiences, not verified technical facts or a diagnosis. Check the full discussion and follow official safety guidance before trying a suggested fix.</p></footer>
  </section>
}
