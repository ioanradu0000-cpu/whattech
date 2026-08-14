import type { Device, DeviceCategory } from '../types/device'

const currentYear = () => new Date().getFullYear()
const clamp = (value: number, min = 10, max = 98) => Math.max(min, Math.min(max, Math.round(value)))
const midpoint = (device: Device) => (device.estimatedValueEur[0] + device.estimatedValueEur[1]) / 2
const supportEnd = (device: Device) => device.softwareSupportUntil || device.releaseYear + device.estimatedLifespanYears

const categoryDefaults: Partial<Record<DeviceCategory, Record<string, number>>> = {
  phone:{performance:76,battery:78,camera:77,display:79,portability:92,gaming:65,productivity:68},
  laptop:{performance:79,battery:75,display:80,portability:74,gaming:66,productivity:89},
  desktop:{performance:85,display:72,portability:22,gaming:81,productivity:91},
  component:{performance:83,display:75,portability:32,gaming:83,productivity:83},
  tablet:{performance:74,battery:85,camera:65,display:83,portability:90,gaming:63,productivity:76},
  monitor:{performance:70,display:88,portability:28,gaming:79,productivity:86},
  tv:{performance:70,display:88,portability:18,gaming:76,productivity:30},
  console:{performance:79,display:78,portability:34,gaming:94,productivity:24},
  handheld:{performance:75,battery:72,display:78,portability:91,gaming:92,productivity:44},
  audio:{performance:72,battery:82,portability:87,gaming:68,productivity:71},
  camera:{performance:85,battery:74,camera:95,display:70,portability:68,productivity:83},
  wearable:{performance:72,battery:70,display:79,portability:98,productivity:60},
  storage:{performance:83,portability:83,gaming:63,productivity:86},
  peripheral:{performance:78,battery:82,portability:78,gaming:79,productivity:86},
}

const categoryMetrics: Partial<Record<DeviceCategory, string[]>> = {
  phone:['Performance','Battery','Display','Camera','Value','Longevity','Portability'],
  laptop:['Performance','Battery','Display','Productivity','Gaming','Value','Longevity','Portability'],
  desktop:['Performance','Productivity','Gaming','Value','Longevity','Repairability'],
  component:['Performance','Gaming','Productivity','Value','Longevity'],
  tablet:['Performance','Battery','Display','Productivity','Value','Longevity','Portability'],
  monitor:['Display','Gaming','Productivity','Value','Longevity'],
  tv:['Display','Gaming','Value','Longevity'],
  console:['Performance','Gaming','Value','Longevity'],
  handheld:['Performance','Battery','Display','Gaming','Value','Portability'],
  audio:['Performance','Battery','Portability','Value','Longevity'],
  camera:['Camera','Performance','Battery','Portability','Value','Longevity'],
  storage:['Performance','Portability','Value','Longevity'],
  wearable:['Battery','Display','Portability','Value','Longevity'],
  peripheral:['Performance','Battery','Gaming','Productivity','Value','Longevity'],
}

export function comparisonMetrics(category?: DeviceCategory) {
  return categoryMetrics[category || 'other'] || ['Performance','Value','Longevity','Repairability']
}

function displayBoost(device: Device) {
  if (!device.display) return 0
  const resolution = device.display.maxResolution.toLowerCase()
  return (device.display.maxRefreshHz >= 120 ? 5 : device.display.maxRefreshHz >= 90 ? 2 : 0) + (/8k|4k|2160/.test(resolution) ? 4 : /1440|qhd/.test(resolution) ? 2 : 0)
}

