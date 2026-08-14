import type { CompatibilityResult, DecisionResult, Device, DiagnosisResult } from '../types/device'

const DISPLAY_CATEGORIES = new Set(['monitor','tv'])
const POWERED_CATEGORIES = new Set(['phone','laptop','tablet','handheld','wearable','audio','camera','storage'])
const HOST_CATEGORIES = new Set(['phone','laptop','desktop','tablet','console','handheld'])
const confidenceRank = { low:0, medium:1, high:2 } as const
const clamp = (value:number,min:number,max:number)=>Math.max(min,Math.min(max,value))
const currentYear = () => new Date().getFullYear()

function lowerConfidence(first:Device,second:Device):Device['confidence'] {
  return confidenceRank[first.confidence]<=confidenceRank[second.confidence]?first.confidence:second.confidence
}

function portFamily(port: string) {
  const value = port.toLowerCase()
  if (value.includes('thunderbolt') || value.includes('usb4') || value.includes('usb-c')) return 'usb-c'
  if (value.includes('usb-a')) return 'usb-a'
  if (value.includes('displayport')) return 'displayport'
  if (value.includes('hdmi')) return 'hdmi'
  if (value.includes('ethernet') || value.includes('gbe')) return 'ethernet'
  if (value.includes('3.5') || value.includes('audio')) return 'analog-audio'
  if (value.includes('lightning')) return 'lightning'
  return value
}

function protocolFamily(protocol: string) {
  const value = protocol.toLowerCase()
  if (value.includes('displayport')) return 'displayport'
  if (value.includes('hdmi')) return 'hdmi'
  if (value.includes('usb pd') || value.includes('power delivery')) return 'usb-pd'
  if (value.includes('pps')) return 'pps'
  if (value.includes('thunderbolt')) return 'thunderbolt'
  if (value.includes('bluetooth')) return 'bluetooth'
  if (value.includes('wi-fi') || value.includes('wifi')) return 'wifi'
  if (value.includes('usb 3') || value.includes('usb4')) return 'usb-data'
  return value
}

const shared = (first: string[], second: string[], mapper: (value: string) => string) => {
  const secondSet = new Set(second.map(mapper))
  return Array.from(new Set(first.map(mapper).filter(value => secondSet.has(value))))
}

function includesProtocol(device:Device,family:string){return device.protocols.some(protocol=>protocolFamily(protocol)===family)}
function includesPort(device:Device,family:string){return device.ports.some(port=>portFamily(port)===family)}

function displayPath(source: Device, display: Device) {
  const sourcePorts = new Set(source.ports.map(portFamily))
  const displayPorts = new Set(display.ports.map(portFamily))
  const sourceProtocols = new Set(source.protocols.map(protocolFamily))
  if (sourcePorts.has('hdmi') && displayPorts.has('hdmi')) return { path:'HDMI', adapter:false }
  if (sourcePorts.has('displayport') && displayPorts.has('displayport')) return { path:'DisplayPort', adapter:false }
  if (sourcePorts.has('usb-c') && displayPorts.has('usb-c') && (sourceProtocols.has('displayport')||sourceProtocols.has('thunderbolt'))) return { path:'USB-C video', adapter:false }
  if (sourcePorts.has('usb-c') && (sourceProtocols.has('displayport')||sourceProtocols.has('thunderbolt')) && displayPorts.has('hdmi')) return { path:'USB-C to HDMI', adapter:true }
  if (sourcePorts.has('usb-c') && (sourceProtocols.has('displayport')||sourceProtocols.has('thunderbolt')) && displayPorts.has('displayport')) return { path:'USB-C to DisplayPort', adapter:true }
  return undefined
}

function compatibilityResult(first:Device,second:Device,result:Omit<CompatibilityResult,'assumptions'|'dataQuality'>,assumptions:string[]=[]):CompatibilityResult {
  const quality=lowerConfidence(first,second)
  return {...result,assumptions,dataQuality:`Based on ${quality}-confidence catalog records updated ${first.updatedAt} and ${second.updatedAt}.`}
}

