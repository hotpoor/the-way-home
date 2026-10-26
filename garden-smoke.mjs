import {chromium,expect} from '@playwright/test';
const b=await chromium.launch({channel:'chrome',headless:true});const p=await b.newPage({viewport:{width:1440,height:900}});const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
// A real old v1 completed save, deliberately without new chapter fields.
await p.addInitScript(()=>{if(!localStorage.getItem('the-way-home.save.v1'))localStorage.setItem('the-way-home.save.v1',JSON.stringify({version:1,x:1320,hits:3,collected:[0,1,2],complete:true,started:true}));});
await p.goto(process.env.GAME_URL||'http://127.0.0.1:4173/');await p.waitForSelector('.loading',{state:'detached'});await p.locator('#start').click();await p.locator('#journal').click();await p.locator('#visit-garden').click();await expect(p.locator('#chapter h2')).toHaveText('枣树下的光');
await p.screenshot({path:'test-results/garden-scene.png'});
// Walk the real route from the courtyard entrance to the tree.
await p.keyboard.down('ArrowRight');await p.waitForTimeout(14000);await p.keyboard.up('ArrowRight');await expect(p.locator('#interact')).toBeVisible();await p.locator('#interact').click();
const pick=id=>p.locator(`[data-garden-pick="${id}"]`).click();
await pick('young');await expect(p.locator('.garden-feedback')).toContainText('细弱');await pick('adult');await pick('ring-0');await pick('ring-1');
await p.locator('.garden-close').click();await p.reload();await p.waitForSelector('.loading',{state:'detached'});await p.locator('#start').click();await p.locator('#interact').click();await expect(p.locator('[data-garden-pick="ring-0"]')).toHaveAttribute('aria-pressed','true');
await pick('ring-2');await pick('ring-3');await p.locator('#garden-next').click();await p.screenshot({path:'test-results/garden-thin.png'});
await pick('keep-0');await expect(p.locator('.garden-feedback')).toContainText('先留下');for(let i=0;i<3;i++)await pick('thin-'+i);await p.locator('#garden-next').click();await p.screenshot({path:'test-results/garden-prune.png'});
await pick('keep-branch');await expect(p.locator('.garden-feedback')).toContainText('先保留');await pick('prune-0');await pick('prune-1');await p.locator('#garden-next').click();
await pick('observe');await pick('medicine');await expect(p.locator('.garden-feedback')).toContainText('先辨认');await pick('diagnose');await p.locator('#garden-next').click();await expect(p.locator('#garden-ending')).toBeVisible();await p.locator('#garden-continue').click();await expect(p.locator('#progress')).toHaveText('记忆碎片 2 / 2');
await p.reload();await p.waitForSelector('.loading',{state:'detached'});await p.locator('#start').click();await expect(p.locator('#progress')).toHaveText('记忆碎片 2 / 2');await p.locator('#journal').click();await expect(p.locator('#garden-memory-state')).toContainText('已拾起');await p.locator('#visit-walnut').click();await expect(p.locator('#chapter h2')).toHaveText('核桃落下来的时候');
const s=await p.evaluate(()=>JSON.parse(localStorage.getItem('the-way-home.save.v1')));if(!s.complete||s.garden.step!==4||s.collected.length!==3)throw Error('Chapter progress lost');
if(errors.length)throw Error(errors.join('\n'));console.log('PASS old save migration, chapter transition, four garden puzzles, incorrect choices, partial reload, completion, replay and preserved first memory; no page/shader errors');await b.close();
