import { ArrowRight, BatteryMedium, Camera, Check, CircleHelp, Gauge, MonitorSmartphone, PlugZap, Power, RotateCcw, ShieldAlert, Thermometer, Volume2, Wifi, Wrench } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { DeviceSelector } from '../components/DeviceSelector'
import { Seo } from '../components/Seo'
import { ToolPageHeader } from '../components/ToolPageHeader'
import { WebResearch } from '../components/WebResearch'
import { useDevices } from '../hooks/useDevices'
import { diagnose } from '../services/engines'
import { researchDeviceProblem } from '../services/research'
import { deviceFromSearch, valueFromSearch } from '../services/searchIntent'
import type { Device, DiagnosisResult } from '../types/device'
import type { ResearchState } from '../types/research'

const issueSets = {
  computer:['Won’t turn on','Won’t boot','No display','Crashing','Overheating','Slow performance','Internet / Wi-Fi','Storage','USB / peripherals','Noise','Power','Physical damage','Other'],
  mobile:['Battery','Charging','Screen','Performance','Overheating','Camera','Audio','Connectivity','Won’t turn on','Physical damage','Other'],
  display:['No display','Flickering','Wrong resolution','No audio','Power','Physical damage','Other'],
  audio:['No audio','Bluetooth / connectivity','Charging','Battery','Distortion','Physical damage','Other'],
}

const questionSets: Record<string,string[]> = {
  Battery:['Is the battery more than two years old?','Does the device become unusually hot?','Has battery life fallen suddenly?'],
  Charging:['Have you tested a known-good compatible charger and cable?','Does the connector feel loose or become hot?','Is there visible liquid or physical damage?'],
  'No display':['Does the device power on?','Do fans, sounds, or indicator lights turn on?','Did this begin after changing a cable, display, or hardware?'],
  'Won’t turn on':['Have you tried a known-good power source?','Are there any lights, sounds, or vibration?','Was there recent liquid or physical damage?'],
  'Won’t boot':['Can you reach a logo, firmware screen, or recovery mode?','Did this start after an update or hardware change?','Is important data already backed up?'],
  Overheating:['Are vents blocked or fans unusually loud?','Does it shut down under load?','Is there swelling, smell, or extreme heat while idle?'],
  'Internet / Wi-Fi':['Do other devices work on the same network?','Does it work close to the router?','Did the issue begin after an update or router change?'],
  Connectivity:['Do other devices connect normally?','Does restarting and re-pairing help?','Did this start after an update?'],
  'Physical damage':['Is there liquid damage?','Is the battery swollen or the device unusually hot?','Does the device still operate safely?'],
}
const fallbackQuestions=['Does the device still turn on?','Did the problem begin suddenly?','Was there recent physical, liquid, or power damage?']
const issueIcons:Record<string,typeof CircleHelp>={Battery:BatteryMedium,Charging:PlugZap,Screen:MonitorSmartphone,Performance:Gauge,Overheating:Thermometer,Camera,Audio:Volume2,Connectivity:Wifi,'Internet / Wi-Fi':Wifi,'Won’t turn on':Power,'Physical damage':ShieldAlert}

function issueGroup(device: Device) {
  if (['desktop','component','laptop','storage','peripheral'].includes(device.category)) return issueSets.computer
  if (['monitor','tv'].includes(device.category)) return issueSets.display
  if (device.category==='audio') return issueSets.audio
  return issueSets.mobile
}

