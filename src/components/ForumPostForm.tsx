import { Info, MessageSquarePlus, X } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { createForumPost } from '../services/forum'
import { saveForumOwnership } from '../services/forumOwnership'
import { forumTopics } from '../data/forumTopics'
import type { Device } from '../types/device'
import type { ForumPost, ForumTopic } from '../types/forum'
import { ForumDeviceInput } from './ForumDeviceInput'

export function ForumPostForm({devices,onClose,onCreated}:{devices:Device[];onClose:()=>void;onCreated:(post:ForumPost)=>void}){
  const [authorName,setAuthorName]=useState('')
  const [device,setDevice]=useState<Device>()
  const [topic,setTopic]=useState<ForumTopic>('other')
  const [title,setTitle]=useState('')
  const [body,setBody]=useState('')
  const [website,setWebsite]=useState('')
  const [error,setError]=useState('')
  const [submitting,setSubmitting]=useState(false)

  useEffect(()=>{
    const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape')onClose()}
    document.body.classList.add('dialogOpen');window.addEventListener('keydown',onKey)
    return()=>{document.body.classList.remove('dialogOpen');window.removeEventListener('keydown',onKey)}
  },[onClose])

  async function submit(event:FormEvent){
    event.preventDefault();setError('')
    if(authorName.trim().length<2)return setError('Enter a display name with at least 2 characters.')
    if(!device)return setError('Select the device your question is about.')
    if(title.trim().length<10)return setError('Make the title a little more specific.')
    if(body.trim().length<30)return setError('Add at least 30 characters describing what happens and what you tried.')
    setSubmitting(true)
    try{
      const result=await createForumPost({authorName,title,body,topic,website,device:{id:device.id,brand:device.brand,model:device.model,category:device.category}})
      saveForumOwnership('post',result.post.id,result.ownerToken)
      onCreated(result.post)
    }catch(caught){setError(caught instanceof Error?caught.message:'Your question could not be posted.');setSubmitting(false)}
  }

  return <div className="forumDialogBackdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}>
    <section className="forumDialog" role="dialog" aria-modal="true" aria-labelledby="ask-question-title">
      <header><div><MessageSquarePlus/><h2 id="ask-question-title">Ask a question</h2></div><button type="button" onClick={onClose} aria-label="Close question form"><X/></button></header>
      <form onSubmit={submit}>
        <label className="forumField"><span>Your display name</span><input autoFocus required minLength={2} autoComplete="nickname" value={authorName} onChange={event=>setAuthorName(event.target.value)} placeholder="How should the community address you?" maxLength={50}/></label>
        <ForumDeviceInput devices={devices} value={device} onChange={setDevice} label="Device (required)"/>
        <label className="forumField"><span>Category</span><select value={topic} onChange={event=>setTopic(event.target.value as ForumTopic)}>{forumTopics.map(item=><option value={item.id} key={item.id}>{item.label}</option>)}</select></label>
        <label className="forumField"><span>Question title</span><input required minLength={10} value={title} onChange={event=>setTitle(event.target.value)} placeholder="Summarize the problem in a few words" maxLength={140}/><small>{title.length}/140</small></label>
        <label className="forumField"><span>Detailed question</span><textarea required minLength={30} value={body} onChange={event=>setBody(event.target.value)} placeholder="What happens? When did it start? What have you already tried?" rows={8} maxLength={5000}/><small>{body.length}/5000</small></label>
        <label className="forumHoney" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={website} onChange={event=>setWebsite(event.target.value)}/></label>
        <div className="forumPostingGuide"><Info/><div><b>Help others help you</b><p>Include exact symptoms, relevant settings, and steps already tried. Leave out serial numbers and personal information. You can delete your question later from this browser.</p></div></div>
        {error?<p className="forumFormError" role="alert">{error}</p>:null}
        <footer><button type="button" className="secondaryAction" onClick={onClose}>Cancel</button><button className="actionButton" disabled={submitting}>{submitting?'Posting…':'Post question'}</button></footer>
      </form>
    </section>
  </div>
}
