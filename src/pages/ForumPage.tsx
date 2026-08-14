import { CheckCircle2, ChevronRight, CircleDot, Eye, Info, ListFilter, MessageCircle, MessageSquarePlus, Search, ShieldCheck, Users } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ForumDeviceInput } from '../components/ForumDeviceInput'
import { ForumPostForm } from '../components/ForumPostForm'
import { forumTopicLabel, forumTopics } from '../data/forumTopics'
import { Seo } from '../components/Seo'
import { useDevices } from '../hooks/useDevices'
import { listForumPosts } from '../services/forum'
import type { Device } from '../types/device'
import type { ForumPost, ForumStatus, ForumTopic } from '../types/forum'

type SortMode='activity'|'newest'|'replies'
const relativeTime=new Intl.RelativeTimeFormat('en',{numeric:'auto'})
function timeAgo(value:string){
  const seconds=Math.round((new Date(value).getTime()-Date.now())/1000)
  if(Math.abs(seconds)<60)return relativeTime.format(seconds,'second')
  const minutes=Math.round(seconds/60);if(Math.abs(minutes)<60)return relativeTime.format(minutes,'minute')
  const hours=Math.round(minutes/60);if(Math.abs(hours)<24)return relativeTime.format(hours,'hour')
  return relativeTime.format(Math.round(hours/24),'day')
}

