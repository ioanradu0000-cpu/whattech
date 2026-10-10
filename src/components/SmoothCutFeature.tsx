import { ArrowUpRight } from 'lucide-react'
import { smoothCutAffiliateUrl, trackSmoothCutClick } from '../services/affiliateTracking'

export function SmoothCutFeature(){
  return <section className="smoothCutFeature" aria-labelledby="smoothcut-title">
    <div className="smoothCutCopy">
      <div className="partnerDisclosure"><span>Sponsored</span><span>Affiliate partner</span></div>
      <div>
        <p className="smoothCutName">SmoothCut</p>
        <h2 id="smoothcut-title">Polished screen recordings, automatically.</h2>
        <p>SmoothCut adds purposeful zooms, smoother cursor movement, camera layouts, and captions on Mac or Windows—processed on your computer.</p>
      </div>
      <div className="smoothCutHighlights" aria-label="SmoothCut features"><span>Automatic zooms</span><span>Smooth cursor</span><span>Local processing</span></div>
      <div className="smoothCutActions"><a className="smoothCutCta" href={smoothCutAffiliateUrl} target="_blank" rel="sponsored noopener" onClick={()=>trackSmoothCutClick('homepage-feature-cta')}>
        Explore SmoothCut <ArrowUpRight/>
      </a><small>Affiliate link — WhatTech may earn a commission at no extra cost to you.</small></div>
    </div>
    <a className="smoothCutMedia" href={smoothCutAffiliateUrl} target="_blank" rel="sponsored noopener" onClick={()=>trackSmoothCutClick('homepage-feature-media')} aria-label="See SmoothCut, sponsored partner">
      <div className="smoothCutWindowBar"><i/><i/><i/><span>Screen recording, automatically polished</span></div>
      <img src="https://smoothcut.studio/hero.png" width="1280" height="720" loading="lazy" decoding="async" alt="SmoothCut screen recorder editing interface"/>
      <span className="smoothCutMediaAction">See how it works <ArrowUpRight/></span>
    </a>
  </section>
}
