import 'dotenv/config'
import pg from 'pg'

const { Pool }=pg

if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL is required.')

const localDatabase=/localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL)
const useSsl=process.env.DATABASE_SSL==='true'||(!localDatabase&&process.env.DATABASE_SSL!=='false')

export const pool=new Pool({
  connectionString:process.env.DATABASE_URL,
  max:Number(process.env.DATABASE_POOL_SIZE||10),
  idleTimeoutMillis:30_000,
  connectionTimeoutMillis:10_000,
  ssl:useSsl?{rejectUnauthorized:false}:false,
})

pool.on('error',error=>console.error('Unexpected PostgreSQL pool error',error.message))

export async function closeDatabase(){await pool.end()}

