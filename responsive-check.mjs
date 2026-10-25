import {chromium,expect} from '@playwright/test';
const b=await chromium.launch({channel:'chrome',headless:true});
for(const [w,h,touch] of [[320,568,true],[390,844,true],[844,390,true],[667,375,true],[1440,900,false],[2560,1080,false]]){
 const p=await b.newPage({viewport:{width:w,height:h},hasTouch:touch,isMobile:touch});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>localStorage.setItem('the-way-home.save.v1',JSON.stringify({version:1,x:1320,hits:0,collected:[],complete:false,started:true})));
 await p.goto('http://127.0.0.1:4173/');await p.waitForSelector('.loading',{state:'detached'});await p.waitForTimeout(700);
 const inside=async selector=>{const {width:w,height:h}=p.viewportSize();const r=await p.locator(selector).boundingBox();if(!r||r.x<-.5||r.y<-.5||r.x+r.width>w+.5||r.y+r.height>h+.5)throw Error(`${w}x${h} ${selector} offscreen ${JSON.stringify(r)}`);};
 await inside('#start');await p.locator('#start').click();await expect(p.locator('#interact')).toBeVisible();await p.waitForTimeout(700);
 for(const s of ['header','#chapter','#interact','#subtitle'])await inside(s);
 if(touch){await expect(p.locator('#touch')).toBeVisible();await inside('#touch');const a=await p.locator('#touch').boundingBox(),c=await p.locator('#interact').boundingBox();if(a.x+a.width>c.x)throw Error('control overlap');}
 await p.screenshot({path:`test-results/fit-${w}x${h}.png`});await p.locator('#journal').click();await inside('#book');await p.locator('#reset').scrollIntoViewIfNeeded();await inside('#reset');await p.locator('.close').click();
 await p.setViewportSize({width:h,height:w});await p.waitForTimeout(200);for(const s of ['header','#chapter','#interact'])await inside(s);if(touch)await inside('#touch');if(errors.length)throw Error(errors.join('\n'));console.log('PASS',w,h,touch?'touch':'mouse');await p.close();
}await b.close();
