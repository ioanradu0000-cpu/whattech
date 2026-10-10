import { createHash, timingSafeEqual } from 'node:crypto'
import { Router } from 'express'
import { ipKeyGenerator, rateLimit } from 'express-rate-limit'
import { pool } from './db.mjs'

const router=Router()
const partners=new Set(['smoothcut'])
const placements=new Set(['homepage-feature-cta','homepage-feature-media'])

const clickLimiter=rateLimit({
  windowMs:60*1000,
  limit:30,
  standardHeaders:'draft-8',
  legacyHeaders:false,
  keyGenerator:request=>createHash('sha256').update(`${process.env.SAFETY_ID_SALT||'whattech'}:${ipKeyGenerator(request.ip)}`).digest('hex'),
  message:{error:'Too many tracking requests.'},
})

function clean(value,max){return typeof value==='string'?value.replace(/[\u0000-\u001f]/g,' ').replace(/\s+/g,' ').trim().slice(0,max):''}
function analyticsKeyMatches(value){
  const expected=process.env.ADMIN_ANALYTICS_KEY||''
  const supplied=clean(value,240)
  if(!expected||!supplied)return false
  const expectedHash=createHash('sha256').update(expected).digest()
  const suppliedHash=createHash('sha256').update(supplied).digest()
  return timingSafeEqual(expectedHash,suppliedHash)
}

router.post('/click',clickLimiter,async(request,response,next)=>{
  try{
    const partner=clean(request.body?.partner,80)
    const placement=clean(request.body?.placement,120)
    const pagePath=clean(request.body?.pagePath,300)||'/'
    if(!partners.has(partner)||!placements.has(placement)||!pagePath.startsWith('/'))return response.status(400).json({error:'Invalid tracking event.'})
    await pool.query('insert into affiliate_clicks (partner,placement,page_path) values ($1,$2,$3)',[partner,placement,pagePath])
    return response.status(204).end()
  }catch(error){next(error)}
})

router.get('/summary',async(request,response,next)=>{
  if(!analyticsKeyMatches(request.get('x-analytics-key')))return response.status(401).json({error:'Analytics access key is invalid.'})
  try{
    const partner=clean(request.query.partner,80)||'smoothcut'
    if(!partners.has(partner))return response.status(400).json({error:'Unknown affiliate partner.'})
    const [totals,placementsResult,dailyResult]=await Promise.all([
      pool.query(`select count(*)::integer as total,
        count(*) filter (where created_at>=now()-interval '7 days')::integer as last_7_days,
        count(*) filter (where created_at>=now()-interval '30 days')::integer as last_30_days,
        max(created_at) as last_click_at
        from affiliate_clicks where partner=$1`,[partner]),
      pool.query('select placement,count(*)::integer as clicks from affiliate_clicks where partner=$1 group by placement order by clicks desc,placement',[partner]),
      pool.query(`select to_char(day,'YYYY-MM-DD') as date,coalesce(counts.clicks,0)::integer as clicks
        from generate_series(current_date-13,current_date,interval '1 day') day
        left join (
          select date_trunc('day',created_at) as click_day,count(*)::integer as clicks
          from affiliate_clicks where partner=$1 and created_at>=current_date-13
          group by click_day
        ) counts on counts.click_day=day
        order by day`,[partner]),
    ])
    const row=totals.rows[0]
    return response.json({
      partner,
      total:row.total,
      last7Days:row.last_7_days,
      last30Days:row.last_30_days,
      lastClickAt:row.last_click_at,
      placements:placementsResult.rows,
      daily:dailyResult.rows,
    })
  }catch(error){next(error)}
})

export { router as affiliateRouter }