export function metricScore(device: Device, key: string) {
  const normalized = key.toLowerCase()
  const explicit = Number(device.highlights?.[normalized])
  if (Number.isFinite(explicit)) return clamp(explicit)
  const age = Math.max(0, currentYear() - device.releaseYear)
  const remaining = Math.max(0, device.estimatedLifespanYears - age)
  const supportRemaining = supportEnd(device) - currentYear()
  if (normalized === 'longevity') return clamp(38 + remaining * 7 + Math.max(-2, supportRemaining) * 3, 18, 95)
  if (normalized === 'repairability') return device.repairability === 'easy' ? 90 : device.repairability === 'moderate' ? 66 : 38
  if (normalized === 'value') {
    const quality = Number(device.highlights?.performance) || categoryDefaults[device.category]?.performance || 70
    const referencePrice = midpoint(device)
    const categoryPrice = ['phone','tablet','audio','wearable'].includes(device.category) ? 450 : ['laptop','desktop','camera'].includes(device.category) ? 900 : 550
    return clamp(76 + (quality - 72) * .35 - Math.log(Math.max(.35, referencePrice / categoryPrice)) * 13 - Math.max(0, age - 2) * 1.5, 28, 95)
  }
  const baseline = categoryDefaults[device.category]?.[normalized] ?? categoryDefaults[device.category]?.performance ?? 67
  const freshness = Math.max(-15, Math.min(7, (device.releaseYear - 2022) * (normalized === 'battery' ? 1.5 : 2)))
  const agePenalty = ['performance','gaming','productivity'].includes(normalized) ? Math.max(0, age - 2) * 1.3 : 0
  const boost = normalized === 'display' ? displayBoost(device) : 0
  const confidencePenalty = device.confidence === 'low' ? 5 : device.confidence === 'medium' ? 2 : 0
  return clamp(baseline + freshness + boost - agePenalty - confidencePenalty)
}

const priorityWeights: Record<string, number> = { performance:1.2, battery:1.1, camera:1, display:1, gaming:1.15, productivity:1.15, portability:.9, value:1.2, longevity:1.1 }

export function upgradeAnalysis(current: Device, target: Device, priorities: string[], budget?: number) {
  const keys = Array.from(new Set((priorities.length ? priorities : comparisonMetrics(current.category)).map(item => item.toLowerCase())))
  const changes = keys.map(key => ({key, delta:metricScore(target,key)-metricScore(current,key), weight:priorityWeights[key] || 1}))
  const weightedGain = changes.reduce((sum,item)=>sum+item.delta*item.weight,0) / changes.reduce((sum,item)=>sum+item.weight,0)
  const targetPrice = midpoint(target)
  const resale = midpoint(current) * .78
  const netCost = Math.max(0, targetPrice - resale)
  const budgetPenalty = budget && netCost > budget ? Math.min(28, ((netCost-budget)/Math.max(budget,1))*38) : 0
  const supportGain = supportEnd(target) - supportEnd(current)
  const generationPenalty = target.releaseYear <= current.releaseYear ? 8 : 0
  const costPerPoint = netCost / Math.max(1, weightedGain)
  const valuePenalty = weightedGain > 0 && costPerPoint > 90 ? Math.min(12,(costPerPoint-90)/18) : 0
  const score = clamp(52 + weightedGain*2 + supportGain*1.4 - budgetPenalty - generationPenalty - valuePenalty, 8, 96)
  const better = changes.filter(item => item.delta > 5).sort((a,b)=>b.delta-a.delta).map(item=>item.key)
  const similar = changes.filter(item => Math.abs(item.delta) <= 5).map(item=>item.key)
  const worse = changes.filter(item => item.delta < -5).sort((a,b)=>a.delta-b.delta).map(item=>item.key)
  const verdict = score >= 72 ? 'WORTH UPGRADING' : score >= 55 ? 'UPGRADE IF THE TRADEOFF FITS' : 'KEEP YOUR CURRENT DEVICE'
  const reasons = [
    better.length ? `The clearest gains are ${better.join(', ')}.` : 'The selected priorities do not show a clear generational gain.',
    supportGain > 1 ? `The target adds about ${supportGain} years of expected support or useful life.` : supportGain < 0 ? 'The target has a shorter expected support horizon.' : 'Support life is broadly similar.',
    budgetPenalty ? `Estimated net cost exceeds the EUR ${budget} budget.` : `Estimated net cost is about EUR ${Math.round(netCost)} after a typical private sale.`,
  ]
  const confidence = current.confidence === 'low' || target.confidence === 'low' ? 'low' : current.confidence === 'high' && target.confidence === 'high' && keys.length >= 3 ? 'high' : 'medium'
  const tradeoff = worse.length ? `${target.model} may be worse for ${worse.join(', ')}.` : weightedGain < 6 ? 'Most differences are incremental, so price and condition may matter more than specifications.' : `At about EUR ${Math.round(costPerPoint)} per weighted point gained, value depends heavily on the actual purchase and resale prices.`
  return { score, verdict, better, similar, worse, reasons, netCost:Math.round(netCost), yearsCurrent:Math.max(0,current.estimatedLifespanYears-(currentYear()-current.releaseYear)), yearsTarget:Math.max(0,target.estimatedLifespanYears-(currentYear()-target.releaseYear)), confidence, tradeoff }
}

