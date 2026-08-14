import react from '@vitejs/plugin-react'
import type { IncomingMessage } from 'node:http'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import researchHandler from './api/research.mjs'

type LocalApiRequest = IncomingMessage & { body?: string }

function localResearchApi(mode:string):Plugin {
  const env=loadEnv(mode,process.cwd(),'')
  for(const key of ['BRAVE_SEARCH_API_KEY','SAFETY_ID_SALT'])if(env[key])process.env[key]=env[key]

  return {
    name:'whattech-local-research-api',
    configureServer(server){
      server.middlewares.use('/api/research',(request,response,next)=>{
        void (async()=>{
          try{
            const localRequest=request as LocalApiRequest
            const chunks:Buffer[]=[]
            let size=0
            for await(const chunk of request){
              const buffer=Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk)
              size+=buffer.length
              if(size>50_000){response.statusCode=413;response.end(JSON.stringify({error:'Research request is too large.'}));return}
              chunks.push(buffer)
            }
            localRequest.body=Buffer.concat(chunks).toString('utf8')
            await researchHandler(localRequest,response)
          }catch(error){next(error)}
        })()
      })
    },
  }
}

export default defineConfig(({mode})=>({plugins:[react(),localResearchApi(mode)]}))
