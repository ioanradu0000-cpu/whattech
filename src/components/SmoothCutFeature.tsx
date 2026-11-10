import { ArrowUpRight } from 'lucide-react'
import { useSyncExternalStore } from 'react'
import { smoothCutAffiliateUrl, trackSmoothCutClick } from '../services/affiliateTracking'

const BLACK_FRIDAY_END = Date.parse('2026-12-02T00:00:00Z')
const subscribeToPromotion=(onExpiry:()=>void)=>{
  const remaining=BLACK_FRIDAY_END-Date.now()
  if(remaining<=0)return()=>undefined
  const timeout=window.setTimeout(onExpiry,remaining)
  return()=>window.clearTimeout(timeout)
}
const getPromotionSnapshot=()=>Date.now()<BLACK_FRIDAY_END
const getPromotionServerSnapshot=()=>true

export function SmoothCutFeature(){
  const promotionActive=useSyncExternalStore(subscribeToPromotion,getPromotionSnapshot,getPromotionServerSnapshot)

  return <section className="smoothCutFeature" aria-labelledby="smoothcut-title">
    <div className="smoothCutCopy">
      <div className="partnerDisclosure"><span>Sponsored</span><span>Affiliate partner</span></div>
      {promotionActive?<div className="smoothCutOffer" role="note" aria-label="SmoothCut Black Friday offer: 40 percent off until December 1">
        <span>Black Friday</span><strong>40% off</strong><small>Ends Dec 1</small>
      </div>:null}
      <div>
        <p className="smoothCutName">SmoothCut</p>
        <h2 id="smoothcut-title">Polished screen recordings, automatically.</h2>
        <p>SmoothCut adds purposeful zooms, smoother cursor movement, camera layouts, and captions on Mac or Windows—processed on your computer.</p>
      </div>
      <div className="smoothCutHighlights" aria-label="SmoothCut features"><span>Automatic zooms</span><span>Smooth cursor</span><span>Local processing</span></div>
      <div className="smoothCutActions"><a className="smoothCutCta" href={smoothCutAffiliateUrl} target="_blank" rel="sponsored noopener" onClick={()=>trackSmoothCutClick('homepage-feature-cta')}>
        {promotionActive?'Claim 40% off':'Explore SmoothCut'} <ArrowUpRight/>
      </a><small>Affiliate link — WhatTech may earn a commission at no extra cost to you.</small></div>
    </div>
    <a className="smoothCutMedia" href={smoothCutAffiliateUrl} target="_blank" rel="sponsored noopener" onClick={()=>trackSmoothCutClick('homepage-feature-media')} aria-label="See SmoothCut, sponsored partner">
      <div className="smoothCutWindowBar"><i/><i/><i/><span>Screen recording, automatically polished</span></div>
      <img src="https://smoothcut.studio/hero.png" width="1280" height="720" loading="lazy" decoding="async" alt="SmoothCut screen recorder editing interface"/>
      <span className="smoothCutMediaAction">See how it works <ArrowUpRight/></span>
    </a>
  </section>
}
