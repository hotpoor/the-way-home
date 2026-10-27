import {chromium,expect} from '@playwright/test';
import {chapters} from './src/chapters.js';
const b=await chromium.launch({channel:'chrome',headless:true});const p=await b.newPage({viewport:{width:1440,height:900}});p.setDefaultTimeout(60000);const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await p.addInitScript(()=>{if(!localStorage.getItem('the-way-home.save.v1'))localStorage.setItem('the-way-home.save.v1',JSON.stringify({version:1,x:1320,hits:3,collected:[0,1,2],complete:true,started:true,chapter:2,garden:{step:4,adult:true,ring:[0,1,2,3],thin:[0,1,2],prune:[0,1],observed:true}}));});
await p.goto(process.env.GAME_URL||'http://127.0.0.1:4173/');await p.waitForSelector('.loading',{state:'detached'});await p.locator('#start').click();await p.locator('#journal').click();await p.locator('[data-visit="3"]').click();
const choose=id=>p.locator(`[data-choice="${id}"]`).click();
for(const c of chapters.filter(c=>c.id>=3)){
 await expect(p.locator('#chapter h2')).toHaveText(c.title);await p.keyboard.down('ArrowRight');await expect(p.locator('#interact')).toBeVisible({timeout:60000});await p.keyboard.up('ArrowRight');await p.locator('#interact').click();
 for(let i=0;i<c.tasks.length;i++){
  const t=c.tasks[i];await expect(p.locator('#journey-title')).toHaveText(t.title);
  if(['collect','observe'].includes(t.type)){for(let n=0;n<t.items.length;n++)await choose('object-'+n);await p.locator('#collect-finish').click();}
  else if(['route','assemble'].includes(t.type)){for(let n=0;n<t.order.length;n++)await choose('order-'+n);}
  else if(t.type==='conversation'){for(const turn of t.turns)await choose('reply-'+turn.good);}
  else if(t.type==='schedule'){for(const id of ['study','study','rest','study','meal','rest'])await choose(id);await p.locator('#schedule-finish').click();}
  else if(t.type==='ride'){await p.locator('[data-lane="0"]').click();await p.keyboard.press('ArrowDown');await p.locator('#ride-start').click();await expect(p.locator('#journey-next')).toBeVisible({timeout:45000});}
  else if(t.type==='trace'){for(let n=0;n<6;n++)await choose('point-'+n);}
  else if(['sketch','paint'].includes(t.type)){await p.locator('#add-stroke').click();await p.locator('#add-stroke').click();const r=await p.locator('.sketch-canvas').boundingBox();await p.mouse.move(r.x+r.width*.2,r.y+r.height*.4);await p.mouse.down();await p.mouse.move(r.x+r.width*.7,r.y+r.height*.65,{steps:10});await p.mouse.up();await p.screenshot({path:`test-results/full-${c.id}-${i}.png`});await p.locator('#sketch-finish').click();}
  else if(t.type==='layout'){await choose('window');await choose('door');await p.screenshot({path:'test-results/full-layout.png'});await p.locator('#layout-finish').click();}
  else if(t.type==='design'){for(let n=0;n<3;n++)await choose('part-'+n);await p.locator('#design-finish').click();}
  else if(t.type==='water'){for(let n=0;n<3;n++)await choose('water-'+n);await p.locator('#water-finish').click();}
  else if(t.type==='profile'){await choose('fact-0');await choose('fact-2');await choose('fact-3');await p.locator('#profile-text').fill('在上海工作，喜欢建筑、油画和养花。想认识能一起散步的人。');await p.screenshot({path:'test-results/full-profile.png'});await p.locator('#profile-finish').click();}
  else if(t.type==='collage'){for(let n=0;n<10;n++){await p.locator(`[data-memory="${n+1}"]`).click();await p.locator(`[data-slot="${n}"]`).click();}await p.screenshot({path:'test-results/full-collage.png'});await p.locator('#collage-finish').click();}
  else await p.locator('#home-finish').click();
  await p.locator('#journey-next').click();
  if(c.id===10&&i===0){await expect(p.locator('#journey')).not.toBeVisible();await p.screenshot({path:'test-results/full-walk-scroll.png'});await p.keyboard.down('ArrowRight');await p.waitForTimeout(35000);await p.keyboard.up('ArrowRight');await p.locator('#interact').click();}
 }
 const saved=await p.evaluate(()=>JSON.parse(localStorage.getItem('the-way-home.save.v1')));if(saved.journey[c.id]!==c.tasks.length)throw Error('Progress not saved '+c.id);console.log('PASS chapter',c.id,c.title);
 if(c.id<10)await p.locator('#chapter-next').click();
}
await expect(p.locator('#finale')).toBeVisible();await p.screenshot({path:'test-results/full-finale.png'});await p.locator('#finale-continue').click();await expect(p.locator('#progress')).toHaveText('记忆碎片 10 / 10');await p.reload();await p.waitForSelector('.loading',{state:'detached'});await p.locator('#start').click();await expect(p.locator('#progress')).toHaveText('记忆碎片 10 / 10');await p.locator('#journal').click();await expect(p.locator('[data-visit="9"]')).toBeEnabled();
const saved=await p.evaluate(()=>JSON.parse(localStorage.getItem('the-way-home.save.v1')));if(saved.sketches.jinci.length<2||saved.sketches.painting.length<2||!saved.profileText||saved.collage.filter(Boolean).length!==10)throw Error('Personal artifacts lost');if(errors.length)throw Error(errors.join('\n'));console.log('PASS complete journey, finale, persistent paintings/profile/collage, reload and chapter replay; no page/shader errors');await b.close();
