import {chromium,expect} from '@playwright/test';
import {fresh} from './src/save.js';
import {chapters} from './src/chapters.js';
const browser=await chromium.launch({channel:'chrome',headless:true});const errors=[];
for(const c of chapters){
 const state=fresh();Object.assign(state,{chapter:c.id,x:c.id===10?1480:1320,started:true,complete:true,hits:3,collected:[0,1,2],garden:{step:4,adult:true,ring:[0,1,2,3],thin:[0,1,2],prune:[0,1],observed:true}});for(const previous of chapters.filter(p=>p.id>=3&&p.id<c.id))state.journey[previous.id]=previous.tasks.length;
 if(c.id===10){state.journey[10]=2;state.collage=chapters.map(c=>c.id).reverse();}
 const p=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});p.setDefaultTimeout(60000);p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});p.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});await p.addInitScript(s=>localStorage.setItem('the-way-home.save.v1',JSON.stringify(s)),state);
 await p.goto(process.env.GAME_URL||'http://127.0.0.1:4174/the-way-home/');await p.waitForSelector('.loading',{state:'detached'});await p.locator('#start').click();await expect(p.locator('#chapter h2')).toHaveText(c.title);
 if(c.id>=3){await p.locator('#interact').click();await expect(p.locator('#journey-title')).toHaveText(c.tasks[0].title);if(c.id===10){await p.locator('#collage-finish').click();await p.locator('#journey-next').click();await p.locator('#journal').click();const fixture={...state,x:1480};await p.locator('#import').setInputFiles({name:'return.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(fixture))});await p.locator('#interact').click();await expect(p.locator('#journey-title')).toHaveText(c.tasks[1].title);await p.locator('#home-finish').click();await p.locator('#journey-next').click();await expect(p.locator('#finale')).toBeVisible();}else await p.locator('.journey-close').click();}
 await p.screenshot({path:`test-results/production-scene-${c.id}.png`});await p.close();console.log('PASS production scene and compiled chapter',c.id);
}
if(errors.length)throw Error(errors.join('\n'));await browser.close();