export function valueEstimate(device: Device, condition: string, battery: number, accessories: boolean, region = 'European Union') {
  const conditionFactors: Record<string,number> = {'Like New':1.08,'Good':1,'Used':.82,'Poor':.58,'Damaged':.3}
  const regionFactors: Record<string,{factor:number;symbol:string}> = {
    'European Union':{factor:1,symbol:'EUR '}, 'United Kingdom':{factor:.86,symbol:'GBP '}, 'United States':{factor:1.08,symbol:'$'}, Other:{factor:1,symbol:'EUR '},
  }
  const regionInfo = regionFactors[region] || regionFactors.Other
  const batteryRelevant = ['phone','laptop','tablet','wearable','handheld','audio','camera'].includes(device.category)
  const normalizedBattery = Math.max(40,Math.min(100,battery))
  const batteryFactor = !batteryRelevant ? 1 : normalizedBattery >= 90 ? 1.02 : normalizedBattery >= 80 ? .94 : normalizedBattery >= 70 ? .82 : .65
  const supportFactor = device.softwareSupportUntil && device.softwareSupportUntil <= currentYear() ? .86 : 1
  const accessoryFactor = accessories ? 1.035 : .97
  const baseFactor=(conditionFactors[condition]||1)*batteryFactor*accessoryFactor*supportFactor*regionInfo.factor
  const updated = new Date(device.updatedAt)
  const monthsOld = Number.isNaN(updated.getTime()) ? 18 : Math.max(0,(Date.now()-updated.getTime())/(1000*60*60*24*30.4))
  const uncertainty = Math.min(.3,(device.confidence === 'high' ? .08 : device.confidence === 'medium' ? .14 : .22)+Math.max(0,monthsOld-12)*.003)
  const adjusted:[number,number]=[device.estimatedValueEur[0]*baseFactor,device.estimatedValueEur[1]*baseFactor]
  const range = (lowFactor:number,highFactor:number):[number,number] => [Math.max(1,Math.round(adjusted[0]*lowFactor*(1-uncertainty*.3))),Math.max(1,Math.round(adjusted[1]*highFactor*(1+uncertainty*.3)))]
  return {
    privateSale:range(.96,1.04),tradeIn:range(.55,.72),quickSale:range(.68,.84),currency:regionInfo.symbol,confidence:device.confidence,
    factors:[condition,batteryRelevant?`${battery}% battery health`:'Battery not applicable',accessories?'Accessories included':'No original accessories',supportFactor<1?'Listed software support has ended':'No support-end discount applied'],
    basis:`Adjusted from the catalog reference range of EUR ${device.estimatedValueEur[0]}-${device.estimatedValueEur[1]}, last updated ${device.updatedAt}.`,
    uncertaintyNote:`Allow roughly ${Math.round(uncertainty*100)}% market uncertainty for local demand, exact configuration, cosmetic wear, and listing quality.`,
  }
}

const useMetric: Record<string,string[]> = {
  'Everyday use':['performance','battery','value'], Productivity:['productivity','performance','battery'], Gaming:['gaming','performance','display'],
  'Creative work':['performance','display','camera'], Travel:['portability','battery','value'], School:['battery','portability','value'],
}

