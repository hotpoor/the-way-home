import {chromium} from '@playwright/test';
import {chapters} from './src/chapters.js';
import {fresh} from './src/save.js';
const b=await chromium.launch({channel:'chrome',headless:true});const errors=[];
const examples=[[3,0],[3,1],[3,2],[4,0],[4,2],[6,1],[7,0],[7,1],[7,2],[7,4],[7,5],[9,0],[9,1],[9,2],[10,0],[10,1]];
for(const [w,h] of [[320,568],[390,844],[844,390],[667,375],[1440,900],[2560,1080]]){
 const p=await b.newPage({viewport:{width:w,height:h},hasTouch:w<1000,isMobile:w<1000});p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});await p.goto('http://127.0.0.1:4173/');await p.waitForSelector('.loading',{state:'detached'});
 await p.evaluate(async()=>{const {createJourney}=await import('/src/journey.js');window.qaJourney=createJourney({dialog:document.querySelector('#journey'),getState:()=>window.qaState,onChange:()=>{},onComplete:()=>{},onWalk:()=>{}});});
 for(const [chapter,step] of examples){const fixture=fresh();fixture.chapter=chapter;fixture.journey[chapter]=step;if(chapter===10&&step===1)fixture.collage=chapters.map(c=>c.id);
  await p.evaluate(({fixture,chapter})=>{window.qaState=fixture;window.qaJourney.open(chapter);},{fixture,chapter});
  const issue=await p.locator('#journey').evaluate(d=>{const r=d.getBoundingClientRect();if(d.scrollWidth>d.clientWidth+1)return 'horizontal clipping';if(r.x<0||r.y<0||r.right>innerWidth+1||r.bottom>innerHeight+1)return 'outside viewport';return '';});if(issue)throw Error(`${w}x${h} chapter ${chapter} stage ${step}: ${issue}`);
  if(chapter===7&&step===0){const overlap=await p.locator('.plan-trace button').evaluateAll(bs=>{const rs=bs.map(b=>b.getBoundingClientRect());return rs.some((r,i)=>rs.some((q,j)=>j>i&&Math.min(r.right,q.right)>Math.max(r.left,q.left)+2&&Math.min(r.bottom,q.bottom)>Math.max(r.top,q.top)+2));});if(overlap)throw Error('Trace targets overlap');}
  await p.locator('.journey-feedback').scrollIntoViewIfNeeded();if((w===390||w===1440)&&[4,7,9,10].includes(chapter))await p.screenshot({path:`test-results/journey-${w}-${chapter}-${step}.png`});
  await p.locator('.journey-close').click();
 }await p.close();console.log('PASS all memory interaction layouts',w,h);
}if(errors.length)throw Error(errors.join('\n'));await b.close();
