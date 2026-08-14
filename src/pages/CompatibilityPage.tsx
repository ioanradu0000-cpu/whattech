import { AlertTriangle, ArrowRight, Check, CircleHelp, Plug, RotateCcw, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { DeviceSelector } from '../components/DeviceSelector'
import { Seo } from '../components/Seo'
import { StatusIcon } from '../components/Status'
import { ToolPageHeader } from '../components/ToolPageHeader'
import { useDevices } from '../hooks/useDevices'
import { track } from '../services/analytics'
import { checkCompatibility } from '../services/engines'
import { deviceFromSearch } from '../services/searchIntent'
import type { CompatibilityResult, Device } from '../types/device'

export function CompatibilityPage(){
  const devices=useDevices()
  const [first,setFirst]=useState<Device|undefined>(()=>deviceFromSearch(devices,'device'))
  const [second,setSecond]=useState<Device|undefined>(()=>deviceFromSearch(devices,'second'))
  const [result,setResult]=useState<CompatibilityResult>()
  function run(){if(!first||!second)return;setResult(checkCompatibility(first,second));track('compatibility_check',{first:first.id,second:second.id})}
  return <main className="flowPage">
    <Seo title="Will It Work?" description="Check whether two devices or accessories can work together using verified connectors, protocols, power, and display capabilities."/>
    <ToolPageHeader title="Will It Work?" description="Choose two devices or accessories to check their ports, protocols, power, and display support." steps={['First device','Second device','Compatibility']} currentStep={result?3:first?2:1}/>
    {!result?<div className="compatSetup">
      <DeviceSelector devices={devices} value={first} onChange={device=>{setFirst(device);setSecond(undefined);setResult(undefined)}} label="What do you have?"/>
      <section className="secondDevice">{first?<DeviceSelector devices={devices.filter(device=>device.id!==first.id)} value={second} onChange={setSecond} label="What do you want to use with it?"/>:<div className="waitingForDevice"><CircleHelp/><div><b>Choose your first device</b><p>Then we’ll show the compatible second-device options.</p></div></div>}{first&&second?<button className="actionButton" onClick={run}>Analyze compatibility <ArrowRight/></button>:null}</section>
    </div>:<CompatibilityResultView first={first!} second={second!} result={result} reset={()=>{setResult(undefined);setSecond(undefined)}}/>}
  </main>
}

function CompatibilityResultView({first,second,result,reset}:{first:Device;second:Device;result:CompatibilityResult;reset:()=>void}){
  return <section className="compatResult">
    <div className="pairResult"><div className="devicePair"><div><span className={`deviceMark ${first.category}`}>{first.brand[0]}</span><b>{first.brand}<br/>{first.model}</b></div><strong>+</strong><div><span className={`deviceMark ${second.category}`}>{second.brand[0]}</span><b>{second.brand}<br/>{second.model}</b></div></div><div className={`compatVerdict ${result.status}`}><StatusIcon status={result.status}/><div><small>{result.confidence} confidence</small><h2>{result.status==='partial'?'PARTIALLY COMPATIBLE':result.status.toUpperCase()}</h2><p>{result.headline}</p></div></div><div className={`connectionDiagram ${result.status}`}><span>{first.model}</span><ArrowRight/><b>{result.status==='compatible'?<Check/>:<AlertTriangle/>}{result.works[0]||'No verified direct path'}</b><ArrowRight/><span>{second.model}</span></div></div>
    <div className="engineReasoning compatReasoning"><h3>Why this answer</h3><p>{result.explanation}</p>{result.assumptions.length?<p><b>Assumptions:</b> {result.assumptions.join(' ')}</p>:null}<small>{result.dataQuality}</small></div>
    <div className="resultLedger">
      <ResultSection icon={<Check/>} title="What works" items={result.works}/>
      <ResultSection icon={<ArrowRight/>} title="Maximum capabilities" items={[first.maxInputWatts?`${first.model}: up to ${first.maxInputWatts}W input`:first.display?`${first.display.maxResolution} at up to ${first.display.maxRefreshHz}Hz`:'No verified maximum recorded',second.maxOutputWatts?`${second.model}: up to ${second.maxOutputWatts}W output`:second.display?`${second.display.maxResolution} at up to ${second.display.maxRefreshHz}Hz`:'No verified maximum recorded']}/>
      <ResultSection icon={<Plug/>} title="Requirements" items={result.requiredAdapters.length?result.requiredAdapters:['Use the verified shared connector and protocol shown above.']}/>
      <ResultSection icon={<AlertTriangle/>} title="Potential issues" items={result.limitations}/>
      <ResultSection icon={<ShieldCheck/>} title="Safety" items={result.safety}/>
      <ResultSection icon={<CircleHelp/>} title="Recommended alternatives" items={result.status==='compatible'?['No alternative is necessary for the stated job.']:['Choose a product with the shared ports and protocols listed in the analysis.']}/>
    </div>
    <button className="secondaryAction" onClick={reset}><RotateCcw/>Check another pairing</button>
  </section>
}

function ResultSection({icon,title,items}:{icon:React.ReactNode;title:string;items:string[]}){return <div>{icon}<h3>{title}</h3>{items.length?<ul>{items.map(item=><li key={item}>{item}</li>)}</ul>:<p>No verified information available.</p>}</div>}
