import { ArrowRight, Check, Wrench } from 'lucide-react'
import { useState } from 'react'
import { DeviceSelector } from '../components/DeviceSelector'
import { Seo } from '../components/Seo'
import { ToolPageHeader } from '../components/ToolPageHeader'
import { useDevices } from '../hooks/useDevices'
import { decide } from '../services/engines'
import { deviceFromSearch, valueFromSearch } from '../services/searchIntent'
import type { Device } from '../types/device'

export function RepairReplacePage() {
  const devices=useDevices()
  const presetDevice=deviceFromSearch(devices,'device')
  const presetIssue=valueFromSearch('issue')
  const [device,setDevice]=useState<Device|undefined>(presetDevice)
  const [issue,setIssue]=useState(()=>['Battery','Screen','Charging','Storage','Performance','Physical damage','Other'].includes(presetIssue||'')?presetIssue!:'Battery')
  const [quote,setQuote]=useState(70)
  const [replacement,setReplacement]=useState(()=>presetDevice?Math.max(200,Math.round(presetDevice.estimatedValueEur[1]*1.45)):600)
  const [condition,setCondition]=useState(4)
  const [satisfied,setSatisfied]=useState(true)
  const [show,setShow]=useState(false)
  const validCosts=Number.isFinite(quote)&&quote>=0&&Number.isFinite(replacement)&&replacement>0
  const result=device?decide(device,condition,quote,replacement,satisfied,issue):null
  const value=device?(device.estimatedValueEur[0]+device.estimatedValueEur[1])/2:0
  const ratio=Math.round(quote/Math.max(value,1)*100)

  return <main className="flowPage">
    <Seo title="Repair or Replace?" description="Compare repair cost, estimated device value, replacement cost, age, condition, and remaining useful life." />
    <ToolPageHeader title="Repair or Replace?" description="Compare the repair quote with current value, replacement cost, and useful life." steps={['Device','Repair details','Decision']} currentStep={show?3:device?2:1}/>
    {!show?<div className="repairSetup">
      <DeviceSelector devices={devices} value={device} onChange={value=>{setDevice(value);if(value)setReplacement(Math.max(200,Math.round(value.estimatedValueEur[1]*1.45)))}} label="Select your device"/>
      <section className="questionStack">
        <label>What is wrong?<select value={issue} onChange={event=>setIssue(event.target.value)}>{['Battery','Screen','Charging','Storage','Performance','Physical damage','Other'].map(item=><option key={item}>{item}</option>)}</select></label>
        <label>Written repair quote (EUR)<input type="number" min="0" max="100000" inputMode="numeric" value={quote} onChange={event=>setQuote(Number(event.target.value))}/></label>
        <label>Cost of the replacement you would actually buy (EUR)<input type="number" min="1" max="100000" inputMode="numeric" value={replacement} onChange={event=>setReplacement(Number(event.target.value))}/></label>
        <label>Current condition<select value={condition} onChange={event=>setCondition(Number(event.target.value))}><option value="5">Like new</option><option value="4">Good</option><option value="3">Used</option><option value="2">Poor</option><option value="1">Damaged</option></select></label>
        <label>Does it still meet your needs?<span className="choiceButtons"><button type="button" className={satisfied?'active':''} onClick={()=>setSatisfied(true)}>Yes</button><button type="button" className={!satisfied?'active':''} onClick={()=>setSatisfied(false)}>No</button></span></label>
        {!validCosts?<p className="fieldError">Enter a non-negative quote and a replacement cost above zero.</p>:null}<button className="actionButton" disabled={!device||!validCosts} onClick={()=>setShow(true)}>Run repair analysis <ArrowRight/></button>
      </section>
    </div>:device&&result?<section className="repairResult resultReveal">
      <div className="repairVerdict"><span><Wrench/></span><div><small>Best answer for {issue.toLowerCase()}</small><h2>{result.action==='KEEP'&&result.modifier==='REPAIR'?'REPAIR':result.action}</h2><p>{result.reason}</p></div><div className="ratioDial"><b>{ratio}%</b><small>repair / value</small></div></div>
      <div className="economyLine"><div><small>Repair quote</small><b>EUR {quote}</b><span style={{left:`${Math.min(90,quote/replacement*100)}%`}}/></div><div><small>Estimated value</small><b>~EUR {Math.round(value)}</b><span style={{left:`${Math.min(90,value/replacement*100)}%`}}/></div><div><small>Your replacement</small><b>EUR {replacement}</b><span style={{left:'90%'}}/></div></div>
      <div className="repairReason"><Check/><div><b>Why this recommendation?</b><p>{result.factors.join(' · ')}. The device {satisfied?'still meets':'no longer meets'} your needs.</p></div></div>
      <div className="decisionBalance"><div><small>Best next step</small><p>{result.nextStep}</p></div><div><small>What could change the answer</small><p>{result.counterpoint}</p></div></div>
      <div className="remainingLife"><small>Decision confidence</small><b>{result.score}/100</b><span>Use a written quote and ask whether the repair includes parts, labor, and warranty before deciding.</span></div>
      <button className="secondaryAction" onClick={()=>setShow(false)}>Adjust inputs</button>
    </section>:null}
  </main>
}
