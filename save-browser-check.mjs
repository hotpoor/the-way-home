import {chromium,expect} from '@playwright/test';
import fs from 'node:fs/promises';
const b=await chromium.launch({channel:'chrome',headless:true});const p=await b.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:4173/');await p.waitForSelector('.loading',{state:'detached'});await p.locator('#start').click();await p.locator('#journal').click();
const imported={version:1,x:1320,hits:3,collected:[0,1,2],complete:true,started:true,chapter:2,garden:{step:1,adult:true,ring:[0,1,2,3],thin:[1],prune:[],observed:false}};
await p.locator('#import').setInputFiles({name:'garden.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(imported))});await expect(p.locator('#book')).not.toBeVisible();await expect(p.locator('#chapter h2')).toHaveText('枣树下的光');await p.locator('#journal').click();
const downloadPromise=p.waitForEvent('download');await p.locator('#export').click();const download=await downloadPromise;const text=await fs.readFile(await download.path(),'utf8');const saved=JSON.parse(text);if(saved.garden.thin[0]!==1||saved.chapter!==2)throw Error('Export loses partial chapter');
await p.locator('#import').setInputFiles({name:'broken.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({...imported,chapter:9}))});await expect(p.locator('#memory-text')).toContainText('格式');
p.once('dialog',d=>d.accept());await p.locator('#reset').click();await expect(p.locator('#book')).not.toBeVisible();await expect(p.locator('#chapter h2')).toHaveText('核桃落下来的时候');await expect(p.locator('#progress')).toHaveText('记忆碎片 0 / 2');
if(errors.length)throw Error(errors.join('\n'));console.log('PASS browser imports/exports partial second chapter, rejects invalid chapters, and resets both chapters');await b.close();
