import { AlertTriangle, ArrowDown, ArrowRight, Cable, Check, HardDrive, Headphones, Monitor, Plug, Save } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AffiliateLink } from '../components/AffiliateLink'
import { DeviceSelector } from '../components/DeviceSelector'
import { Seo } from '../components/Seo'
import { ToolPageHeader } from '../components/ToolPageHeader'
import { useDevices } from '../hooks/useDevices'
import { connectionPlan } from '../services/toolCalculations'
import { deviceFromSearch } from '../services/searchIntent'
import type { Device } from '../types/device'

const goals=['Connect one monitor','Connect two external monitors','Charge while using HDMI','Connect to speakers','Use an old display','Add external storage']

export function NeedPage() {
  const devices=useDevices()
  const [source,setSource]=useState<Device|undefined>(()=>deviceFromSearch(devices,'device'))
  const [destination,setDestination]=useState<Device|undefined>(()=>{const preset=deviceFromSearch(devices,'second');return preset&&['monitor','tv'].includes(preset.category)?preset:undefined})
  const [goal,setGoal]=useState(goals[0])
  const [show,setShow]=useState(false)
  const destinationCategories=useMemo(()=>goal.includes('speakers')?['audio']:goal.includes('storage')?['storage']:['monitor','tv'],[goal])
  const plan=source&&destination?connectionPlan(source,destination,goal):null
  const purchaseItems=source&&plan?purchaseRequirements(plan,source):[]
  function chooseGoal(nextGoal:string){setGoal(nextGoal);const allowed=nextGoal.includes('speakers')?['audio']:nextGoal.includes('storage')?['storage']:['monitor','tv'];if(destination&&!allowed.includes(destination.category))setDestination(undefined)}

  return <main className="flowPage">
    <Seo title="What Do I Need?" description="Build a clear connection chain for monitors, docks, chargers, speakers, storage, and adapters." />
    <ToolPageHeader title="What Do I Need?" description="Choose the source, desired result, and destination to build the right connection path." steps={['Devices','Goal','Connection plan']} currentStep={show?3:source?2:1}/>
    {!show?<div className="needSetup"><DeviceSelector devices={devices} value={source} onChange={value=>{setSource(value);setDestination(undefined)}} label="Source device"/><section className="goalPicker"><h2>Desired result</h2>{goals.map(item=><button type="button" className={goal===item?'active':''} onClick={()=>chooseGoal(item)} key={item}>{item}</button>)}</section><DeviceSelector devices={devices.filter(device=>destinationCategories.includes(device.category))} value={destination} onChange={setDestination} label={goal.includes('speakers')?'Speaker or audio device':goal.includes('storage')?'Storage device':'Display device'}/><button className="actionButton" disabled={!source||!destination} onClick={()=>setShow(true)}>Build connection chain <ArrowRight/></button></div>:source&&destination&&plan?<section className="needResult resultReveal">
      <div className="setupSummary"><DeviceSelector devices={devices} value={source} onChange={value=>{setSource(value);setShow(false)}} label="Source" compact/><div><small>Desired result</small><b>{goal}</b></div><div><small>Destination</small><b>{plan.quantity>1?`${plan.quantity} × `:''}{destination.brand} {destination.model}</b></div></div>
      <h2>Your best connection path</h2>
      <div className={`connectionChain ${plan.verified?'':'connectionUnknown'}`}><ChainNode icon={<span className={`deviceMark ${source.category}`}>{source.brand[0]}</span>} title={source.model}/><ArrowRight/><ChainNode icon={<Plug/>} title={plan.path}/>{plan.needsDock?<><ArrowRight/><ChainNode icon={<Cable/>} title={plan.dockLabel}/></>:null}<ArrowRight/><ChainNode icon={<Cable/>} title={`${plan.quantity} × certified cable${plan.quantity>1?'s':''}`}/><ArrowRight/><ChainNode icon={destination.category==='audio'?<Headphones/>:destination.category==='storage'?<HardDrive/>:<Monitor/>} title={destination.model}/></div>
      <div className="engineReasoning"><h3>{plan.confidence} confidence plan</h3>{plan.steps.map((step,index)=><p key={step}><span>{index+1}</span>{step}</p>)}<small><b>Alternative:</b> {plan.alternative}</small></div>
      <div className="needDetails"><div><h3>{plan.verified?'You need':'No verified direct path'}</h3>{purchaseItems.map(item=><div className="purchaseRequirement" key={item.label}><p>{plan.verified?<Check/>:<AlertTriangle/>}{item.label}</p><AffiliateLink query={item.query} label="Find a matching product" compact/></div>)}</div><div><h3>Limits and checks</h3>{plan.warnings.map(warning=><p key={warning}>{warning}</p>)}</div></div>
      <button className="secondaryAction" onClick={()=>setShow(false)}><Save/>Adjust setup</button>
    </section>:null}
  </main>
}

function ChainNode({icon,title}:{icon:React.ReactNode;title:string}) { return <div>{icon}<b>{title}</b><ArrowDown/></div> }

function purchaseRequirements(plan:ReturnType<typeof connectionPlan>,source:Device){
  const items:Array<{label:string;query:string}>=[]
  if(!plan.verified)return [{label:'A verified active adapter or dock matching both connection types',query:`active adapter dock ${plan.path} ${source.brand} ${source.model}`}]
  if(plan.needsDock)items.push({label:plan.dockLabel,query:`${source.brand} ${source.model} ${plan.dockLabel}`})
  else if(plan.needsAdapter)items.push({label:`A certified ${plan.path}`,query:`certified ${plan.path} ${source.brand} ${source.model}`})
  else if(!/bluetooth/i.test(plan.path))items.push({label:`${plan.quantity} × certified ${plan.path}${plan.quantity>1?'s':''}`,query:`certified ${plan.path}`})
  if(plan.needsDock)items.push({label:`${plan.quantity} × correctly rated display cable${plan.quantity>1?'s':''}`,query:`certified HDMI DisplayPort cable for ${plan.dockLabel}`})
  items.push({label:'The original or correctly rated source-device power adapter',query:`${source.brand} ${source.model} charger power adapter`})
  return items
}