export function checkCompatibility(first: Device, second: Device): CompatibilityResult {
  const catalogConfidence=lowerConfidence(first,second)
  const portMatches = shared(first.ports, second.ports, portFamily)
  const protocolMatches = shared(first.protocols, second.protocols, protocolFamily)
  const charger = first.category === 'charger' ? first : second.category === 'charger' ? second : undefined
  const powered = charger === first ? second : first

  if (charger && POWERED_CATEGORIES.has(powered.category)) {
    const connector=includesPort(charger,'usb-c')&&includesPort(powered,'usb-c')?'USB-C':includesPort(charger,'usb-a')?'USB-A':undefined
    if (!connector) return compatibilityResult(first,second,{status:'incompatible',confidence:catalogConfidence,headline:'No direct charging connector is shared.',works:[],limitations:[`${charger.model} and ${powered.model} do not expose a matching charging connector.`],safety:['Do not force a plug or use an unverified passive power adapter.'],requiredAdapters:['Use a charger and cable matching the device input.'],explanation:'Connector compatibility fails before power negotiation can be evaluated.'})
    const sharedPd=includesProtocol(charger,'usb-pd')&&includesProtocol(powered,'usb-pd')
    const available=charger.maxOutputWatts
    const accepted=powered.maxInputWatts
    if (!sharedPd || !available || !accepted) return compatibilityResult(first,second,{status:'partial',confidence:'medium',headline:`The ${connector} connector fits, but fast-charging performance is not fully verified.`,works:[`${connector} physical connection`],limitations:[!sharedPd?'A shared USB Power Delivery profile is not listed.':'Wattage data is incomplete.','The device may fall back to a slower safe charging mode.'],safety:['Use a certified cable rated for the charger output.'],requiredAdapters:[],explanation:'Connector fit is verified, but the catalog does not contain enough negotiation and wattage data for a full-speed claim.'},['A compatible cable is still required.'])
    const negotiated=Math.min(available,accepted)
    const fullSpeed=available>=accepted
    const ppsNeeded=includesProtocol(powered,'pps')
    const ppsAvailable=includesProtocol(charger,'pps')
    const fastest=fullSpeed&&(!ppsNeeded||ppsAvailable)
    return compatibilityResult(first,second,{status:fastest?'compatible':'partial',confidence:catalogConfidence,headline:fastest?`Compatible for charging up to the device’s ${accepted}W input limit.`:`Safe charging is expected, limited to about ${negotiated}W or a non-PPS mode.`,works:[`USB Power Delivery negotiation`,`Up to ${negotiated}W available to ${powered.model}`,'The device controls how much power it accepts'],limitations:[!fullSpeed?`The charger is below the device’s ${accepted}W maximum.`:'Actual power falls as the battery fills or warms.',ppsNeeded&&!ppsAvailable?'PPS is not listed on the charger, so the fastest charging profile may not activate.':'Cable rating can reduce the negotiated power.'],safety:['Use a certified cable rated for the required current.','Replace damaged, loose, or unusually hot cables.'],requiredAdapters:[],explanation:'The result uses connector family, USB Power Delivery, PPS, and the lower of charger output and device input limits.'},['A single device is connected to the charger.','Manufacturer-specific charging limits may be lower.'])
  }

  const display = DISPLAY_CATEGORIES.has(first.category) ? first : DISPLAY_CATEGORIES.has(second.category) ? second : undefined
  const source = display === first ? second : first
  if (display && !DISPLAY_CATEGORIES.has(source.category)) {
    const path=displayPath(source,display)
    if (!path) return compatibilityResult(first,second,{status:'incompatible',confidence:catalogConfidence,headline:'No verified video path was found.',works:[],limitations:[`${source.model} has no listed video output protocol matching ${display.model}.`],safety:['Protocol conversion may require an active adapter; connector shape alone is not enough.'],requiredAdapters:['Choose an active dock or adapter explicitly supporting both endpoints.'],explanation:'The source output protocol was checked separately from the display connector.'})
    const refresh=source.display&&display.display?Math.min(source.display.maxRefreshHz,display.display.maxRefreshHz):display.display?.maxRefreshHz
    const works=[`${path.path} video path`,display.display?`${display.model} supports ${display.display.maxResolution}`:'A matching display input is listed']
    if(refresh)works.push(`Up to ${refresh}Hz before bandwidth limits`)
    return compatibilityResult(first,second,{status:path.adapter?'partial':'compatible',confidence:catalogConfidence,headline:`Video should work over ${path.path}, within the lowest device and cable limit.`,works,limitations:['Exact resolution and refresh depend on GPU output, cable bandwidth, color depth, and operating-system settings.',path.adapter?'The adapter becomes an additional bandwidth and reliability limit.':'No signal conversion is required for the listed path.'],safety:['Use a certified cable or active adapter rated for the intended resolution and refresh.'],requiredAdapters:path.adapter?[`Certified ${path.path} adapter or cable`]:[],explanation:'The engine matched a directional source output to the display input, then applied known display ceilings.'},['The source port supports video on the selected model/configuration.'])
  }

  const audio = first.category==='audio'?first:second.category==='audio'?second:undefined
  const audioHost=audio===first?second:first
  if(audio){
    const bluetooth=includesProtocol(audio,'bluetooth')&&includesProtocol(audioHost,'bluetooth')
    const analog=includesPort(audio,'analog-audio')&&includesPort(audioHost,'analog-audio')
    if(bluetooth||analog)return compatibilityResult(first,second,{status:'compatible',confidence:catalogConfidence,headline:`Audio should work over ${analog?'3.5 mm analog audio':'Bluetooth'}.`,works:[analog?'Direct analog audio connection':'Shared Bluetooth audio connection'],limitations:[bluetooth?'Codec, microphone, latency, and multipoint features can vary by operating system.':'Inline controls and microphone wiring are not guaranteed by connector shape.'],safety:['Start playback at a low volume.'],requiredAdapters:[],explanation:'The result uses an audio-specific wired or wireless path rather than generic port overlap.'})
  }

  const storage=first.category==='storage'?first:second.category==='storage'?second:undefined
  const host=storage===first?second:first
  if(storage&&HOST_CATEGORIES.has(host.category)){
    const usbC=includesPort(storage,'usb-c')&&includesPort(host,'usb-c')
    const usbA=includesPort(storage,'usb-a')&&includesPort(host,'usb-a')
    if(usbC||usbA)return compatibilityResult(first,second,{status:'partial',confidence:catalogConfidence,headline:`The drive can connect over ${usbC?'USB-C':'USB-A'}, with speed limited by the slower endpoint.`,works:['Physical USB data path'],limitations:['File-system format, cable data rating, available bus power, and operating-system support still matter.'],safety:['Eject the drive before disconnecting it.'],requiredAdapters:[],explanation:'A physical data path is present, but the catalog does not guarantee file-system or sustained-speed compatibility.'},['The selected port supports data, not charging only.'])
  }

  if (first.category === 'cable' || second.category === 'cable') {
    const cable = first.category === 'cable' ? first : second
    const device = cable === first ? second : first
    const matches = shared(cable.ports, device.ports, portFamily)
    if (!matches.length) return compatibilityResult(first,second,{status:'incompatible',confidence:catalogConfidence,headline:'This cable does not match the device connector.',works:[],limitations:[`Cable connector: ${cable.ports.join(', ')}`,`Device connectors: ${device.ports.join(', ')}`],safety:['Never force a connector.'],requiredAdapters:['Choose a cable whose connector is listed on the device.'],explanation:'The connector families do not overlap.'})
    return compatibilityResult(first,second,{status:'partial',confidence:'medium',headline:'The connector matches, but the cable’s job and second endpoint are still unknown.',works:matches.map(value=>`${value.toUpperCase()} connector match`),limitations:['A matching plug does not prove charging wattage, data speed, or video bandwidth.'],safety:['Check the cable’s manufacturer-rated wattage and data/video standard.'],requiredAdapters:[],explanation:'One physical endpoint matches; complete compatibility requires the other endpoint and intended use.'})
  }

  if(first.category===second.category)return compatibilityResult(first,second,{status:'unknown',confidence:'low',headline:'These are peer devices, so compatibility depends on the specific task.',works:protocolMatches.filter(value=>['bluetooth','wifi'].includes(value)).map(value=>`Both list ${value}`),limitations:['Shared Wi-Fi or Bluetooth versions do not mean the devices directly perform the same job together.'],safety:['Choose the intended connection or accessory before relying on this result.'],requiredAdapters:[],explanation:'The engine avoids treating two similar products as compatible merely because they share common wireless standards.'})

  if (portMatches.length || protocolMatches.length) return compatibilityResult(first,second,{status:'partial',confidence:'medium',headline:'At least one physical or wireless connection is shared.',works:[...portMatches.map(value=>`${value.toUpperCase()} connector family`),...protocolMatches.slice(0,3).map(value=>`${value} support`)],limitations:['No category-specific rule confirms the intended function for this pair.'],safety:['Confirm direction, power limits, and manufacturer restrictions before buying an adapter.'],requiredAdapters:[],explanation:'Shared ports and protocols show a plausible path, but not enough information for a guaranteed function.'})
  return compatibilityResult(first,second,{status:'unknown',confidence:'low',headline:'There is not enough verified overlap for a reliable answer.',works:[],limitations:['No shared connector or protocol was found in the current catalog.'],safety:['Do not assume electrical or physical compatibility.'],requiredAdapters:[],explanation:'The engine reports uncertainty instead of inferring compatibility from unrelated product attributes.'})
}

