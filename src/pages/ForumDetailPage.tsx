import { ArrowLeft, CheckCircle2, CircleDot, Info, MessageCircle, MessageSquarePlus, Send, ShieldCheck, ThumbsUp, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ForumPostForm } from '../components/ForumPostForm'
import { Seo } from '../components/Seo'
import { forumTopicLabel } from '../data/forumTopics'
import { useDevices } from '../hooks/useDevices'
import { createForumReply, deleteForumPost, deleteForumReply, getForumPost } from '../services/forum'
import { forgetForumOwnership, forgetPostAndReplies, getForumOwnership, saveForumOwnership } from '../services/forumOwnership'
import type { ForumPost } from '../types/forum'

const dateFormat=new Intl.DateTimeFormat('en',{dateStyle:'medium',timeStyle:'short'})

export function ForumDetailPage(){
  const {postId=''}=useParams();const navigate=useNavigate();const devices=useDevices()
  const [post,setPost]=useState<ForumPost>();const [loading,setLoading]=useState(true);const [error,setError]=useState('');const [asking,setAsking]=useState(false)
  const [authorName,setAuthorName]=useState('');const [body,setBody]=useState('');const [website,setWebsite]=useState('');const [replyError,setReplyError]=useState('');const [submitting,setSubmitting]=useState(false);const [posted,setPosted]=useState(false)
  const [deleting,setDeleting]=useState('');const [deleteError,setDeleteError]=useState('')
  const [replying,setReplying]=useState(false)
  const closeForm=useCallback(()=>setAsking(false),[])

  const loadPost=useCallback(()=>{setLoading(true);setError('');return getForumPost(postId).then(result=>setPost(result.post)).catch(caught=>{setPost(undefined);setError(caught instanceof Error?caught.message:'The question could not load.')}).finally(()=>setLoading(false))},[postId])
  useEffect(()=>{let active=true;getForumPost(postId).then(result=>{if(active)setPost(result.post)}).catch(caught=>{if(active)setError(caught instanceof Error?caught.message:'The question could not load.')}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[postId])

  async function submitReply(event:FormEvent){
    event.preventDefault();setReplyError('');setPosted(false)
    if(authorName.trim().length<2)return setReplyError('Enter a display name with at least 2 characters.')
    if(body.trim().length<15)return setReplyError('Add a little more detail so your response is useful.')
    setSubmitting(true)
    try{
      const result=await createForumReply({postId,authorName,body,website})
      saveForumOwnership('reply',result.replyId,result.ownerToken)
      setPost(result.post);setBody('');setPosted(true)
    }catch(caught){setReplyError(caught instanceof Error?caught.message:'Your response could not be posted.')}
    finally{setSubmitting(false)}
  }

  async function removePost(ownerToken:string){
    if(!post||!window.confirm('Delete this question and all of its responses? This cannot be undone.'))return
    setDeleting(`post:${post.id}`);setDeleteError('')
    try{
      await deleteForumPost(post.id,ownerToken)
      forgetPostAndReplies(post.id,post.replies?.map(reply=>reply.id)||[])
      navigate('/forum',{replace:true})
    }catch(caught){setDeleteError(caught instanceof Error?caught.message:'The question could not be deleted.');setDeleting('')}
  }

  async function removeReply(replyId:string,ownerToken:string){
    if(!window.confirm('Delete this response? This cannot be undone.'))return
    setDeleting(`reply:${replyId}`);setDeleteError('')
    try{
      const result=await deleteForumReply(replyId,ownerToken)
      forgetForumOwnership('reply',replyId);setPost(result.post)
    }catch(caught){setDeleteError(caught instanceof Error?caught.message:'The response could not be deleted.')}
    finally{setDeleting('')}
  }

  if(loading)return <main className="forumDetailPage"><div className="forumEmpty"><div className="forumLoader"/><h1>Loading question…</h1></div></main>
  if(!post)return <main className="forumDetailPage"><Seo title="Question unavailable" description="This forum question could not be loaded."/><div className="forumEmpty" role="alert"><Info/><h1>Question unavailable</h1><p>{error||'It may have been removed or the link is incorrect.'}</p><div className="forumEmptyActions"><button type="button" className="secondaryAction" onClick={()=>void loadPost()}>Try again</button><Link className="secondaryAction" to="/forum"><ArrowLeft/>Back to forum</Link></div></div></main>

  const postOwnerToken=getForumOwnership('post',post.id)

  return <main className="forumDetailPage">
    <Seo title={post.title} description={post.body.slice(0,155)}/>
    <div className="forumDetailTop"><Link to="/forum"><ArrowLeft/>Community Forum</Link><button className="actionButton" onClick={()=>setAsking(true)}><MessageSquarePlus/>Ask a question</button></div>
    <div className="forumDetailLayout">
      <article className="forumQuestion">
        <header>
          <div className="forumQuestionTitle"><h1>{post.title}</h1>{postOwnerToken?<button type="button" className="forumDeleteButton" disabled={deleting===`post:${post.id}`} onClick={()=>void removePost(postOwnerToken)}><Trash2/>{deleting===`post:${post.id}`?'Deleting…':'Delete question'}</button>:null}</div>
          <div className="forumQuestionByline"><span className={`forumStatus ${post.status}`}>{post.status==='solved'?<CheckCircle2/>:<CircleDot/>}<b>{post.status==='solved'?'Solved':'Open'}</b></span><span className="forumQuestionDevice">{post.device.brand} {post.device.model}</span><span className="forumQuestionTopic">{forumTopicLabel.get(post.topic)}</span><span className="forumQuestionAuthor">Asked by {post.authorName}</span><time dateTime={post.createdAt}>{dateFormat.format(new Date(post.createdAt))}</time></div>
        </header>
        <div className="forumQuestionBody">{post.body.split('\n').map((paragraph,index)=><p key={index}>{paragraph}</p>)}</div>
        <span className="forumHelpful"><ThumbsUp/>{post.helpfulCount} people marked this helpful</span>
        {deleteError?<p className="forumFormError forumDeleteError" role="alert">{deleteError}</p>:null}
      </article>
      <aside className="forumQuestionMeta"><h2>About this question</h2><dl><div><dt>Device</dt><dd>{post.device.brand} {post.device.model}</dd></div><div><dt>Category</dt><dd>{forumTopicLabel.get(post.topic)}</dd></div><div><dt>Status</dt><dd className={post.status}>{post.status==='solved'?'Solved':'Open'}</dd></div><div><dt>Activity</dt><dd>{post.replyCount} responses · {post.viewCount} views</dd></div></dl></aside>
      <section className="forumResponses">
        <header><div><MessageCircle/><h2>{post.replyCount} {post.replyCount===1?'response':'responses'}</h2></div></header>
        {post.replies?.length?<div>{post.replies.map(reply=>{
          const replyOwnerToken=getForumOwnership('reply',reply.id)
          return <article className={reply.isAccepted?'forumReply accepted':'forumReply'} key={reply.id}>
            <header><div><b>{reply.authorName}</b><time dateTime={reply.createdAt}>{dateFormat.format(new Date(reply.createdAt))}</time></div><div className="forumReplyActions">{reply.isAccepted?<span><CheckCircle2/>Accepted solution</span>:null}{replyOwnerToken?<button type="button" className="forumDeleteButton compact" disabled={deleting===`reply:${reply.id}`} onClick={()=>void removeReply(reply.id,replyOwnerToken)} aria-label={`Delete response by ${reply.authorName}`}><Trash2/>{deleting===`reply:${reply.id}`?'Deleting…':'Delete'}</button>:null}</div></header>
            <p>{reply.body}</p><span className="forumReplyHelpful"><ThumbsUp/>{reply.helpfulCount} helpful</span>
          </article>
        })}</div>:<div className="forumNoReplies"><MessageCircle/><div><h3>No responses yet</h3><p>Be the first person to help with this device question.</p></div></div>}
      </section>
      <section className="forumReplyComposer"><header className="forumReplyComposerHead"><h2>Write a response</h2><button type="button" className="actionButton mobileReplyToggle" aria-expanded={replying} aria-controls="forum-reply-form" onClick={()=>setReplying(value=>!value)}>{replying?'Close form':'Write a response'}</button></header><form id="forum-reply-form" className={replying?'mobileOpen':''} onSubmit={submitReply}><label className="forumField"><span>Display name</span><input required minLength={2} autoComplete="nickname" value={authorName} onChange={event=>setAuthorName(event.target.value)} placeholder="Your display name" maxLength={50}/></label><label className="forumField forumResponseField"><span>Your response</span><textarea required minLength={15} value={body} onChange={event=>setBody(event.target.value)} placeholder="Share a clear solution, useful test, or relevant experience…" rows={5} maxLength={4000}/><small>{body.length}/4000</small></label><label className="forumHoney" aria-hidden="true">Website<input tabIndex={-1} value={website} onChange={event=>setWebsite(event.target.value)}/></label><p className="forumSafety"><ShieldCheck/>Be respectful and avoid personal information. You can delete your response later from this browser.</p>{replyError?<p className="forumFormError" role="alert">{replyError}</p>:null}{posted?<p className="forumFormSuccess" role="status"><CheckCircle2/>Your response has been posted.</p>:null}<button className="actionButton" disabled={submitting}><Send/>{submitting?'Posting…':'Post response'}</button></form></section>
    </div>
    {asking?<ForumPostForm devices={devices} onClose={closeForm} onCreated={created=>navigate(`/forum/${created.id}`)}/>:null}
  </main>
}
