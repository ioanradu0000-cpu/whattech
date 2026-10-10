const apiOrigin=(process.env.WHATTECH_API_URL||process.env.VITE_API_URL||'https://whattech-api.onrender.com').replace(/\/$/,'')
const key=process.env.ADMIN_ANALYTICS_KEY||''

if(!key){
  console.error('Set ADMIN_ANALYTICS_KEY to the same value used by the Render backend, then run this command again.')
  process.exitCode=1
}else{
  try{
    const response=await fetch(`${apiOrigin}/api/affiliate/summary?partner=smoothcut`,{headers:{'X-Analytics-Key':key}})
    const data=await response.json().catch(()=>({}))
    if(!response.ok)throw new Error(data.error||`Analytics API returned ${response.status}.`)
    console.log(`SmoothCut affiliate clicks\nAll time: ${data.total}\nLast 30 days: ${data.last30Days}\nLast 7 days: ${data.last7Days}\nLatest: ${data.lastClickAt?new Date(data.lastClickAt).toLocaleString():'None yet'}`)
    console.table(data.placements.map(item=>({link:item.placement,clicks:item.clicks})))
    console.table(data.daily.map(item=>({date:item.date,clicks:item.clicks})))
  }catch(error){
    console.error(error instanceof Error?error.message:'Affiliate analytics could not be loaded.')
    process.exitCode=1
  }
}
