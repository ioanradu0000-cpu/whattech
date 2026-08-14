export type ResearchSource = {
  id: number
  title: string
  url: string
  snippet: string
  sourceType: 'reddit' | 'forum'
}

export type ResearchResult = {
  sources: ResearchSource[]
  queries: string[]
  searchedAt: string
  cacheStatus: 'fresh' | 'server' | 'browser'
}

export type ResearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: ResearchResult }
  | { status: 'error'; message: string }
