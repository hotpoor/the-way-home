import { chromium, expect } from '@playwright/test';
const browser=await chromium.launch({headless:true,channel:'chrome'});
const page=await browser.newPage({viewport:{width:1440,height:900}});const errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.env.GAME_URL || 'http://127.0.0.1:4173/');await page.waitForSelector('.loading',{state:'detached'});await page.waitForTimeout(500);
await page.screenshot({path:'test-results/title.png'});await page.locator('#start').click();
await page.keyboard.down('ArrowRight');await page.waitForTimeout(9000);await page.keyboard.up('ArrowRight');await page.waitForTimeout(500);
await page.screenshot({path:'test-results/tree.png'});
for(let i=0;i<6;i++){const s=await page.evaluate(()=>JSON.parse(localStorage.getItem('the-way-home.save.v1')));if(s.hits===3)break;await page.locator('#interact').click();await page.waitForTimeout(1450);}
for(const x of [1200,1330,1430]){await page.mouse.click(x-160,735);await page.waitForTimeout(2000);if(await page.locator('#interact').isVisible()){await page.locator('#interact').click();await page.waitForTimeout(150);}}
await expect(page.locator('#ending')).toBeVisible();await page.screenshot({path:'test-results/ending.png'});await page.locator('#continue').click();
const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('the-way-home.save.v1')));if(!saved.complete||saved.collected.length!==3)throw Error('chapter not saved');
await page.reload();await page.waitForSelector('.loading',{state:'detached'});await expect(page.locator('#start')).toContainText('继续旅程');await page.locator('#start').click();await expect(page.locator('#progress')).toContainText('1 / 1');
await page.locator('#journal').click();await expect(page.locator('#memory-state')).toContainText('已拾起');await page.locator('.close').click();
await page.setViewportSize({width:390,height:844});await page.waitForTimeout(600);await page.screenshot({path:'test-results/mobile.png'});
if(errors.length)throw Error(errors.join('\n'));console.log('PASS: playable chapter, three walnuts, completion, reload persistence, journal, mobile viewport; no page errors');await browser.close();
