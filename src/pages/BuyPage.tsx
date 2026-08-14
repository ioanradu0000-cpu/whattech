import { AlertTriangle, ArrowRight, Check, ShoppingCart } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Seo } from '../components/Seo'
import { ToolPageHeader } from '../components/ToolPageHeader'
import { categories } from '../data/catalog'
import { useDevices } from '../hooks/useDevices'
import { buyingMatch } from '../services/toolCalculations'
import type { DeviceCategory } from '../types/device'

const uses=['Everyday use','Productivity','Gaming','Creative work','Travel','School']

export function BuyPage() {
  const devices=useDevices()
  const [category,setCategory]=useState<DeviceCategory>('laptop')
  const [budget,setBudget]=useState(1000)
  const [primaryUse,setPrimaryUse]=useState('Productivity')
  const [portability,setPortability]=useState(3)
  const [battery,setBattery]=useState(4)
  const [show,setShow]=useState(false)
  const validBudget=Number.isFinite(budget)&&budget>=50&&budget<=100000
  const matches=useMemo(()=>validBudget?devices.filter(device=>device.category===category).map(device=>({device,...buyingMatch(device,primaryUse,budget,portability*2,battery*2)})).filter(item=>item.price<=budget*1.35).sort((a,b)=>b.score-a.score).slice(0,6):[],[battery,budget,category,devices,portability,primaryUse,validBudget])

  return <main className="flowPage">
    <Seo title="What Should I Buy?" description="Get structured product recommendations based on category, budget, primary use, portability, and battery priorities." />
    <ToolPageHeader title="What Should I Buy?" description="Set the product type, budget, and priorities to get a focused shortlist." steps={['Product type','Needs and budget','Recommendations']} currentStep={show?3:2}/>
    {!show?<section className="buySetup"><label>Product category<select value={category} onChange={event=>setCategory(event.target.value as DeviceCategory)}>{categories.filter(item=>devices.some(device=>device.category===item.id)).map(item=><option value={item.id} key={item.id}>{item.label}</option>)}</select></label><label>Maximum budget (EUR)<input type="number" min="50" max="100000" inputMode="numeric" value={budget} onChange={event=>setBudget(Number(event.target.value))}/>{!validBudget?<small className="fieldError">Enter a budget between EUR 50 and EUR 100,000.</small>:null}</label><div><span className="selectorLabel">Primary use</span><div className="priorityGrid">{uses.map(item=><button type="button" className={primaryUse===item?'active':''} onClick={()=>setPrimaryUse(item)} key={item}>{item}</button>)}</div></div><label>Portability priority: {portability}/5<input type="range" min="1" max="5" value={portability} onChange={event=>setPortability(Number(event.target.value))}/></label><label>Battery priority: {battery}/5<input type="range" min="1" max="5" value={battery} onChange={event=>setBattery(Number(event.target.value))}/></label>{validBudget&&!matches.length?<p className="toolHint">No catalog match is close to this budget. Try another category or raise the maximum budget.</p>:null}<button className="actionButton" disabled={!validBudget||!matches.length} onClick={()=>setShow(true)}>Find best matches <ArrowRight/></button></section>:<section className="buyResult resultReveal">
      <div className="resultIntro"><ShoppingCart/><div><small>Best answers for {primaryUse.toLowerCase()}</small><h2>{matches.length} ranked matches</h2><p>Scored from relevant strengths, budget fit, support life, and data confidence. No affiliate payment changes the order.</p></div></div>
      <div className="recommendationList">{matches.map(({device,score,price,withinBudget,reason,risk,confidence},index)=><article key={device.id}><div><small>{index===0?'Best overall':index===1?'Runner-up':withinBudget?'Strong alternative':'Stretch option'}</small><span className={`deviceMark ${device.category}`}>{device.brand[0]}</span></div><section><h3>{device.brand} {device.model}</h3><p>{reason}</p><span><Check/>Estimated midpoint EUR {price} {withinBudget?'within budget':'above budget'}</span><span>{withinBudget?<Check/>:<AlertTriangle/>}{risk}</span><small>{confidence} confidence catalog profile</small></section><b>{score}/100 fit</b></article>)}</div>
      <div className="estimateNotice"><AlertTriangle/><p>These are catalog-based recommendations, not live store listings. Confirm current price, configuration, warranty, and region-specific availability before buying.</p></div>
      <button className="secondaryAction" onClick={()=>setShow(false)}>Adjust priorities</button>
    </section>}
  </main>
}