export function FixDevicePage() {
  const devices=useDevices()
  const presetDevice=deviceFromSearch(devices,'device')
  const presetIssue=valueFromSearch('issue')
  const [device,setDevice]=useState<Device|undefined>(presetDevice)
  const [issue,setIssue]=useState(()=>presetDevice&&presetIssue&&issueGroup(presetDevice).includes(presetIssue)?presetIssue:'')
  const [details,setDetails]=useState('')
  const [answers,setAnswers]=useState<Record<string,string>>({})
  const [result,setResult]=useState<DiagnosisResult>()
  const [research,setResearch]=useState<ResearchState>({status:'idle'})
  const researchRequest=useRef(0)
  const issues=device?issueGroup(device):issueSets.mobile
  const questions=useMemo(()=>questionSets[issue]||fallbackQuestions,[issue])

  function cancelResearch(){researchRequest.current+=1;setResearch({status:'idle'})}
  function changeDevice(value:Device|undefined){setDevice(value);setIssue('');setDetails('');setAnswers({});setResult(undefined);cancelResearch()}
  function changeIssue(value:string){setIssue(value);setDetails('');setAnswers({});setResult(undefined);cancelResearch()}
  async function startResearch(){
    if(!device||!issue)return
    const requestId=++researchRequest.current
    setResearch({status:'loading'})
    try{
      const data=await researchDeviceProblem({device,issue,details})
      if(requestId===researchRequest.current)setResearch({status:'success',data})
    }catch(error){
      if(requestId===researchRequest.current)setResearch({status:'error',message:error instanceof Error?error.message:'Live research could not be completed.'})
    }
  }
  function run(){
    if(!device||!issue)return
    const localDiagnosis=diagnose(device,{issue,details,answers})
    setResult(localDiagnosis)
    setResearch({status:'idle'})
  }
  function resetAnswers(){setResult(undefined);setAnswers({});cancelResearch()}

  return <main className="flowPage">
    <Seo title="Fix My Device" description="Interactive, safety-conscious troubleshooting with optional community research from Reddit and technical forums." />
    <ToolPageHeader title="Fix My Device" description="Choose your device, describe the problem, and follow focused checks." steps={['Device','Issue','Questions','Diagnosis']} currentStep={result?4:issue?3:device?2:1}/>
    {!device?<DeviceSelector devices={devices} value={device} onChange={setDevice} label="Choose your device"/>:<div className="troubleshoot">
      <DeviceSelector devices={devices} value={device} onChange={changeDevice} label="Choose your device"/>
      <section><h2>What is wrong?</h2><div className="issueGrid">{issues.map(item=>{const Icon=issueIcons[item]||CircleHelp;return <button className={issue===item?'active':''} onClick={()=>changeIssue(item)} key={item}><Icon/>{item}</button>})}</div>{issue?<label className="problemDetails"><span>Describe exactly what happens <small>Helps Community Search match the exact symptom</small></span><textarea value={details} maxLength={600} onChange={event=>setDetails(event.target.value)} placeholder="Example: Charging stops unless the cable is held at an angle, even with another cable."/><small>Do not include passwords, serial numbers, email addresses, or other personal information.</small></label>:null}</section>
      {issue?<section className="followUps"><h2>Three focused checks</h2>{questions.map(question=><div key={question}><b>{question}</b><span>{['Yes','No','Don’t know'].map(answer=><button className={answers[question]===answer?'active':''} onClick={()=>setAnswers(current=>({...current,[question]:answer}))} key={answer}>{answer}</button>)}</span></div>)}<button className="actionButton" disabled={Object.keys(answers).length<questions.length} onClick={run}>Get diagnosis <ArrowRight/></button></section>:null}
      {result?<DiagnosisView result={result} research={research} startResearch={()=>void startResearch()} reset={resetAnswers}/>:null}
    </div>}
  </main>
}

function DiagnosisView({result,research,startResearch,reset}:{result:DiagnosisResult;research:ResearchState;startResearch:()=>void;reset:()=>void}) {
  return <section className="fixResult resultReveal">
    <div className="likelyCause"><span><Wrench/></span><div><small>Best answer</small><h2>{result.title}</h2><p>{result.confidence} confidence based on this symptom path.</p></div></div>
    <div className="causeRanks">{result.causes.map(cause=><div key={cause.label}><span>{cause.label}</span><b>{cause.probability}%</b><i style={{width:`${cause.probability}%`}}/></div>)}</div>
    <div className="tryFirst"><h3>What to try, in order</h3>{result.steps.map((step,index)=><div key={step}><span>{index+1}</span><p>{step}</p><Check/></div>)}</div>
    <div className="engineReasoning"><h3>Why this ranks first</h3>{result.evidence.map(item=><p key={item}><Check/>{item}</p>)}<small>{result.uncertainty}</small></div>
    <div className="riskFacts"><div><small>Difficulty</small><b>{result.professionalRecommended?'Professional':'Beginner checks first'}</b></div><div><small>Confidence</small><b>{result.confidence}</b></div><div><small>Likely repair range</small><b>{result.repairCost[1]?`€${result.repairCost[0]}–€${result.repairCost[1]}`:'No paid repair yet'}</b></div></div>
    {result.safety?<div className="safetyStop"><ShieldAlert/><div><b>Stop and get professional help</b><p>{result.safety}</p></div></div>:null}
    <WebResearch state={research} onStart={startResearch} onRetry={startResearch}/>
    <button className="secondaryAction" onClick={reset}><RotateCcw/>Change answers</button>
  </section>
}
