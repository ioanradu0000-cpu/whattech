import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { forumRouter } from './forum.mjs'

function allowedOrigins(){return new Set((process.env.FRONTEND_ORIGINS||'http://localhost:5173').split(',').map(value=>value.trim().replace(/\/$/,'')).filter(Boolean))}

export function createApp(){
  const app=express()
  const origins=allowedOrigins()
  app.set('trust proxy',1)
  app.disable('x-powered-by')
  app.use(helmet())
  app.use(cors({origin(origin,callback){
    if(!origin||origins.has(origin.replace(/\/$/,'')))return callback(null,true)
    return callback(new Error('Origin is not allowed.'))
  },methods:['GET','POST','OPTIONS'],allowedHeaders:['Content-Type'],maxAge:86_400}))
  app.use(express.json({limit:'60kb'}))
  app.get('/health',(_request,response)=>response.json({status:'ok'}))
  app.use('/api/forum',forumRouter)
  app.use((_request,response)=>response.status(404).json({error:'Endpoint not found.'}))
  app.use((error,_request,response,_next)=>{
    if(error?.type==='entity.too.large')return response.status(413).json({error:'Request body is too large.'})
    if(error instanceof SyntaxError&&'body' in error)return response.status(400).json({error:'Invalid JSON request.'})
    if(error?.message==='Origin is not allowed.')return response.status(403).json({error:error.message})
    console.error('API request failed',error instanceof Error?error.message:'Unknown error')
    return response.status(500).json({error:'The forum service could not complete the request.'})
  })
  return app
}