export function buyingMatch(device: Device, primaryUse: string, budget: number, portability: number, battery: number) {
  const metrics = useMetric[primaryUse] || ['performance','value']
  const useScore = metrics.reduce((sum,key)=>sum+metricScore(device,key),0)/metrics.length
  const portabilityWeight=Math.max(0,Math.min(10,portability))/10
  const batteryWeight=Math.max(0,Math.min(10,battery))/10
  const preferenceScore=(metricScore(device,'portability')*portabilityWeight+metricScore(device,'battery')*batteryWeight)/Math.max(.5,portabilityWeight+batteryWeight)
  const price=midpoint(device)
  const overBudget=Math.max(0,price-budget)
  const budgetScore=price<=budget?Math.min(96,76+(budget-price)/Math.max(100,budget)*20):Math.max(5,70-overBudget/Math.max(1,budget)*90)
  const supportRemaining=supportEnd(device)-currentYear()
  const supportPenalty=supportRemaining<0?10:supportRemaining<2?4:0
  const confidencePenalty=device.confidence==='low'?7:device.confidence==='medium'?2:0
  const score=clamp(useScore*.55+preferenceScore*.2+budgetScore*.25-supportPenalty-confidencePenalty,8,98)
  const strengths=metrics.map(key=>({key,score:metricScore(device,key)})).sort((a,b)=>b.score-a.score).slice(0,2).map(item=>item.key)
  const compromises=Array.from(new Set([...metrics,'battery','portability','value'])).filter(key=>metricScore(device,key)<68).slice(0,2)
  const withinBudget=price<=budget
  const reason=withinBudget?`${strengths.join(' and ')} are the strongest matches for ${primaryUse.toLowerCase()}, at about EUR ${Math.round(price)}.`:`It fits the use profile, but its EUR ${Math.round(price)} reference price is EUR ${Math.round(overBudget)} over budget.`
  const risk=supportRemaining<0?'Listed software support has ended.':device.confidence==='low'?'Catalog data is limited; verify the exact configuration before buying.':compromises.length?`Main compromise: ${compromises.join(' and ')}.`:'No major compromise appears in the selected priorities.'
  return { score, strengths, compromises, price:Math.round(price), withinBudget, reason, risk, confidence:device.confidence }
}

export function compareRecommendation(first: Device, second: Device, metrics = comparisonMetrics(first.category)) {
  const usable=metrics.length?metrics:comparisonMetrics(first.category)
  const wins = usable.reduce((result,metric) => {
    const a=metricScore(first,metric)
    const b=metricScore(second,metric)
    if(Math.abs(a-b)<=4)result.tie.push(metric)
    else if(a>b)result.first.push(metric)
    else result.second.push(metric)
    return result
  },{first:[] as string[],second:[] as string[],tie:[] as string[]})
  const firstOverall=usable.reduce((sum,key)=>sum+metricScore(first,key),0)/usable.length
  const secondOverall=usable.reduce((sum,key)=>sum+metricScore(second,key),0)/usable.length
  const gap=Math.abs(firstOverall-secondOverall)
  const winner=gap<=3?undefined:firstOverall>secondOverall?first:second
  const confidence=first.confidence==='low'||second.confidence==='low'?'low':first.confidence==='high'&&second.confidence==='high'?'high':'medium'
  const summary=winner?`${winner.model} leads by about ${Math.round(gap)} points across the ${usable.length} relevant categories.`:`The overall scores are within ${Math.round(gap)} points, so the better choice depends on price, condition, and your priorities.`
  return {...wins,winner,firstOverall:Math.round(firstOverall),secondOverall:Math.round(secondOverall),confidence,summary}
}

const hasPort=(device:Device,family:string)=>device.ports.some(port=>port.toLowerCase().includes(family))
const hasProtocol=(device:Device,family:string)=>device.protocols.some(protocol=>protocol.toLowerCase().includes(family))

