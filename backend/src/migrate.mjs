import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { closeDatabase, pool } from './db.mjs'

export async function migrate(){
  const client=await pool.connect()
  try{
    await client.query('begin')
    await client.query("select pg_advisory_xact_lock(hashtext('whattech_database_migrations'))")
    await client.query('create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())')
    const name='001_forum.sql'
    const applied=await client.query('select 1 from schema_migrations where name=$1',[name])
    if(!applied.rowCount){
      const path=new URL(`../migrations/${name}`,import.meta.url)
      const sql=await readFile(path,'utf8')
      await client.query(sql)
      await client.query('insert into schema_migrations (name) values ($1)',[name])
      console.log(`Applied migration ${name}`)
    }
    await client.query('commit')
  }catch(error){
    await client.query('rollback')
    throw error
  }finally{client.release()}
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
  migrate().then(()=>closeDatabase()).catch(error=>{console.error('Migration failed:',error.message);process.exitCode=1;return closeDatabase()})
}

