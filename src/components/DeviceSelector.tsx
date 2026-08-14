import { Cable, Camera, ChevronDown, ChevronRight, CircuitBoard, Gamepad2, Headphones, Laptop, Monitor, Plug, Search, Smartphone, Tablet, Tv, Watch, Wifi, X } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { categories, categoryById } from '../data/catalog'
import { searchDevices } from '../services/search'
import { requestMissingProduct } from '../services/storage'
import type { Device, DeviceCategory } from '../types/device'

const categoryIcons: Partial<Record<DeviceCategory, typeof Smartphone>> = { phone:Smartphone,laptop:Laptop,desktop:Monitor,component:CircuitBoard,tablet:Tablet,monitor:Monitor,tv:Tv,console:Gamepad2,handheld:Gamepad2,audio:Headphones,camera:Camera,charger:Plug,cable:Cable,adapter:Plug,dock:Plug,networking:Wifi,wearable:Watch }

type DeviceSelectorProps = {
  devices: Device[]
  value?: Device
  onChange: (device?: Device) => void
  label: string
  allowedCategories?: DeviceCategory[]
  compact?: boolean
}

export function DeviceSelector({ devices, value, onChange, label, allowedCategories, compact=false }: DeviceSelectorProps) {
  const [query,setQuery]=useState('')
  const [category,setCategory]=useState<DeviceCategory|undefined>(value?.category)
  const [brand,setBrand]=useState<string|undefined>(value?.brand)
  const [requested,setRequested]=useState(false)
  const [showAllCategories,setShowAllCategories]=useState(false)
  const [browsing,setBrowsing]=useState(!value)
  const searchInput=useRef<HTMLInputElement>(null)
  const visibleCategories=useMemo(()=>categories.filter(item=>!allowedCategories||allowedCategories.includes(item.id)),[allowedCategories])
  const categoryDevices=useMemo(()=>category?devices.filter(device=>device.category===category):[],[category,devices])
  const brands=useMemo(()=>Array.from(new Set(categoryDevices.map(device=>device.brand))).sort(),[categoryDevices])
  const models=useMemo(()=>brand?categoryDevices.filter(device=>device.brand===brand):categoryDevices,[brand,categoryDevices])
  const results=useMemo(()=>query?searchDevices(devices.filter(device=>!allowedCategories||allowedCategories.includes(device.category)),query,8):[],[allowedCategories,devices,query])
  const shownCategories=useMemo(()=>{
    if(showAllCategories||visibleCategories.length<=5)return visibleCategories
    const preferredCategories:DeviceCategory[]=['phone','laptop','monitor','desktop','other']
    const preferred=preferredCategories.map(id=>visibleCategories.find(item=>item.id===id)).filter((item):item is (typeof visibleCategories)[number]=>Boolean(item))
    const first=[...preferred,...visibleCategories.filter(item=>!preferred.some(preferredItem=>preferredItem.id===item.id))].slice(0,5)
    const selected=visibleCategories.find(item=>item.id===category)
    return selected&&!first.some(item=>item.id===selected.id)?[...first.slice(0,4),selected]:first
  },[category,showAllCategories,visibleCategories])

  function choose(device:Device){onChange(device);setCategory(device.category);setBrand(device.brand);setQuery('');setBrowsing(false)}
  function focusSearch(){setQuery('');setRequested(false);setBrowsing(true);requestAnimationFrame(()=>searchInput.current?.focus())}
  if(value&&compact)return <div className="pickedDevice"><span className={`deviceMark ${value.category}`}>{value.brand[0]}</span><div><small>{label}</small><b>{value.brand} {value.model}</b><span>{categoryById.get(value.category)?.label} · {value.releaseYear}</span></div><button type="button" aria-label={`Change ${label}`} onClick={()=>{onChange(undefined);setBrowsing(true)}}>Change</button></div>

  return <section className="deviceSelector">
    <div className="selectorHead"><div><span className="selectorLabel">{label}</span><h2>{value?'Device selected':'Select a device'}</h2></div>{value?<button type="button" onClick={()=>{onChange(undefined);setBrowsing(true)}}><X/> Clear</button>:null}</div>
    <label className="deviceSearch"><Search/><input ref={searchInput} value={query} onChange={event=>{setQuery(event.target.value);setRequested(false)}} placeholder="Search brand or model, e.g. iPhone 15" aria-label={`Search ${label.toLowerCase()}`}/>{query?<button aria-label="Clear device search" onClick={()=>setQuery('')} type="button"><X/></button>:null}</label>
    {query?<div className="quickResults">
      {results.map(device=><button type="button" key={device.id} onClick={()=>choose(device)}><span className={`deviceMark ${device.category}`}>{device.brand[0]}</span><span><b>{device.brand} {device.model}</b><small>{categoryById.get(device.category)?.label} · {device.releaseYear}</small></span><ChevronRight/></button>)}
      {!results.length?<div className="requestDevice"><b>Can’t find “{query}”?</b><span>Try a shorter model name, or save this exact model request.</span><button type="button" disabled={requested} onClick={()=>{requestMissingProduct(query);setRequested(true)}}>{requested?'Request saved':'Request this device'}</button></div>:null}
    </div>:<>
      {value?<div className="selectedDeviceRow"><span className={`deviceMark ${value.category}`}>{value.brand[0]}</span><div><small>Selected device</small><b>{value.brand} {value.model}</b><span>{categoryById.get(value.category)?.label} · {value.releaseYear}</span></div><button type="button" onClick={()=>{onChange(undefined);setQuery('');setBrowsing(true)}}>Change</button></div>:null}
      <div className="browseLabel"><p className="orBrowse">Or browse categories</p>{visibleCategories.length>5?<button type="button" onClick={()=>setShowAllCategories(current=>!current)}>{showAllCategories?'Show fewer':'More categories'}<ChevronDown className={showAllCategories?'open':''}/></button>:null}</div>
      <div className="categoryPicker">{shownCategories.map(item=>{const Icon=categoryIcons[item.id]||CircuitBoard;const count=devices.filter(device=>device.category===item.id).length;return <button type="button" className={category===item.id?'active':''} key={item.id} onClick={()=>{setCategory(item.id);setBrand(undefined);setBrowsing(true)}}><Icon/><span>{item.shortLabel}</span>{count?<small>{count}</small>:null}</button>})}</div>
      {category&&browsing?<div className="progressivePick"><div><span className="selectorLabel">Choose brand</span><div className="brandPicker">{brands.length?brands.map(item=><button type="button" className={brand===item?'active':''} key={item} onClick={()=>setBrand(item)}>{item}</button>):<p>No products in this category yet.</p>}</div></div>{brand?<div><span className="selectorLabel">Choose model</span><div className="modelPicker">{models.map(device=><button type="button" className={value?.id===device.id?'active':''} key={device.id} onClick={()=>choose(device)}><span className={`deviceMark ${device.category}`}>{device.brand[0]}</span><span><b>{device.model}</b><small>{device.releaseYear}{device.subcategory?` · ${device.subcategory}`:''}</small></span><ChevronRight/></button>)}</div></div>:null}</div>:null}
    </>}
    <div className="selectorFoot"><span>You can change your device at any time.</span><button type="button" onClick={focusSearch}>Can’t find it? Search and request</button></div>
  </section>
}