export type DiagnosisInput = { issue:string; details:string; answers:Record<string,string> }
type CauseWeight = { label:string; weight:number }
type DiagnosisProfile = { causes:CauseWeight[]; steps:string[]; repairCost:[number,number]; baseConfidence:Device['confidence'] }

function normalizeCauses(causes:CauseWeight[]){
  const total=causes.reduce((sum,cause)=>sum+Math.max(0,cause.weight),0)||1
  const normalized=causes.map(cause=>({label:cause.label,probability:Math.round(Math.max(0,cause.weight)/total*100)})).sort((a,b)=>b.probability-a.probability)
  const difference=100-normalized.reduce((sum,cause)=>sum+cause.probability,0)
  if(normalized[0])normalized[0].probability+=difference
  return normalized
}

function diagnosisProfile(issue:string,device:Device):DiagnosisProfile {
  const category=device.category
  const professional:[number,number]=category==='laptop'?[90,280]:category==='phone'?[60,190]:category==='monitor'||category==='tv'?[70,320]:[40,240]
  if(issue==='Battery')return {causes:[{label:'Battery wear or failed cell',weight:55},{label:'Background software or radio activity',weight:28},{label:'Heat or charging-system fault',weight:17}],steps:['Review battery health and per-app usage in system settings','Restart and install current stable system updates','Test for one normal day with background activity reduced','Back up data before arranging a battery inspection'],repairCost:category==='laptop'?[110,260]:[65,140],baseConfidence:'high'}
  if(issue==='Charging')return {causes:[{label:'Cable or power-adapter problem',weight:46},{label:'Dirty, loose, or worn charging port',weight:34},{label:'Battery or charging-circuit fault',weight:20}],steps:['Test one known-good certified charger and cable','Inspect the powered-off port with a light; do not use metal tools','Test while the device is cool and remove non-essential accessories','Run the manufacturer battery or power diagnostic'],repairCost:[20,180],baseConfidence:'high'}
  if(['No display','Screen','Flickering','Wrong resolution'].includes(issue))return {causes:[{label:'Cable, input, or display-setting problem',weight:44},{label:'Panel, backlight, or internal display fault',weight:32},{label:'Graphics output or mainboard fault',weight:24}],steps:['Power down and reconnect the complete display path','Test one known-good certified cable and one display/input','Reset resolution, refresh rate, and display-detection settings','Run built-in display or graphics diagnostics'],repairCost:[20,professional[1]],baseConfidence:'medium'}
  if(issue==='Won’t turn on')return {causes:[{label:'External power, adapter, battery, or port fault',weight:48},{label:'Embedded controller or firmware state',weight:25},{label:'Mainboard power fault',weight:27}],steps:['Disconnect accessories and hold the power button for 15 seconds','Try a known-good compatible power source and wall outlet','Record any lights, sounds, vibration, or error pattern','Use the manufacturer power-reset or diagnostic procedure'],repairCost:professional,baseConfidence:'medium'}
  if(issue==='Won’t boot')return {causes:[{label:'Operating-system or update failure',weight:43},{label:'Storage or file-system fault',weight:34},{label:'Memory or mainboard fault',weight:23}],steps:['Record the exact logo, message, or recovery screen','Disconnect non-essential accessories and restart once','Use manufacturer recovery diagnostics without erasing data','Back up or recover important data before reinstalling software'],repairCost:professional,baseConfidence:'medium'}
  if(['Overheating','Noise'].includes(issue))return {causes:[{label:'Blocked airflow, dust, or fan problem',weight:45},{label:'Heavy background load or software fault',weight:31},{label:'Thermal interface, battery, or power fault',weight:24}],steps:['Stop heavy workloads and back up important data','Check vents, fans, and background CPU/GPU activity','Update stable firmware, operating system, and drivers','Run the manufacturer thermal diagnostic on a hard surface'],repairCost:[0,professional[1]],baseConfidence:'medium'}
  if(['Slow performance','Performance','Crashing','Storage'].includes(issue))return {causes:[{label:'Low storage, memory pressure, or background load',weight:43},{label:'Software, driver, or update instability',weight:34},{label:'Storage, memory, or thermal hardware fault',weight:23}],steps:['Back up important data before stress testing','Check free storage and live CPU/memory usage','Install stable operating-system and manufacturer updates','Run built-in memory, storage, and thermal diagnostics'],repairCost:[0,professional[1]],baseConfidence:'medium'}
  if(['Internet / Wi-Fi','Connectivity','Bluetooth / connectivity'].includes(issue))return {causes:[{label:'Router, pairing, or saved-network state',weight:47},{label:'Driver, firmware, or operating-system fault',weight:32},{label:'Radio hardware or antenna fault',weight:21}],steps:['Confirm another device works on the same network or accessory','Restart both endpoints, then forget and re-add the connection','Test nearby with interference and VPN/hotspot variables removed','Install stable device and router/accessory updates'],repairCost:[0,120],baseConfidence:'medium'}
  if(['Camera','Audio','No audio','Distortion'].includes(issue))return {causes:[{label:'Permission, input/output, or app setting',weight:48},{label:'App, driver, or firmware fault',weight:30},{label:'Physical camera, microphone, speaker, or jack fault',weight:22}],steps:['Test with the manufacturer’s built-in camera or audio app','Check privacy permissions and the selected input/output','Restart and install stable system and app updates','Test one known-good external accessory when possible'],repairCost:[0,190],baseConfidence:'medium'}
  if(issue==='Physical damage')return {causes:[{label:'Visible enclosure, glass, or connector damage',weight:50},{label:'Battery or liquid-related internal damage',weight:32},{label:'Hidden board, cable, or sensor damage',weight:18}],steps:['Power off and disconnect charging if safe','Photograph the damage and avoid flexing or pressing the area','Back up data only if the device stays cool and stable','Request a written inspection covering parts, labor, and warranty'],repairCost:professional,baseConfidence:'high'}
  return {causes:[{label:'Software or configuration issue',weight:40},{label:'Accessory or connection problem',weight:33},{label:'Internal hardware fault',weight:27}],steps:['Record the exact symptom and any error message','Note what changed immediately before it started','Disconnect non-essential accessories and restart once','Run the manufacturer diagnostic and back up important data'],repairCost:[0,professional[1]],baseConfidence:'low'}
}

