import {test} from 'node:test';import assert from 'node:assert/strict';
import {IdleMotion} from './idle-motion.js';
test('idle gesture waits, plays once, then observes a cooldown',()=>{
 const a=new IdleMotion({frameCount:120,fps:24},{delay:2,cooldown:8});
 assert.equal(a.update(1,false).active,false);assert.equal(a.update(1,false).active,true);
 assert.equal(a.update(5,false).active,false);assert.equal(a.update(3,false).active,false);
 assert.equal(a.update(5,false).active,true);
});
test('movement resets waiting and exits a gesture before locomotion',()=>{
 const a=new IdleMotion({frameCount:120,fps:24},{delay:2,exitSeconds:.5});
 a.update(1.9,false);a.update(.1,true);assert.equal(a.update(1,false).active,false);
 a.update(1,false);assert.equal(a.update(.1,true).allowMove,false);
 assert.equal(a.update(.4,true).allowMove,true);
});
test('menus freeze gesture progress',()=>{const a=new IdleMotion({frameCount:120,fps:24},{delay:1});a.update(1,false);const before=a.update(.5,false);assert.deepEqual(a.update(20,false,true),before);});
test('varied clips avoid repeats, randomize pauses, and honor companion spacing',()=>{
 let permitted=false;const a=new IdleMotion([{frameCount:24,fps:24},{frameCount:48,fps:24},{frameCount:72,fps:24}],{delay:2,cooldown:5,jitter:4,random:()=>.5,gate:()=>permitted});
 assert.equal(a.wait,4);assert.equal(a.update(10,false).active,false);
 permitted=true;const first=a.update(.1,false);assert.equal(first.active,true);
 a.update(4,false);assert.equal(a.wait,7);const second=a.update(7,false);
 assert.equal(second.active,true);assert.notEqual(second.clip,first.clip);
});
