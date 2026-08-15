export const AMAZON_ASSOCIATE_TAG='erisoftshop-20'

export function amazonSearchUrl(query:string){
  const search=query.replace(/\s+/g,' ').trim().slice(0,180)
  const params=new URLSearchParams({k:search,tag:AMAZON_ASSOCIATE_TAG})
  return `https://www.amazon.com/s?${params.toString()}`
}