export function diagnose(device: Device, input: DiagnosisInput|string): DiagnosisResult {
  const details=typeof input==='string'?input:input.details
  const issue=typeof input==='string'?'Other':input.issue
  const answers=typeof input==='string'?{}:input.answers
  const profile=diagnosisProfile(issue,device)
  const causes=profile.causes.map(cause=>({...cause}))
  const answerEntries=Object.entries(answers)
  const answeredYes=(pattern:RegExp)=>answerEntries.some(([question,answer])=>pattern.test(question)&&answer==='Yes')
  const answeredNo=(pattern:RegExp)=>answerEntries.some(([question,answer])=>pattern.test(question)&&answer==='No')
  const evidence:string[]=[]
  const age=Math.max(0,currentYear()-device.releaseYear)
  if(age>=3){const wear=causes.find(cause=>/wear|battery|storage|fan|hardware|panel/.test(cause.label.toLowerCase()));if(wear)wear.weight*=1.2;evidence.push(`The device is about ${age} years old.`)}
  if(answeredYes(/known-good|tested a known-good/i)){const accessory=causes.find(cause=>/cable|adapter|external power/.test(cause.label.toLowerCase()));if(accessory)accessory.weight*=.45;const internal=causes.find(cause=>/port|circuit|mainboard/.test(cause.label.toLowerCase()));if(internal)internal.weight*=1.35;evidence.push('The symptom remains with a known-good power accessory.')}
  if(answeredYes(/loose|become hot/i)){const port=causes.find(cause=>/port|connector/.test(cause.label.toLowerCase()));if(port)port.weight*=1.65;evidence.push('The connector feels loose or becomes hot.')}
  if(answeredYes(/other devices work|other devices connect|same network/i)){const network=causes.find(cause=>/router|pairing/.test(cause.label.toLowerCase()));if(network)network.weight*=.65;const deviceFault=causes.find(cause=>/driver|hardware|antenna/.test(cause.label.toLowerCase()));if(deviceFault)deviceFault.weight*=1.25;evidence.push('Other devices work on the same connection.')}
  if(answeredNo(/other devices work|other devices connect|same network/i)){const network=causes.find(cause=>/router|pairing/.test(cause.label.toLowerCase()));if(network)network.weight*=1.45;evidence.push('Other devices also fail on the same connection.')}
  if(answeredYes(/suddenly|after an update|hardware change/i)){const software=causes.find(cause=>/software|driver|update|operating-system|firmware/.test(cause.label.toLowerCase()));if(software)software.weight*=1.35;evidence.push('The problem began suddenly or after a change.')}
  if(answeredYes(/unusually hot|shut down under load/i)){const thermal=causes.find(cause=>/heat|thermal|airflow|battery/.test(cause.label.toLowerCase()));if(thermal)thermal.weight*=1.45;evidence.push('Heat or load changes the symptom.')}
  const hazardInDetails=/\b(swollen|bulging|leaking|sparking|burnt smell|burning smell|smoke|very hot|liquid damage)\b/i.test(details)
  const hazardAnswer=answerEntries.some(([question,answer])=>answer==='Yes'&&/swollen|liquid|sparking|burnt|smell|extreme heat|physical damage/i.test(question))
  const safety=hazardInDetails||hazardAnswer?'Stop using and charging the device. Do not open, puncture, press, heat, freeze, or immerse it; arrange qualified inspection.':issue==='Physical damage'?'Stop if there is battery swelling, liquid, sharp glass, sparking, smell, or unusual heat.':issue==='Charging'?'Stop if the connector becomes hot, smells burnt, sparks, or fits loosely.':issue==='Overheating'?'Stop demanding workloads if it shuts down, smells burnt, or becomes too hot to touch.':undefined
  if(hazardInDetails||hazardAnswer){causes.forEach(cause=>cause.weight*=.35);causes.unshift({label:'Potential battery, liquid, or power hazard',weight:100});evidence.unshift('A safety-related symptom was reported.')}
  const normalized=normalizeCauses(causes).slice(0,3)
  const answerCount=answerEntries.filter(([,answer])=>answer&&answer!=='Don’t know').length
  const confidence:Device['confidence']=(hazardInDetails||hazardAnswer)||(profile.baseConfidence==='high'&&answerCount>=2&&normalized[0].probability>=48)?'high':profile.baseConfidence==='low'&&answerCount<2?'low':'medium'
  if(!evidence.length)evidence.push(answerCount?`${answerCount} focused checks were included.`:'The result is based mainly on the selected symptom.')
  const professionalRecommended=Boolean(safety)||issue==='Physical damage'||normalized[0].probability>=50&&/mainboard|internal|panel|battery/.test(normalized[0].label.toLowerCase())
  return {title:hazardInDetails||hazardAnswer?'Potential safety-related hardware condition':`${normalized[0].label} is the leading explanation`,confidence,causes:normalized,steps:profile.steps,safety,repairCost:profile.repairCost,professionalRecommended,evidence,uncertainty:confidence==='high'?'The answers strongly favor this path, but remote diagnosis cannot confirm a failed part.':confidence==='medium'?'Several causes still fit; complete the steps in order and stop when the symptom changes.':'The symptom is broad. More exact behavior or an error message could materially change the ranking.'}
}