export function connectionPlan(source: Device, destination: Device, goal: string) {
  const normalized=goal.toLowerCase()
  const wantsTwo=normalized.includes('two')
  const wantsAudio=normalized.includes('speaker')
  const wantsStorage=normalized.includes('storage')
  const chargeAndVideo=normalized.includes('charge')&&normalized.includes('hdmi')
  const sourceUsbC=hasPort(source,'usb-c')||hasPort(source,'thunderbolt')||hasPort(source,'usb4')
  const targetUsbC=hasPort(destination,'usb-c')||hasPort(destination,'thunderbolt')||hasPort(destination,'usb4')
  let path='No verified direct connection path'
  let verified=false
  let needsAdapter=false
  let needsDock=false
  let dockLabel='Verified dock'
  let alternative='Check both manufacturers for a model-specific supported accessory.'
  const steps:string[]=[]
  const warnings:string[]=[]

  if(wantsAudio){
    if(hasPort(source,'3.5')&&hasPort(destination,'3.5')){path='3.5 mm audio cable';verified=true}
    else if(hasProtocol(source,'bluetooth')&&hasProtocol(destination,'bluetooth')){path='Bluetooth pairing';verified=true}
    else if(sourceUsbC&&hasPort(destination,'3.5')){path='USB-C audio adapter to 3.5 mm cable';verified=true;needsAdapter=true}
    steps.push(verified?'Connect or pair using the listed audio path.':'Confirm the source audio output and speaker input.','Select the speaker as the active audio output.','Start at low volume and test left/right channels and microphone separately.')
    warnings.push('Bluetooth codec, microphone, latency, and wired control support can differ by operating system.')
    alternative='Use a powered USB audio interface if direct analog or Bluetooth audio is unsuitable.'
  }else if(wantsStorage){
    if(sourceUsbC&&targetUsbC){path='USB-C data cable';verified=true}
    else if(hasPort(source,'usb-a')&&hasPort(destination,'usb-a')){path='USB-A data cable';verified=true}
    else if(sourceUsbC&&hasPort(destination,'usb-a')){path='USB-C to USB-A data adapter';verified=true;needsAdapter=true}
    steps.push(verified?'Use a cable explicitly rated for data, not a charge-only cable.':'Confirm a USB data connector exists on both devices.','Connect directly for the first test, then check that the drive mounts.','Confirm the file system is supported and eject safely before disconnecting.')
    warnings.push('The slower USB endpoint, cable rating, drive format, and available bus power set the real limit.')
    alternative='Use a powered USB hub if the host cannot provide enough power.'
  }else{
    const hdmi=hasPort(source,'hdmi')&&hasPort(destination,'hdmi')
    const displayPort=hasPort(source,'displayport')&&hasPort(destination,'displayport')
    const usbVideo=sourceUsbC&&(hasProtocol(source,'displayport')||hasProtocol(source,'thunderbolt'))
    if(chargeAndVideo&&usbVideo&&hasPort(destination,'hdmi')){path='Powered USB-C dock with HDMI and USB Power Delivery';verified=hasProtocol(source,'usb pd')||hasProtocol(source,'power delivery');needsDock=true;dockLabel='Powered USB-C HDMI dock';alternative='Use separate native HDMI and charging ports if the source has both.'}
    else if(wantsTwo){path='Verified multi-display dock';verified=usbVideo&&(hasProtocol(source,'mst')||hasProtocol(source,'thunderbolt'));needsDock=true;dockLabel='Multi-display dock';alternative='Use one display natively and a verified DisplayLink dock only if the operating system supports it.'}
    else if(hdmi){path='HDMI cable';verified=true}
    else if(displayPort){path='DisplayPort cable';verified=true}
    else if(usbVideo&&targetUsbC){path='USB-C video cable';verified=true}
    else if(usbVideo&&hasPort(destination,'hdmi')){path='USB-C to HDMI adapter or cable';verified=true;needsAdapter=true}
    else if(usbVideo&&hasPort(destination,'displayport')){path='USB-C to DisplayPort adapter or cable';verified=true;needsAdapter=true}
    steps.push(verified?'Connect the source output to the selected display input.':'Confirm that the source port explicitly supports video output.','Choose the matching input on the display.','Set resolution first, then raise refresh rate while checking stability.')
    if(chargeAndVideo)steps.splice(1,0,'Connect a charger to the dock Power Delivery input before connecting the source.')
    if(wantsTwo)steps.splice(1,0,'Verify the dock lists two independent displays for this exact operating system and source model.')
    warnings.push(wantsTwo?'Two physical sockets do not guarantee two independent external displays.':'Connector shape alone does not guarantee the required video protocol.')
  }

  const refresh=source.display&&destination.display?Math.min(source.display.maxRefreshHz,destination.display.maxRefreshHz):destination.display?.maxRefreshHz
  if(refresh&&!wantsAudio&&!wantsStorage)warnings.push(`Catalog display ceiling is ${refresh}Hz before resolution, cable, dock, and GPU bandwidth limits.`)
  if(!verified)warnings.unshift('The catalog does not contain enough directional protocol data to confirm this setup.')
  const confidence=verified?(source.confidence==='high'&&destination.confidence==='high'?'high':'medium'):'low'
  return {path,needsAdapter,needsDock,dockLabel,quantity:wantsTwo?2:1,refresh,verified,warnings,steps,alternative,confidence}
}
