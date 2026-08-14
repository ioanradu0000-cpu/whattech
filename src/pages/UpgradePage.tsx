import { ArrowDown, ArrowRight, ArrowUp, BatteryMedium, BriefcaseBusiness, CalendarRange, Camera, Check, Feather, Gamepad2, Gauge, Minus, Monitor, RotateCcw, ShieldCheck, SlidersHorizontal, TrendingUp } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DeviceSelector } from '../components/DeviceSelector'
import { Seo } from '../components/Seo'
import { ToolPageHeader } from '../components/ToolPageHeader'
import { useDevices } from '../hooks/useDevices'
import { metricScore, upgradeAnalysis } from '../services/toolCalculations'
import { deviceFromSearch } from '../services/searchIntent'
import type { Device } from '../types/device'

const priorityOptions=[
  {name:'Gaming',icon:Gamepad2},{name:'Battery',icon:BatteryMedium},{name:'Camera',icon:Camera},{name:'Performance',icon:Gauge},
  {name:'Display',icon:Monitor},{name:'Productivity',icon:BriefcaseBusiness},{name:'Longevity',icon:ShieldCheck},{name:'Portability',icon:Feather},
]

export function UpgradePage() {
  const devices=useDevices()
  const presetCurrent=deviceFromSearch(devices,'device')
  const presetTarget=deviceFromSearch(devices,'second')
  const [current,setCurrent]=useState<Device|undefined>(presetCurrent)
  const [target,setTarget]=useState<Device|undefined>(()=>presetTarget?.category===presetCurrent?.category?presetTarget:undefined)
  const [selected,setSelected]=useState<string[]>(['Performance','Longevity'])
  const [budget,setBudget]=useState(700)
  const [show,setShow]=useState(false)
  const validBudget=Number.isFinite(budget)&&budget>=0&&budget<=100000
  const sameCategoryDevices=useMemo(()=>devices.filter(device=>!current||device.category===current.category),[current,devices])
  const result=current&&target?upgradeAnalysis(current,target,selected,budget):null

  function togglePriority(name:string){
    setSelected(items=>items.includes(name)?items.filter(item=>item!==name):items.length<5?[...items,name]:items)
  }
  function reset(){setShow(false);setCurrent(undefined);setTarget(undefined);setSelected(['Performance','Longevity']);setBudget(700)}

  return <main className="flowPage upgradePage">
    <Seo title="Should I Upgrade?" description="Compare your current device with a potential upgrade by meaningful gains, useful life, and net cost." />
    <ToolPageHeader title="Should I Upgrade?" description="Compare meaningful gains, useful life, and net cost—not just newer specifications." steps={['Devices','Priorities','Recommendation']} currentStep={show?3:current&&target?2:1}/>
    {!show?<section className="upgradeWorkspace">
      <div className="upgradeDeviceRail">
        <DeviceColumn device={current} label="Your current device"><DeviceSelector devices={devices} value={current} onChange={value=>{setCurrent(value);setTarget(undefined)}} label="Your current device" compact={Boolean(current)}/></DeviceColumn>
        <div className="upgradeDirection"><ArrowRight/><span>compare</span></div>
        <DeviceColumn device={target} label="What are you considering?"><DeviceSelector devices={sameCategoryDevices.filter(device=>device.id!==current?.id)} value={target} onChange={setTarget} label="What are you considering?" compact={Boolean(target)}/></DeviceColumn>
      </div>
      <div className="upgradeInputs">
        <div className="priorityChooser"><h2>What matters most to you?</h2><p>Select the factors that matter most. Choose up to 5.</p><div className="upgradePriorityGrid">{priorityOptions.map(({name,icon:Icon})=>{const active=selected.includes(name);return <button type="button" className={active?'active':''} onClick={()=>togglePriority(name)} aria-pressed={active} key={name}><Icon/><b>{name}</b><span>{active?<Check/>:null}</span></button>})}</div><small>Selected {selected.length} of 5</small></div>
        <div className="upgradeBudget"><label>Maximum net upgrade budget</label><div><span>€</span><input type="number" min="0" max="100000" inputMode="numeric" value={budget} onChange={event=>setBudget(Number(event.target.value))}/></div><p>Estimated after selling your current device privately.</p>{!validBudget?<p className="fieldError">Enter a budget from €0 to €100,000.</p>:null}<button className="actionButton" disabled={!current||!target||!selected.length||!validBudget} onClick={()=>setShow(true)}>Calculate upgrade score <ArrowRight/></button></div>
      </div>
    </section>:result&&current&&target?<UpgradeResult current={current} target={target} result={result} selected={selected} budget={budget} adjust={()=>setShow(false)} reset={reset}/>:null}
  </main>
}