export function decide(device: Device, condition: number, repairCost: number, replacementCost: number, performanceAdequate: boolean, issue='Other'): DecisionResult {
  const age=Math.max(0,currentYear()-device.releaseYear)
  const value=(device.estimatedValueEur[0]+device.estimatedValueEur[1])/2
  const remainingLife=Math.max(0,device.estimatedLifespanYears-age)
  const repairToReplacement=repairCost/Math.max(replacementCost,1)
  const repairToValue=repairCost/Math.max(value,1)
  const supportRemaining=device.softwareSupportUntil?device.softwareSupportUntil-currentYear():remainingLife
  const repairRisk={easy:.03,moderate:.09,professional:.15}[device.repairability]+(['Physical damage','Other','Storage','Performance'].includes(issue)?.08:.03)
  const economics=clamp((.55-repairToReplacement)*100,-35,45)
  const lifeScore=clamp(remainingLife*5,0,22)
  const conditionScore=(condition-3)*7
  const needsScore=performanceAdequate?13:-20
  const supportScore=supportRemaining>2?9:supportRemaining>0?2:-14
  const repairAppeal=clamp(38+economics+lifeScore+conditionScore+needsScore+supportScore-repairRisk*45,0,100)
  const factors=[`${age} years old`, `Repair is ${Math.round(repairToReplacement*100)}% of replacement cost`, `Repair is ${Math.round(repairToValue*100)}% of current estimated value`, `${remainingLife} years of typical life remain`,device.softwareSupportUntil?`${Math.max(0,supportRemaining)} years of listed software support remain`:'No verified software-support date']
  const confidence=Math.round(clamp(58+Math.abs(repairAppeal-58)*.7+(device.confidence==='high'?8:device.confidence==='low'?-8:0),52,95))
  if(repairCost<=0&&performanceAdequate)return {action:'KEEP',reason:'The device still meets your needs and no paid repair is currently required.',score:confidence,factors,nextStep:'Keep using it and reassess when reliability, support, or performance changes.',counterpoint:'Preventive replacement may still make sense if downtime would be unusually costly.'}
  if(replacementCost<=0)return {action:'WAIT',reason:'A realistic replacement price is required before repair economics can be compared.',score:55,factors,nextStep:'Price the replacement configuration you would actually buy.',counterpoint:'The repair quote alone cannot establish whether replacement is better value.'}
  if(repairCost>=replacementCost*.8||repairToValue>1.1)return {action:'REPLACE',reason:'The repair consumes most of the replacement budget or exceeds the device’s current value.',score:confidence,factors,nextStep:'Confirm data backup, warranty, and the full replacement configuration before purchasing.',counterpoint:'Repair can still be justified for data recovery, sustainability, or a specialized configuration.'}
  if(!performanceAdequate&&repairCost>replacementCost*.2)return {action:'UPGRADE',reason:'The repair would preserve a device that already falls short of your needs.',score:confidence,factors,nextStep:'Compare a target replacement using the upgrade tool before paying for repair.',counterpoint:'A low-cost repair may still be worthwhile as a temporary or secondary device.'}
  if(supportRemaining<=0&&age>=device.estimatedLifespanYears-1)return {action:'REPLACE',reason:'Useful-life and software-support signals are both at or beyond their expected endpoint.',score:confidence,factors,nextStep:'Plan replacement after securing a current backup and account recovery information.',counterpoint:'Offline or low-risk use may justify keeping it longer if the repair is minor.'}
  if(repairAppeal>=62)return {action:'KEEP',modifier:'REPAIR',reason:'The quote is low enough relative to replacement, and the device retains useful supported life.',score:confidence,factors,nextStep:'Get a written repair scope covering parts, labor, warranty, and whether the quote can increase.',counterpoint:`The estimate includes about ${Math.round(repairRisk*100)}% repair-risk allowance for issue and repairability uncertainty.`}
  if(repairAppeal>=46)return {action:'WAIT',reason:'Repair and replacement are close enough that one better price could change the decision.',score:confidence,factors,nextStep:'Get a second written repair quote and confirm the exact replacement cost.',counterpoint:'Choose replacement sooner if downtime or another likely failure would be expensive.'}
  return {action:'REPLACE',reason:'Limited remaining life, condition, support, or repair economics make further investment hard to recover.',score:confidence,factors,nextStep:'Back up data and compare replacement options before authorizing the repair.',counterpoint:'Repair may still be preferable when environmental impact or data continuity matters more than cost.'}
}
