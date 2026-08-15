import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'

function hashOwnerToken(token){
  return createHash('sha256').update(token).digest('hex')
}

export function createOwnerCredential(){
  const token=randomBytes(32).toString('base64url')
  return {token,hash:hashOwnerToken(token)}
}

export function ownerTokenMatches(token,storedHash){
  if(typeof token!=='string'||token.length<32||token.length>200||typeof storedHash!=='string'||storedHash.length!==64)return false
  const actual=Buffer.from(hashOwnerToken(token),'hex')
  const expected=Buffer.from(storedHash,'hex')
  return actual.length===expected.length&&timingSafeEqual(actual,expected)
}