function DeviceColumn({device,label,children}:{device?:Device;label:string;children:React.ReactNode}){
  const remaining=device?Math.max(0,device.estimatedLifespanYears-(new Date().getFullYear()-device.releaseYear)):0
  return <div className="upgradeDeviceColumn"><h2>{label}</h2>{children}{device?<dl><div><dt>Released</dt><dd>{device.releaseYear}</dd></div><div><dt>Current value</dt><dd>€{device.estimatedValueEur[0]}–€{device.estimatedValueEur[1]}</dd></div><div><dt>Useful life left</dt><dd>About {remaining} years</dd></div><div><dt>Support</dt><dd>{device.softwareSupportUntil?`Through ${device.softwareSupportUntil}`:'No verified end date'}</dd></div></dl>:<p className="upgradeEmpty">Search or browse the device database to begin.</p>}</div>
}

type UpgradeResultData=ReturnType<typeof upgradeAnalysis>
function UpgradeResult({current,target,result,selected,budget,adjust,reset}:{current:Device;target:Device;result:UpgradeResultData;selected:string[];budget:number;adjust:()=>void;reset:()=>void}){
  const remaining=Math.max(0,budget-result.netCost)
  const costPercent=Math.min(100,result.netCost/Math.max(1,budget)*100)
  const deltas=selected.map(name=>({name,delta:metricScore(target,name)-metricScore(current,name)})).sort((a,b)=>b.delta-a.delta)
  return <section className="upgradeResultV2 resultReveal">
    <div className="upgradePairBar"><div><span className={`deviceMark ${current.category}`}>{current.brand[0]}</span><b>{current.brand} {current.model}</b></div><span>VS</span><div><b>{target.brand} {target.model}</b><span className={`deviceMark ${target.category}`}>{target.brand[0]}</span></div></div>
    <div className={`upgradeDecision ${result.score>=72?'positive':result.score<55?'negative':'balanced'}`}><div className="upgradeScore" style={{'--score':`${result.score*3.6}deg`} as React.CSSProperties}><b>{result.score}</b><small>/ 100</small></div><div><h2>{result.verdict}</h2><p>{result.reasons[0]} {result.reasons[1]}</p></div><div><small>Selected priorities</small><p>{selected.join(' · ')}</p></div></div>
    <div className="upgradeCostTrack"><div><small>Estimated net cost</small><b>€{result.netCost}</b></div><div><small>Your budget</small><b>€{budget}</b></div><div><b>{result.netCost<=budget?`€${remaining}`:`€${result.netCost-budget}`}</b><small>{result.netCost<=budget?'left in budget':'over budget'}</small></div><span><i style={{width:`${costPercent}%`}}/></span></div>
    <div className="upgradeAnalysisGrid">
      <div className="upgradeDeltaList"><h3>Changes that matter to you</h3>{deltas.map(item=><DeltaRow key={item.name} name={item.name} delta={item.delta}/>)}</div>
      <aside><ResultFact icon={<CalendarRange/>} label="Expected useful life"><b>{result.yearsCurrent} years <ArrowRight/> <strong>{result.yearsTarget} years</strong></b></ResultFact><ResultFact icon={<ShieldCheck/>} label="Confidence"><b>{result.confidence} confidence</b></ResultFact><ResultFact icon={<TrendingUp/>} label="Tradeoff"><p>{result.tradeoff}</p></ResultFact></aside>
    </div>
    <div className="upgradeResultActions"><button className="secondaryAction" onClick={adjust}><SlidersHorizontal/>Adjust comparison</button><button className="actionButton" onClick={reset}><RotateCcw/>Compare another device</button></div>
  </section>
}

function DeltaRow({name,delta}:{name:string;delta:number}){
  const state=delta>5?'better':delta<-5?'worse':'similar'
  const Icon=state==='better'?ArrowUp:state==='worse'?ArrowDown:Minus
  return <div className={state}><b>{name}</b><span>{delta>0?'+':''}{delta}</span><Icon/><p>{state==='better'?'Meaningful improvement for this priority.':state==='worse'?'A real tradeoff compared with your current device.':'Close enough that everyday use may feel similar.'}</p></div>
}

function ResultFact({icon,label,children}:{icon:React.ReactNode;label:string;children:React.ReactNode}){return <div className="upgradeResultFact"><span>{icon}</span><div><small>{label}</small>{children}</div></div>}
