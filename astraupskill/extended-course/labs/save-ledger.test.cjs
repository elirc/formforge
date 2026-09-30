'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {initial,edit,settle}=require('./save-ledger.cjs');
test('a current result updates committed version and status',()=>{
 const state=settle(edit(initial()),1,{status:'saved',version:1});
 assert.deepEqual(state,{latest:1,committed:1,status:'saved'});
});
test('a superseded success advances committed knowledge but preserves queued status',()=>{
 const state=settle(edit(edit(initial())),1,{status:'saved',version:1});
 assert.deepEqual(state,{latest:2,committed:1,status:'queued'});
});
test('a superseded conflict does not adopt serverVersion',()=>{
 const state=settle(edit(edit(initial())),1,{status:'conflict',serverVersion:9});
 assert.deepEqual(state,{latest:2,committed:0,status:'queued'});
});
test('a latest conflict is visible without advancing committed version',()=>{
 const base=settle(edit(initial()),1,{status:'saved',version:1});
 const state=settle(edit(base),2,{status:'conflict',serverVersion:9});
 assert.deepEqual(state,{latest:2,committed:1,status:'conflict'});
});
test('earlier state remains unchanged through model transitions',()=>{
 const base=initial();const changed=edit(base);settle(changed,1,{status:'saved',version:1});
 assert.deepEqual(base,{latest:0,committed:0,status:'idle'});
 assert.deepEqual(changed,{latest:1,committed:0,status:'queued'});
});
