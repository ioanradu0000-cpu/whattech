import { createHash, randomUUID } from 'node:crypto'
import { Router } from 'express'
import { ipKeyGenerator, rateLimit } from 'express-rate-limit'
import { pool } from './db.mjs'

const router=Router()
const topicIds=new Set(['charging-power','display','performance','software','connectivity','audio','accessories','other'])
const categoryIds=new Set(['phone','laptop','desktop','component','tablet','monitor','tv','console','handheld','audio','camera','charger','cable','adapter','dock','storage','networking','smart-home','wearable','peripheral','other'])

const writeLimiter=rateLimit({
  windowMs:10*60*1000,
  limit:12,
  standardHeaders:'draft-8',
  legacyHeaders:false,
  keyGenerator:request=>createHash('sha256').update(`${process.env.SAFETY_ID_SALT||'whattech'}:${ipKeyGenerator(request.ip)}`).digest('hex'),
  message:{error:'Too many forum posts. Please wait a few minutes and try again.'},
})

function singleLine(value,max){return typeof value==='string'?value.replace(/[\u0000-\u001f]/g,' ').replace(/\s+/g,' ').trim().slice(0,max):''}
function longText(value,max){return typeof value==='string'?value.replace(/\r\n/g,'\n').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').replace(/\n{3,}/g,'\n\n').trim().slice(0,max):''}
function mapReply(row){return{id:row.id,postId:row.post_id,authorName:row.author_name,body:row.body,isAccepted:row.is_accepted,helpfulCount:row.helpful_count,createdAt:row.created_at}}
function mapPost(row,replies){return{id:row.id,authorName:row.author_name,title:row.title,body:row.body,device:{id:row.device_id,brand:row.device_brand,model:row.device_model,category:row.device_category},topic:row.topic,status:row.status,replyCount:row.reply_count,viewCount:row.view_count,helpfulCount:row.helpful_count,createdAt:row.created_at,updatedAt:row.updated_at,...(replies?{replies:replies.map(mapReply)}:{})}}

async function getPost(client,id,{incrementView=false}={}){
  const postResult=incrementView
    ?await client.query('update forum_posts set view_count=view_count+1 where id=$1 returning *',[id])
    :await client.query('select * from forum_posts where id=$1',[id])
  if(!postResult.rowCount)return undefined
  const replies=await client.query('select * from forum_replies where post_id=$1 order by created_at,id',[id])
  return mapPost(postResult.rows[0],replies.rows)
}

router.get('/',async(request,response,next)=>{
  try{
    const id=singleLine(request.query.id,80)
    if(id){
      const post=await getPost(pool,id,{incrementView:true})
      if(!post)return response.status(404).json({error:'Question not found.'})
      return response.json({post})
    }
    const result=await pool.query('select * from forum_posts order by updated_at desc,id desc limit 100')
    return response.json({posts:result.rows.map(row=>mapPost(row))})
  }catch(error){next(error)}
})

router.post('/',writeLimiter,async(request,response,next)=>{
  const body=request.body||{}
  if(singleLine(body.website,200))return response.status(400).json({error:'The post could not be submitted.'})
  try{
    if(body.action==='create-post'){
      const authorName=singleLine(body.authorName,50),title=singleLine(body.title,140),text=longText(body.body,5000)
      const device={id:singleLine(body.device?.id,160),brand:singleLine(body.device?.brand,80),model:singleLine(body.device?.model,140),category:singleLine(body.device?.category,40)}
      const topic=singleLine(body.topic,40)
      if(authorName.length<2||title.length<10||text.length<30||!device.id||!device.brand||!device.model||!categoryIds.has(device.category)||!topicIds.has(topic))return response.status(400).json({error:'Add your name, a specific title, a device, and at least 30 characters of detail.'})
      const result=await pool.query(`insert into forum_posts (id,author_name,title,body,device_id,device_brand,device_model,device_category,topic)
        values ($1,$2,$3,$4,$5,$6,$7,$8,$9) returning *`,[randomUUID(),authorName,title,text,device.id,device.brand,device.model,device.category,topic])
      return response.status(201).json({post:mapPost(result.rows[0],[])})
    }

    if(body.action==='create-reply'){
      const postId=singleLine(body.postId,80),authorName=singleLine(body.authorName,50),text=longText(body.body,4000)
      if(!postId||authorName.length<2||text.length<15)return response.status(400).json({error:'Add your name and a response of at least 15 characters.'})
      const client=await pool.connect()
      try{
        await client.query('begin')
        const parent=await client.query('select id from forum_posts where id=$1 for update',[postId])
        if(!parent.rowCount){await client.query('rollback');return response.status(404).json({error:'That question could not be found.'})}
        await client.query('insert into forum_replies (id,post_id,author_name,body) values ($1,$2,$3,$4)',[randomUUID(),postId,authorName,text])
        const post=await getPost(client,postId)
        await client.query('commit')
        return response.status(201).json({post})
      }catch(error){await client.query('rollback');throw error}finally{client.release()}
    }
    return response.status(400).json({error:'Unknown forum action.'})
  }catch(error){next(error)}
})

export { router as forumRouter }