export function ForumPage(){
  const devices=useDevices();const navigate=useNavigate()
  const [posts,setPosts]=useState<ForumPost[]>([])
  const [loading,setLoading]=useState(true);const [error,setError]=useState('');const [asking,setAsking]=useState(false)
  const [query,setQuery]=useState('');const [device,setDevice]=useState<Device>();const [topic,setTopic]=useState<'all'|ForumTopic>('all');const [status,setStatus]=useState<'all'|ForumStatus>('all');const [sort,setSort]=useState<SortMode>('activity')
  const searchInput=useRef<HTMLInputElement>(null)
  const closeForm=useCallback(()=>setAsking(false),[])

  const loadPosts=useCallback(()=>{setLoading(true);setError('');return listForumPosts().then(result=>setPosts(result.posts)).catch(caught=>setError(caught instanceof Error?caught.message:'The forum could not load.')).finally(()=>setLoading(false))},[])
  useEffect(()=>{let active=true;listForumPosts().then(result=>{if(active)setPosts(result.posts)}).catch(caught=>{if(active)setError(caught instanceof Error?caught.message:'The forum could not load.')}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[])
  useEffect(()=>{function focusSearch(event:KeyboardEvent){const target=event.target as HTMLElement;if(event.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(target.tagName)){event.preventDefault();searchInput.current?.focus()}}window.addEventListener('keydown',focusSearch);return()=>window.removeEventListener('keydown',focusSearch)},[])

  const filtered=useMemo(()=>{
    const normalized=query.trim().toLowerCase()
    return posts.filter(post=>(!normalized||`${post.title} ${post.body} ${post.device.brand} ${post.device.model}`.toLowerCase().includes(normalized))&&(!device||post.device.id===device.id)&&(topic==='all'||post.topic===topic)&&(status==='all'||post.status===status)).sort((a,b)=>sort==='replies'?b.replyCount-a.replyCount:sort==='newest'?Date.parse(b.createdAt)-Date.parse(a.createdAt):Date.parse(b.updatedAt)-Date.parse(a.updatedAt))
  },[device,posts,query,sort,status,topic])
  const popularDevices=useMemo(()=>Object.values(posts.reduce<Record<string,{device:ForumPost['device'];count:number}>>((items,post)=>{items[post.device.id]??={device:post.device,count:0};items[post.device.id].count++;return items},{})).sort((a,b)=>b.count-a.count).slice(0,5),[posts])
  const activeFilters=Boolean(query||device||topic!=='all'||status!=='all')
  function clearFilters(){setQuery('');setDevice(undefined);setTopic('all');setStatus('all')}

  return <main className="forumPage">
    <Seo title="Community Forum" description="Ask device-specific technology questions, browse answers, and filter community discussions by device."/>
    <header className="forumHero"><div><h1>Community Forum</h1><p>Ask about your device. Learn from people who use it.</p></div><button className="actionButton forumAskButton" onClick={()=>setAsking(true)}><MessageSquarePlus/>Ask a question</button></header>
    <label className="forumSearch"><Search/><input ref={searchInput} value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search questions, symptoms, or device names" aria-label="Search forum discussions"/><kbd>/</kbd></label>
    <section className="forumWorkspace">
      <div className="forumMain">
        <div className="forumFilters">
          <label><span>Category</span><select value={topic} onChange={event=>setTopic(event.target.value as 'all'|ForumTopic)}><option value="all">All categories</option>{forumTopics.map(item=><option value={item.id} key={item.id}>{item.label}</option>)}</select></label>
          <label><span>Status</span><select value={status} onChange={event=>setStatus(event.target.value as 'all'|ForumStatus)}><option value="all">All statuses</option><option value="open">Open</option><option value="solved">Solved</option></select></label>
          <label><span>Sort</span><select value={sort} onChange={event=>setSort(event.target.value as SortMode)}><option value="activity">Latest activity</option><option value="newest">Newest questions</option><option value="replies">Most responses</option></select></label>
          {activeFilters?<button onClick={clearFilters}>Clear filters</button>:null}
        </div>
        <div className="forumListHeading"><span>Status</span><span>Discussion</span><span>Responses</span><span>Views</span></div>
        {loading?<div className="forumEmpty" aria-live="polite"><div className="forumLoader"/><h2>Loading discussions…</h2></div>:error?<div className="forumEmpty" role="alert"><Info/><h2>Forum temporarily unavailable</h2><p>{error}</p><button type="button" className="secondaryAction" onClick={()=>void loadPosts()}>Try again</button></div>:filtered.length?<div className="forumPostList">
          {filtered.map(post=><Link to={`/forum/${post.id}`} className="forumPostRow" key={post.id}>
            <span className={`forumStatus ${post.status}`}>{post.status==='solved'?<CheckCircle2/>:<CircleDot/>}<b>{post.status==='solved'?'Solved':'Open'}</b></span>
            <div className="forumDiscussion"><small>{post.device.brand} {post.device.model} · {forumTopicLabel.get(post.topic)}</small><h2>{post.title}</h2><p>{post.body}</p><span>by {post.authorName} · {timeAgo(post.updatedAt)}</span></div>
            <span className="forumCount"><MessageCircle/><b>{post.replyCount}</b><small>responses</small></span>
            <span className="forumCount"><Eye/><b>{post.viewCount}</b><small>views</small></span>
            <ChevronRight className="forumRowArrow"/>
          </Link>)}
        </div>:<div className="forumEmpty"><ListFilter/><h2>{posts.length?'No discussions match':'No questions yet'}</h2><p>{posts.length?'Try clearing a filter, or ask the first question for this device.':'Be the first real person to start a device discussion.'}</p><button className="actionButton" onClick={()=>setAsking(true)}>Ask a question</button></div>}
      </div>
      <aside className="forumRail">
        <section><h2>Filter by your device</h2><ForumDeviceInput devices={devices} value={device} onChange={setDevice} label="Search the device catalog"/>{device?<p className="forumSelectedFilter"><CheckCircle2/>Showing questions about {device.brand} {device.model}.</p>:null}</section>
        <button className={status==='open'?'forumUnanswered active':'forumUnanswered'} onClick={()=>setStatus(status==='open'?'all':'open')}><MessageCircle/><span><b>Open questions</b><small>Find a discussion that still needs help</small></span><ChevronRight/></button>
        {popularDevices.length?<section className="forumPopular"><h2>Active devices</h2>{popularDevices.map(item=><button key={item.device.id} onClick={()=>setDevice(devices.find(candidate=>candidate.id===item.device.id))}><span className={`deviceMark ${item.device.category}`}>{item.device.brand[0]}</span><span><b>{item.device.brand} {item.device.model}</b><small>{item.count} {item.count===1?'discussion':'discussions'}</small></span><ChevronRight/></button>)}</section>:null}
        <section className="forumGuidelines"><h2>Community basics</h2><p><Users/>Be respectful and stay on topic.</p><p><Search/>Search before starting a duplicate.</p><p><ShieldCheck/>Never share serial numbers or personal data.</p></section>
      </aside>
    </section>
    {asking?<ForumPostForm devices={devices} onClose={closeForm} onCreated={post=>navigate(`/forum/${post.id}`)}/>:null}
  </main>
}
