import {chromium,expect} from '@playwright/test';
import {fresh} from './src/save.js';
import {chapters} from './src/chapters.js';
const b=await chromium.launch({channel:'chrome',headless:true});const errors=[],loaded=new Set();const context=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
for(const [chapter,step] of [[2,1],[2,2],[3,0],[4,0],[4,1],[5,0],[5,1],[5,2],[7,2],[8,1],[9,0],[9,1],[10,0]]){
 const s=fresh();Object.assign(s,{chapter,x:1320,complete:true,hits:3,collected:[0,1,2],started:true,garden:{step:chapter===2?step:4,adult:true,ring:[0,1,2,3],thin:chapter>2||step>=2?[0,1,2]:[],prune:chapter>2?[0,1]:[],observed:chapter>2}});for(const c of chapters.filter(c=>c.id>=3&&c.id<chapter))s.journey[c.id]=c.tasks.length;if(chapter>=3)s.journey[chapter]=step;
 const p=await context.newPage();p.setDefaultTimeout(60000);p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});p.on('response',r=>{if(r.url().includes('/props/')){if(r.status()>=400)errors.push('Missing prop '+r.url());else loaded.add(r.url().split('/').at(-1));}});await p.addInitScript(s=>localStorage.setItem('the-way-home.save.v1',JSON.stringify(s)),s);
 await p.goto(process.env.GAME_URL||'http://127.0.0.1:4173/');await p.waitForSelector('.loading',{state:'detached'});await p.locator('#start').click();await p.locator('#interact').click();await p.waitForFunction(()=>[...document.querySelectorAll('dialog[open] img')].every(i=>i.complete&&i.naturalWidth>0));
 if(chapter===4)await expect(p.locator('#ride-start')).toBeEnabled();
 const dialog=p.locator('dialog[open]');if(await dialog.evaluate(d=>d.scrollWidth>d.clientWidth+1))throw Error('Prop causes horizontal clipping '+chapter+':'+step);
 await p.screenshot({path:`test-results/props-${chapter}-${step}.png`});
 if(chapter===2&&step===1){await p.locator('[data-garden-pick="thin-0"]').click();const alpha=await p.locator('[data-garden-pick="thin-0"] img').evaluate(i=>parseFloat(getComputedStyle(i).opacity));if(alpha>.2)throw Error('Selected jujube remains opaque');}
 if(chapter===3){await p.locator('[data-choice="object-0"]').click();await expect(p.locator('[data-choice="object-0"]')).toBeDisabled();await p.locator('[data-choice="object-1"]').click();await p.locator('[data-choice="object-2"]').click();await expect(p.locator('#collect-finish')).toBeEnabled();}
 await p.close();console.log('PASS painted props in chapter',chapter,'stage',step);
}
if(loaded.size!==17)throw Error('Expected all 17 props, got '+[...loaded].join(','));if(errors.length)throw Error(errors.join('\n'));console.log('PASS all 17 prop textures load, mobile bounds, real selection and collection feedback');await b.close();
