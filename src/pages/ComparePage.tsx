import { ArrowRight, Check, Minus, Trophy } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DeviceSelector } from '../components/DeviceSelector'
import { Seo } from '../components/Seo'
import { ToolPageHeader } from '../components/ToolPageHeader'
import { useDevices } from '../hooks/useDevices'
import { compareRecommendation, comparisonMetrics, metricScore } from '../services/toolCalculations'
import { deviceFromSearch } from '../services/searchIntent'
import type { Device } from '../types/device'

export function ComparePage() {
  const devices=useDevices()
  const presetFirst=deviceFromSearch(devices,'device')
  const presetSecond=deviceFromSearch(devices,'second')
  const [first,setFirst]=useState<Device|undefined>(presetFirst)
  const [second,setSecond]=useState<Device|undefined>(()=>presetSecond?.category===presetFirst?.category?presetSecond:undefined)
  const [show,setShow]=useState(false)
  const metrics=useMemo(()=>comparisonMetrics(first?.category),[first?.category])
  const summary=useMemo(()=>first&&second?compareRecommendation(first,second,metrics):null,[first,second,metrics])

  return <main className="flowPage">
    <Seo title="Compare Devices" description="Compare two devices by category-relevant real-world strengths before reviewing the underlying specifications." />
    <ToolPageHeader title="Compare Devices" description="Choose two products and compare only the categories that matter for this type of device." steps={['Product A','Product B','Comparison']} currentStep={show?3:first?2:1}/>
    {!show?<div className="dualPick"><DeviceSelector devices={devices} value={first} onChange={value=>{setFirst(value);setSecond(undefined)}} label="Product A"/><DeviceSelector devices={devices.filter(device=>(!first||device.category===first.category)&&device.id!==first?.id)} value={second} onChange={setSecond} label="Product B"/><button className="actionButton" disabled={!first||!second} onClick={()=>setShow(true)}>Compare real-world impact <ArrowRight/></button></div>:first&&second&&summary?<section className="compareResult resultReveal">
      <div className="compareNames"><div><span className={`deviceMark ${first.category}`}>{first.brand[0]}</span><h2>{first.brand}<br/>{first.model}</h2></div><b>VS</b><div><span className={`deviceMark ${second.category}`}>{second.brand[0]}</span><h2>{second.brand}<br/>{second.model}</h2></div></div>
      <div className="compareWinner"><Trophy/><div><small>Best overall answer · {summary.confidence} confidence</small><h2>{summary.winner?`${summary.winner.brand} ${summary.winner.model}`:'Too close to call'}</h2><p>{summary.summary}</p></div></div>
      <h3>Winner by relevant category</h3>
      <div className="metricCompare">{metrics.map(metric=>{const a=metricScore(first,metric),b=metricScore(second,metric),winner=Math.abs(a-b)<=4?'tie':a>b?'a':'b';return <div key={metric}><b>{metric}</b><span><i style={{width:`${a}%`}}/><small>{a}</small></span><em>{winner==='tie'?<Minus/>:winner==='a'?<Check/>:null}</em><span><i style={{width:`${b}%`}}/><small>{b}</small></span><em>{winner==='b'?<Check/>:null}</em></div>})}</div>
      <div className="whoBuys"><div><small>Who should buy {first.model}</small><h3>Choose this for {summary.first.slice(0,3).join(', ').toLowerCase()||'a similar overall balance'}.</h3></div><div><small>Who should buy {second.model}</small><h3>Choose this for {summary.second.slice(0,3).join(', ').toLowerCase()||'a similar overall balance'}.</h3></div></div>
      <div className="specRows"><h3>Detailed specifications</h3><div><b>Release year</b><span>{first.releaseYear}</span><span>{second.releaseYear}</span></div><div><b>Estimated value</b><span>EUR {first.estimatedValueEur[0]}–{first.estimatedValueEur[1]}</span><span>EUR {second.estimatedValueEur[0]}–{second.estimatedValueEur[1]}</span></div><div><b>Ports</b><span>{first.ports.join(', ')}</span><span>{second.ports.join(', ')}</span></div><div><b>Protocols</b><span>{first.protocols.join(', ')}</span><span>{second.protocols.join(', ')}</span></div><div><b>Typical useful lifespan</b><span>{first.estimatedLifespanYears} years</span><span>{second.estimatedLifespanYears} years</span></div></div>
      <button className="secondaryAction" onClick={()=>setShow(false)}>Change products</button>
    </section>:null}
  </main>
}
