import 'dotenv/config'
import { createApp } from './app.mjs'
import { closeDatabase, pool } from './db.mjs'
import { migrate } from './migrate.mjs'

const port=Number(process.env.PORT||3001)

await migrate()
await pool.query('select 1')

const server=createApp().listen(port,'0.0.0.0',()=>console.log(`WhatTech API listening on port ${port}`))

async function shutdown(signal){
  console.log(`${signal} received, shutting down`)
  server.close(async()=>{await closeDatabase();process.exit(0)})
  setTimeout(()=>process.exit(1),10_000).unref()
}

process.on('SIGTERM',()=>void shutdown('SIGTERM'))
process.on('SIGINT',()=>void shutdown('SIGINT'))

