import { ExternalLink, ShoppingBag } from 'lucide-react'
import { amazonSearchUrl } from '../services/affiliate'

export function AffiliateLink({query,label='Check on Amazon',compact=false}:{query:string;label?:string;compact?:boolean}){
  return <a className={compact?'affiliateLink compact':'affiliateLink'} href={amazonSearchUrl(query)} target="_blank" rel="sponsored nofollow noopener noreferrer" aria-label={`${label} (paid link)`}><ShoppingBag/><span>{label}</span><small>paid link</small><ExternalLink/></a>
}
