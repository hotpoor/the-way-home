import {test} from 'node:test';
import assert from 'node:assert/strict';
import {advanceWalk,walkFrame} from './walk-cycle.js';
test('walk phase depends on distance, independent of render frame rate',()=>{
 let a=0,b=0;for(let i=0;i<30;i++)a=advanceWalk(a,1,66);for(let i=0;i<60;i++)b=advanceWalk(b,.5,66);
 assert.ok(Math.abs(a-b)<1e-10);assert.equal(walkFrame(a,48),walkFrame(b,48));
});
test('pausing preserves phase and backwards travel advances the cycle',()=>{
 assert.equal(advanceWalk(.25,0,66),.25);assert.equal(advanceWalk(.25,-16.5,66),.5);
 assert.equal(walkFrame(.9999,48),47);assert.equal(walkFrame(1,48),0);
});

test('walk blending follows distance continuously across paired poses and the loop seam',async()=>{
 const {walkBlend}=await import('./walk-cycle.js');
 assert.deepEqual(walkBlend(0,32,2),{current:0,next:2,amount:0});
 assert.deepEqual(walkBlend(1/32,32,2),{current:0,next:2,amount:.5});
 assert.deepEqual(walkBlend(31/32,32,2),{current:30,next:0,amount:.5});
 assert.deepEqual(walkBlend(1,32,2),walkBlend(0,32,2));
 assert.throws(()=>walkBlend(0,31,2),/Invalid/);
});
