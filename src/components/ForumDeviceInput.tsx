import { Check, Search, X } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import { categoryById } from '../data/catalog'
import { searchDevices } from '../services/search'
import type { Device } from '../types/device'

export function ForumDeviceInput({devices,value,onChange,label='Device'}:{devices:Device[];value?:Device;onChange:(device?:Device)=>void;label?:string}){
  const inputId=useId()
  const [query,setQuery]=useState('')
  const [open,setOpen]=useState(false)
  const results=useMemo(()=>query.trim()?searchDevices(devices,query,7):devices.slice(0,7),[devices,query])
  const displayed=value?`${value.brand} ${value.model}`:query

  return <div className="forumDeviceInput">
    <label htmlFor={inputId}>{label}</label>
    <div className={open?'forumDeviceControl open':'forumDeviceControl'}>
      <Search/>
      <input id={inputId} value={displayed} placeholder="Search brand or model" onFocus={()=>setOpen(true)} onChange={event=>{if(value)onChange(undefined);setQuery(event.target.value);setOpen(true)}} aria-expanded={open} aria-controls={`${inputId}-results`} autoComplete="off"/>
      {value||query?<button type="button" aria-label="Clear selected device" onClick={()=>{onChange(undefined);setQuery('');setOpen(true)}}><X/></button>:null}
    </div>
    {open&&!value?<div className="forumDeviceResults" id={`${inputId}-results`}>
      {results.map(device=><button type="button" key={device.id} onClick={()=>{onChange(device);setQuery('');setOpen(false)}}><span className={`deviceMark ${device.category}`}>{device.brand[0]}</span><span><b>{device.brand} {device.model}</b><small>{categoryById.get(device.category)?.label} · {device.releaseYear}</small></span><Check/></button>)}
      {!results.length?<p>No matching device. Try a shorter model name.</p>:null}
    </div>:null}
  </div>
}
