import {chromium,expect} from '@playwright/test';
const b=await chromium.launch({channel:'chrome',headless:true});const errors=[];
for(const [w,h] of [[320,568],[390,844],[844,390],[667,375],[1440,900],[2560,1080]]){
 const p=await b.newPage({viewport:{width:w,height:h},hasTouch:w<1000,isMobile:w<1000});p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.addInitScript(()=>{const fixture=sessionStorage.getItem('garden-qa');if(fixture)localStorage.setItem('the-way-home.save.v1',fixture);});await p.goto('http://127.0.0.1:4173/');await p.waitForSelector('.loading',{state:'detached'});
 for(let step=0;step<4;step++){
  await p.evaluate(step=>sessionStorage.setItem('garden-qa',JSON.stringify({version:1,x:1320,hits:3,collected:[0,1,2],complete:true,started:true,chapter:2,garden:{step,adult:true,ring:step?[0,1,2,3]:[],thin:step>=2?[0,1,2]:[],prune:step>=3?[0,1]:[],observed:false}})),step);
  await p.reload();await p.waitForSelector('.loading',{state:'detached'});await p.locator('#start').click();await p.locator('#interact').click();await expect(p.locator('#garden')).toBeVisible();
  const bad=await p.locator('.garden-work button').evaluateAll(buttons=>{const rects=buttons.map(b=>({label:b.getAttribute('aria-label'),r:b.getBoundingClientRect()}));const issues=[];const work=buttons[0]?.parentElement.getBoundingClientRect();for(let i=0;i<rects.length;i++){const {r,label}=rects[i];if(work&&(r.left<work.left||r.right>work.right||r.top<work.top||r.bottom>work.bottom))issues.push('outside '+label);if(r.width<43||r.height<43)issues.push('small '+label);for(let j=i+1;j<rects.length;j++){const q=rects[j].r;if(Math.min(r.right,q.right)-Math.max(r.left,q.left)>4&&Math.min(r.bottom,q.bottom)-Math.max(r.top,q.top)>4)issues.push('overlap '+label+' / '+rects[j].label);}}return issues;});
  if(bad.length)throw Error(`${w}x${h} stage ${step}: ${bad.join(',')}`);
  await p.locator('.garden-feedback').scrollIntoViewIfNeeded();const r=await p.locator('#garden').boundingBox();if(await p.locator('#garden').evaluate(d=>d.scrollWidth>d.clientWidth+1))throw Error('Horizontal clipping');if(r.x<0||r.y<0||r.x+r.width>w+1||r.y+r.height>h+1)throw Error('Dialog outside viewport');
  if(w===390||w===1440)await p.screenshot({path:`test-results/garden-${w}-stage${step}.png`});
  // Actual pointer hit testing, including the narrowest phone layout.
  const id=['ring-0','thin-0','prune-0','observe'][step];await p.locator(`[data-garden-pick="${id}"]`).click();await p.locator('.garden-close').click();
 }await p.close();console.log('PASS garden all stages',w,h);
}if(errors.length)throw Error(errors.join('\n'));await b.close();
