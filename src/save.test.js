import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fresh, read, write, validate, KEY } from './save.js';
test('save survives reload and preserves chapter progress', () => { const data = new Map(); const store = {getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)}; const s = {...fresh(),started:true,hits:3,collected:[0,2],x:950}; assert.equal(write(store,s),true); assert.deepEqual(read(store),s); });
test('corrupt and incompatible saves recover safely', () => { for (const value of ['{', '{"version":2}', 'null']) assert.deepEqual(read({getItem:()=>value}),fresh()); assert.throws(()=>validate({...fresh(),hits:1,collected:[2]})); assert.throws(()=>validate({...fresh(),collected:[0,0]})); });
test('blocked storage is reported without crashing',()=> { assert.equal(write({setItem(){throw Error('quota');}},fresh()),false); assert.deepEqual(read({getItem(){throw Error('denied');}}),fresh()); });

test('old v1 saves gain chapter fields without losing the walnut memory',()=>{
 const legacy={version:1,x:1320,hits:3,collected:[0,1,2],complete:true,started:true};
 const state=validate(legacy);assert.equal(state.chapter,1);assert.equal(state.garden.step,0);assert.equal(state.complete,true);assert.deepEqual(state.collected,[0,1,2]);
});
test('chapter two and partial garden progress survive export and reload',()=>{
 const state={...fresh(),complete:true,hits:3,collected:[0,1,2],chapter:2,garden:{step:1,adult:true,ring:[0,1,2,3],thin:[1],prune:[],observed:false}};
 assert.deepEqual(validate(JSON.parse(JSON.stringify(state))),state);
 assert.throws(()=>validate({...fresh(),chapter:2}),/章节/);
 assert.throws(()=>validate({...state,garden:{...state.garden,thin:[1,1]}}),/章节/);
 assert.throws(()=>validate({...state,garden:{...state.garden,step:4}}),/章节/);
 assert.throws(()=>validate({...state,complete:false}),/格式/);
});
test('reject a contradictory completion flag that would strand a player',()=>{assert.throws(()=>validate({...fresh(),hits:3,collected:[0,1,2],complete:false}),/格式/);});
