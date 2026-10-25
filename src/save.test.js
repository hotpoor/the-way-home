import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fresh, read, write, validate, KEY } from './save.js';
test('save survives reload and preserves chapter progress', () => { const data = new Map(); const store = {getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)}; const s = {...fresh(),started:true,hits:3,collected:[0,2],x:950}; assert.equal(write(store,s),true); assert.deepEqual(read(store),s); });
test('corrupt and incompatible saves recover safely', () => { for (const value of ['{', '{"version":2}', 'null']) assert.deepEqual(read({getItem:()=>value}),fresh()); assert.throws(()=>validate({...fresh(),hits:1,collected:[2]})); assert.throws(()=>validate({...fresh(),collected:[0,0]})); });
test('blocked storage is reported without crashing',()=> { assert.equal(write({setItem(){throw Error('quota');}},fresh()),false); assert.deepEqual(read({getItem(){throw Error('denied');}}),fresh()); });
