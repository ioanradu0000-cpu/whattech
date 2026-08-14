import { ArrowRight, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { tools } from '../data/tools'

const groups=['All tools','Solve a problem','Check something','Make a decision','Find something'] as const
const examples:Record<string,string>={compatibility:'Check cables, chargers, docks, displays, and accessories.',fix:'Diagnose charging, battery, display, heat, boot, and connection problems.',upgrade:'Compare your current device with the model you are considering.',repair:'Weigh a repair quote against value, age, and replacement cost.',value:'Estimate private-sale, trade-in, and quick-sale ranges.',need:'Build a connection path for displays, audio, storage, or charging.',buy:'Get a shortlist based on use, budget, portability, and battery.',compare:'See the real-world winner across performance, battery, display, and more.'}

export function ToolsPage(){
  const [query,setQuery]=useState('')
  const [group,setGroup]=useState<(typeof groups)[number]>('All tools')
  const visible=useMemo(()=>{
    const terms=query.trim().toLowerCase().split(/\s+/).filter(Boolean)
    return tools.filter(tool=>{
      const content=`${tool.title} ${tool.description} ${tool.action} ${examples[tool.id]}`.toLowerCase()
      return (group==='All tools'||tool.group===group)&&terms.every(term=>content.includes(term))
    })
  },[group,query])

  return <main className="directoryPage">
    <Seo title="All Tech Tools" description="Choose a purpose-built WhatTech tool for troubleshooting, compatibility, upgrades, value, accessories, buying, or comparisons."/>
    <header><h1>Choose what you need to do</h1><p>Search by the task in your head. Each tool guides you from device selection to a clear next step.</p><label className="toolSearch"><Search/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Try: fix a charging problem or compare two phones" aria-label="Search tools"/>{query?<button onClick={()=>setQuery('')} aria-label="Clear tool search"><X/></button>:null}</label></header>
    <nav className="toolFilters" aria-label="Filter tools">{groups.map(item=><button className={group===item?'active':''} onClick={()=>setGroup(item)} key={item}>{item}<span>{item==='All tools'?tools.length:tools.filter(tool=>tool.group===item).length}</span></button>)}</nav>
    <div className="directorySummary"><h2>{group}</h2><span>{visible.length} {visible.length===1?'tool':'tools'}</span></div>
    <section className="directoryGrid">{visible.map(({icon:Icon,...tool},index)=><Link to={tool.to} className={`directoryTool ${tool.tone}`} key={tool.id}><div className="directoryToolTop"><span><Icon/></span><small>{String(index+1).padStart(2,'0')} · {tool.group}</small></div><div><h3>{tool.title}</h3><p>{tool.description}</p><small>{examples[tool.id]}</small></div><b>{tool.action}<ArrowRight/></b></Link>)}</section>
    {!visible.length?<section className="toolEmpty"><Search/><h2>No tools match “{query}”</h2><p>Try words like fix, compare, charger, value, upgrade, or buy.</p><button onClick={()=>{setQuery('');setGroup('All tools')}}>Show every tool</button></section>:null}
  </main>
}
