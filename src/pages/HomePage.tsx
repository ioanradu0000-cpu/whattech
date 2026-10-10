import { ArrowRight, Search } from 'lucide-react'
import { FormEvent, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { SmoothCutFeature } from '../components/SmoothCutFeature'
import { tools } from '../data/tools'
import { useDevices } from '../hooks/useDevices'
import { interpretSearch } from '../services/searchIntent'

export function HomePage(){
  const [query,setQuery]=useState('')
  const devices=useDevices()
  const navigate=useNavigate()
  const intent=useMemo(()=>query.trim()?interpretSearch(devices,query):null,[devices,query])
  function submit(event:FormEvent){event.preventDefault();if(intent)navigate(intent.route)}

  return <main className="simpleHome">
    <Seo title="Know what to do with your tech" description="Find a device, solve a problem, check compatibility, or choose what to buy."/>
    <section className="simpleHero">
      <div className="simpleHeroInner">
        <div><h1>Know what to do<br/>{' with your tech.'}</h1><p>Find your device or describe what you need. WhatTech will take you to the right tool.</p></div>
        <div className="smartSearch"><form onSubmit={submit}><Search/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Try: fix my iPhone 15 charging" aria-label="Search a device or ask a tech question"/><button aria-label="Continue"><ArrowRight/></button></form>{intent?<div className="intentPreview" aria-live="polite"><span>Open <b>{intent.tool}</b></span>{intent.devices.length?<small>{intent.devices.map(device=>`${device.brand} ${device.model}`).join(' + ')} will be selected</small>:<small>We’ll help you choose the right device</small>}</div>:<div className="intentExamples"><span>Examples:</span><button type="button" onClick={()=>setQuery('fix my iPhone 15 charging')}>fix a device</button><button type="button" onClick={()=>setQuery('compare iPhone 15 vs Galaxy S24')}>compare devices</button></div>}</div>
      </div>
    </section>

    <section className="simpleHomeBody">
      <SmoothCutFeature/>
      <section className="homeToolsDirectory" aria-labelledby="home-tools-title">
        <header>
          <div><h2 id="home-tools-title">Choose what you need to do</h2><p>Every tool asks focused questions and gives you a practical next step.</p></div>
          <span>8 tools</span>
        </header>
        <div className="homeToolsGrid">{tools.map(({icon:Icon,...tool},index)=><Link to={tool.to} className={`homeToolCard ${tool.tone}`} key={tool.id}>
          <div className="homeToolTop"><span className="homeToolIcon"><Icon/></span><small>{String(index+1).padStart(2,'0')} · {tool.group}</small></div>
          <div><h3>{tool.title}</h3><p>{tool.description}</p></div>
          <b>{tool.action}<ArrowRight/></b>
        </Link>)}</div>
      </section>
    </section>
  </main>
}
