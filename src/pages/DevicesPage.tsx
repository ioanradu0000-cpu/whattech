import { ChevronDown, ChevronRight, Search, SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { categories, categoryById } from '../data/catalog'
import { useDevices } from '../hooks/useDevices'
import { searchDevices } from '../services/search'
import type { Device, DeviceCategory } from '../types/device'

const INITIAL_RESULTS=30

function deviceRoute(device:Device){
  const brand=device.brand.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
  return `/devices/${brand}/${device.id}`
}

export function DevicesPage(){
  const devices=useDevices()
  const [params,setParams]=useSearchParams()
  const query=params.get('q')||''
  const category=(params.get('category')||'') as DeviceCategory|''
  const brand=params.get('brand')||''
  const [sort,setSort]=useState('newest')
  const [visibleCount,setVisibleCount]=useState(INITIAL_RESULTS)
  const [showAllCategories,setShowAllCategories]=useState(false)

  const categoryDevices=useMemo(()=>category?devices.filter(device=>device.category===category):devices,[category,devices])
  const brands=useMemo(()=>Array.from(new Set(categoryDevices.map(device=>device.brand))).sort(),[categoryDevices])
  const results=useMemo(()=>{
    const searched=query?searchDevices(devices,query,devices.length):devices
    const filtered=searched.filter(device=>(!category||device.category===category)&&(!brand||device.brand===brand))
    return filtered.sort((a,b)=>sort==='oldest'?a.releaseYear-b.releaseYear:sort==='name'?`${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`):b.releaseYear-a.releaseYear||`${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`))
  },[brand,category,devices,query,sort])

  const updateFilter=(next:Record<string,string>)=>{
    const updated=new URLSearchParams(params)
    Object.entries(next).forEach(([key,value])=>value?updated.set(key,value):updated.delete(key))
    setVisibleCount(INITIAL_RESULTS)
    setParams(updated)
  }
  const clearFilters=()=>{setVisibleCount(INITIAL_RESULTS);setParams({})}
  const shownCategories=showAllCategories?categories:categories.slice(0,12)

  return <main className="devicesPage">
    <Seo title="Device Database" description="Search and browse WhatTech’s structured device catalogue by category, brand, and model."/>
    <header><h1>Find your device</h1><p>Search by model or browse the complete catalogue.</p><label className="catalogSearch"><Search/><input value={query} onChange={event=>updateFilter({q:event.target.value})} placeholder="Search Galaxy S25, MacBook M4, PS5…" aria-label="Search devices"/>{query?<button onClick={()=>updateFilter({q:''})} aria-label="Clear search"><X/></button>:null}</label></header>
    <section className="catalogWorkspace">
      <aside className="catalogCategories"><div><small>Categories</small><button className={!category?'active':''} onClick={()=>updateFilter({category:'',brand:''})}><span>All devices</span><b>{devices.length}</b></button>{shownCategories.map(item=><button className={category===item.id?'active':''} onClick={()=>updateFilter({category:item.id,brand:''})} key={item.id}><span>{item.label}</span><b>{devices.filter(device=>device.category===item.id).length}</b></button>)}</div>{categories.length>12?<button className="moreCategoryButton" onClick={()=>setShowAllCategories(current=>!current)}>{showAllCategories?'Show fewer':'More categories'}<ChevronDown className={showAllCategories?'open':''}/></button>:null}</aside>
      <div className="catalogResults">
        <div className="catalogToolbar"><div><h2>{category?categoryById.get(category)?.label:'All devices'}</h2><span>{results.length} {results.length===1?'device':'devices'}</span></div><div className="catalogFilters"><label><SlidersHorizontal/><span>Category</span><select value={category} onChange={event=>updateFilter({category:event.target.value,brand:''})}><option value="">All categories</option>{categories.map(item=><option value={item.id} key={item.id}>{item.label}</option>)}</select></label><label><span>Brand</span><select value={brand} onChange={event=>updateFilter({brand:event.target.value})}><option value="">All brands</option>{brands.map(item=><option key={item}>{item}</option>)}</select></label><label><span>Sort</span><select value={sort} onChange={event=>{setSort(event.target.value);setVisibleCount(INITIAL_RESULTS)}}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="name">Name A–Z</option></select></label>{query||category||brand?<button className="clearFilters" onClick={clearFilters}><X/>Clear filters</button>:null}</div></div>
        <div className="catalogTableHead"><span>Device</span><span>Category</span><span>Year</span><span>Ports</span><span>Confidence</span><i/></div>
        <div className="catalogModels">{results.slice(0,visibleCount).map(device=><Link to={deviceRoute(device)} key={device.id}><span className={`deviceMark ${device.category}`}>{device.brand[0]}</span><div className="catalogDeviceName"><small>{device.subcategory||categoryById.get(device.category)?.label}</small><h2>{device.brand} {device.model}</h2><p>{device.ports.slice(0,3).join(' · ')||'See device details'}</p></div><span className="catalogCell">{categoryById.get(device.category)?.shortLabel}</span><span className="catalogCell">{device.releaseYear}</span><span className="catalogCell">{device.ports.slice(0,3).join(', ')||'—'}</span><span className={`catalogConfidence ${device.confidence}`}>{device.confidence}</span><ChevronRight/></Link>)}</div>
        {!results.length?<div className="catalogEmpty"><Search/><h2>No matching devices</h2><p>Try a shorter model name, remove a filter, or browse another category.</p><button onClick={clearFilters}>Clear all filters</button></div>:null}
        {visibleCount<results.length?<button className="loadMoreDevices" onClick={()=>setVisibleCount(count=>count+INITIAL_RESULTS)}>Show {Math.min(INITIAL_RESULTS,results.length-visibleCount)} more devices</button>:null}
        <div className="catalogRequest"><span>Can’t find your device?</span><Link to="/tools/fix-my-device">Search it inside a tool or request it</Link></div>
      </div>
    </section>
  </main>
}
