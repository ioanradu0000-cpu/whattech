import assert from 'node:assert/strict'
import test from 'node:test'
import { createOwnerCredential, ownerTokenMatches } from '../src/ownership.mjs'

test('owner credentials contain a verifiable token without storing it directly',()=>{
  const credential=createOwnerCredential()
  assert.ok(credential.token.length>=32)
  assert.match(credential.hash,/^[a-f0-9]{64}$/)
  assert.notEqual(credential.hash,credential.token)
  assert.equal(ownerTokenMatches(credential.token,credential.hash),true)
})

test('owner credentials reject incorrect and malformed tokens',()=>{
  const credential=createOwnerCredential()
  assert.equal(ownerTokenMatches(`${credential.token}x`,credential.hash),false)
  assert.equal(ownerTokenMatches('',credential.hash),false)
  assert.equal(ownerTokenMatches(credential.token,null),false)
})
