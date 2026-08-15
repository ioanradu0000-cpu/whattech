import type { ForumListResult, ForumPost, NewForumPost, NewForumReply } from '../types/forum'

const configuredBase=import.meta.env.VITE_API_URL?.trim().replace(/\/$/,'')
const apiBase=configuredBase||(import.meta.env.DEV?'http://localhost:3001':'')

async function request<T>(path:string,init?:RequestInit):Promise<T>{
  if(!apiBase)throw new Error('The community forum backend is not connected.')
  const response=await fetch(`${apiBase}${path}`,init)
  const data=await response.json().catch(()=>({}))
  if(!response.ok){const error=new Error(data.error||'The forum request could not be completed.') as Error&{status?:number;code?:string};error.status=response.status;error.code=data.code;throw error}
  return data as T
}

export async function listForumPosts():Promise<ForumListResult>{
  return request<ForumListResult>('/api/forum')
}

export async function getForumPost(postId:string):Promise<{post?:ForumPost}>{
  return request<{post?:ForumPost}>(`/api/forum?id=${encodeURIComponent(postId)}`)
}

export async function createForumPost(input:NewForumPost):Promise<{post:ForumPost;ownerToken:string}>{
  return request('/api/forum',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'create-post',...input})})
}

export async function createForumReply(input:NewForumReply):Promise<{post:ForumPost;replyId:string;ownerToken:string}>{
  return request('/api/forum',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'create-reply',...input})})
}

export async function deleteForumPost(postId:string,ownerToken:string):Promise<{deletedId:string}>{
  return request(`/api/forum/posts/${encodeURIComponent(postId)}`,{method:'DELETE',headers:{Authorization:`Bearer ${ownerToken}`}})
}

export async function deleteForumReply(replyId:string,ownerToken:string):Promise<{post:ForumPost}>{
  return request(`/api/forum/replies/${encodeURIComponent(replyId)}`,{method:'DELETE',headers:{Authorization:`Bearer ${ownerToken}`}})
}
