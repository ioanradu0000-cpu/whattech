type ForumResource='post'|'reply'
type OwnershipStore={version:1;posts:Record<string,string>;replies:Record<string,string>}

const STORAGE_KEY='whattech.forum-ownership.v1'

function readStore():OwnershipStore{
  try{
    const parsed=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null') as Partial<OwnershipStore>|null
    if(parsed?.version===1&&parsed.posts&&parsed.replies)return parsed as OwnershipStore
  }catch{/* Use an empty ownership store when browser storage is unavailable or invalid. */}
  return {version:1,posts:{},replies:{}}
}

function writeStore(store:OwnershipStore){
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(store))}catch{/* Deletion access remains unavailable if storage is blocked. */}
}

function bucket(store:OwnershipStore,resource:ForumResource){return resource==='post'?store.posts:store.replies}

export function saveForumOwnership(resource:ForumResource,id:string,token:string){
  if(!id||!token)return
  const store=readStore()
  bucket(store,resource)[id]=token
  writeStore(store)
}

export function getForumOwnership(resource:ForumResource,id:string){
  return bucket(readStore(),resource)[id]
}

export function forgetForumOwnership(resource:ForumResource,id:string){
  const store=readStore()
  delete bucket(store,resource)[id]
  writeStore(store)
}

export function forgetPostAndReplies(postId:string,replyIds:string[]){
  const store=readStore()
  delete store.posts[postId]
  for(const replyId of replyIds)delete store.replies[replyId]
  writeStore(store)
}
