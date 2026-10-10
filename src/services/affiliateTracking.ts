import { track } from './analytics'

export type AffiliatePlacement = 'homepage-feature-cta' | 'homepage-feature-media'

const configuredApiBase=import.meta.env.VITE_API_URL?.trim().replace(/\/$/,'')
const apiBase=configuredApiBase||(import.meta.env.DEV?'http://localhost:3001':'')

function buildAffiliateUrl(){
  const configured=import.meta.env.VITE_SMOOTHCUT_AFFILIATE_URL?.trim()
  try{
    const url=new URL(configured||'https://smoothcut.studio/')
    if(!url.searchParams.has('utm_source'))url.searchParams.set('utm_source','askwhattech')
    if(!url.searchParams.has('utm_medium'))url.searchParams.set('utm_medium','affiliate')
    if(!url.searchParams.has('utm_campaign'))url.searchParams.set('utm_campaign','homepage_partner')
    return url.href
  }catch{return 'https://smoothcut.studio/?utm_source=askwhattech&utm_medium=affiliate&utm_campaign=homepage_partner'}
}

export const smoothCutAffiliateUrl=buildAffiliateUrl()

export function trackSmoothCutClick(placement:AffiliatePlacement){
  track('affiliate_click',{partner:'smoothcut',placement})
  if(!apiBase)return
  void fetch(`${apiBase}/api/affiliate/click`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({partner:'smoothcut',placement,pagePath:window.location.pathname}),
    keepalive:true,
  }).catch(()=>undefined)
}
