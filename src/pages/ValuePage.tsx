import { ArrowRight, CircleDollarSign, Info } from 'lucide-react'
import { useState } from 'react'
import { DeviceSelector } from '../components/DeviceSelector'
import { Seo } from '../components/Seo'
import { ToolPageHeader } from '../components/ToolPageHeader'
import { useDevices } from '../hooks/useDevices'
import { valueEstimate } from '../services/toolCalculations'
import { deviceFromSearch } from '../services/searchIntent'
import type { Device } from '../types/device'

export function ValuePage() {
  const devices=useDevices()
  const [device,setDevice]=useState<Device|undefined>(()=>deviceFromSearch(devices,'device'))
  const [condition,setCondition]=useState('Good')
  const [battery,setBattery]=useState(85)
  const [accessories,setAccessories]=useState(true)
  const [region,setRegion]=useState('European Union')
  const [show,setShow]=useState(false)
  const value=device?valueEstimate(device,condition,battery,accessories,region):null
  const batteryRelevant=device&&['phone','laptop','tablet','wearable','handheld','audio','camera'].includes(device.category)

  return <main className="flowPage">
    <Seo title="What’s It Worth?" description="Estimate private-sale, trade-in, and quick-sale value using reference data and your device’s condition." />
    <ToolPageHeader title="What’s It Worth?" description="Choose your device and condition to get a transparent estimated value range." steps={['Device','Condition','Estimate']} currentStep={show?3:device?2:1}/>
    {!show?<div className="valueSetup">
      <DeviceSelector devices={devices} value={device} onChange={setDevice} label="Choose category, brand, and model"/>
      <section className="questionStack"><label>Condition<select value={condition} onChange={event=>setCondition(event.target.value)}>{['Like New','Good','Used','Poor','Damaged'].map(item=><option key={item}>{item}</option>)}</select></label>{batteryRelevant?<label>Battery health: {battery}%<input type="range" min="50" max="100" value={battery} onChange={event=>setBattery(Number(event.target.value))}/></label>:null}<label>Original accessories included?<span className="choiceButtons"><button type="button" className={accessories?'active':''} onClick={()=>setAccessories(true)}>Yes</button><button type="button" className={!accessories?'active':''} onClick={()=>setAccessories(false)}>No</button></span></label><label>Region<select value={region} onChange={event=>setRegion(event.target.value)}><option>European Union</option><option>United Kingdom</option><option>United States</option><option>Other</option></select></label><button className="actionButton" disabled={!device} onClick={()=>setShow(true)}>Estimate value <ArrowRight/></button></section>
    </div>:value&&device?<section className="valueResult resultReveal">
      <div><CircleDollarSign/><small>Estimated private-sale range in {region}</small><h2>{value.currency}{value.privateSale[0]}–{value.currency}{value.privateSale[1]}</h2><p>{value.confidence} confidence from reference data and the details you supplied.</p></div>
      <div className="saleOptions"><article><small>Private sale</small><b>{value.currency}{value.privateSale[0]}–{value.currency}{value.privateSale[1]}</b><p>Most effort, usually the highest return.</p></article><article><small>Trade-in</small><b>{value.currency}{value.tradeIn[0]}–{value.currency}{value.tradeIn[1]}</b><p>Convenient, but typically lower.</p></article><article><small>Quick sale</small><b>{value.currency}{value.quickSale[0]}–{value.currency}{value.quickSale[1]}</b><p>Priced for speed.</p></article></div>
      <div className="estimateNotice"><Info/><div><b>What moved this estimate</b><p>{value.factors.join(' · ')}.</p><p>{value.basis}</p><p>{value.uncertaintyNote} This is not a live market quote.</p></div></div>
      <button className="secondaryAction" onClick={()=>setShow(false)}>Change details</button>
    </section>:null}
  </main>
}
