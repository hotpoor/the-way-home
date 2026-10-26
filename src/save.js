import {chapters,isUnlocked} from './chapters.js';
export const KEY = 'the-way-home.save.v1';
export function freshGarden(){return {step:0,adult:false,ring:[],thin:[],prune:[],observed:false};}
const indices=(value,max)=>Array.isArray(value)&&new Set(value).size===value.length&&value.every(n=>Number.isInteger(n)&&n>=0&&n<max);
export function validate(s) {
  if (!s || s.version !== 1 || !Number.isFinite(s.x) || s.x < 70 || s.x > 1510 || !Number.isInteger(s.hits) || s.hits < 0 || s.hits > 3 || !Array.isArray(s.collected) || new Set(s.collected).size !== s.collected.length || s.collected.some(n => !Number.isInteger(n) || n < 0 || n > 2 || n >= s.hits) || typeof s.complete !== 'boolean' || s.complete !== (s.collected.length===3)) throw new Error('这份存档格式不正确');
  const chapter=s.chapter??1,g=s.garden??freshGarden();
  if(!Number.isInteger(chapter)||chapter<1||chapter>10||(chapter>=2&&!s.complete)||!g||!Number.isInteger(g.step)||g.step<0||g.step>4||typeof g.adult!=='boolean'||typeof g.observed!=='boolean'||!indices(g.ring,4)||!indices(g.thin,3)||!indices(g.prune,2)||(!g.adult&&g.ring.length)||(g.step>=1&&(!g.adult||g.ring.length!==4))||(g.step>=2&&g.thin.length!==3)||(g.step>=3&&g.prune.length!==2)||(g.step===4&&!g.observed)||(g.step<1&&(g.thin.length||g.prune.length||g.observed))||(g.step<2&&(g.prune.length||g.observed))||(g.step<3&&g.observed)||(g.step===0&&g.ring.length===4)||(g.step===1&&g.thin.length===3)||(g.step===2&&g.prune.length===2)||(!s.complete&&(g.step||g.adult||g.ring.length||g.thin.length||g.prune.length||g.observed)))throw new Error('章节进度格式不正确');
  const rawJourney=s.journey??{};
  if(!rawJourney||typeof rawJourney!=='object'||Array.isArray(rawJourney))throw new Error('旅程进度格式不正确');
  const journey={};for(const c of chapters.filter(c=>c.id>=3)){const n=rawJourney[c.id]??0;if(!Number.isInteger(n)||n<0||n>c.tasks.length)throw new Error('旅程进度格式不正确');journey[c.id]=n;}
  const profileText=s.profileText??'',profileFacts=s.profileFacts??[];
  if(typeof profileText!=='string'||profileText.length>360||!indices(profileFacts,5))throw new Error('介绍内容格式不正确');
  const sketches={};for(const key of ['jinci','painting']){const strokes=s.sketches?.[key]??[];if(!Array.isArray(strokes)||strokes.length>80)throw new Error('画册笔触格式不正确');let total=0;sketches[key]=strokes.map(stroke=>{if(!stroke||!Number.isInteger(stroke.color)||stroke.color<0||stroke.color>4||!Array.isArray(stroke.points)||stroke.points.length<1||(total+=stroke.points.length)>801||stroke.points.some(p=>!Array.isArray(p)||p.length!==2||p.some(n=>!Number.isInteger(n)||n<0||n>1000)))throw new Error('画册笔触格式不正确');return {color:stroke.color,points:stroke.points.map(p=>[...p])};});}
  const collage=s.collage??Array(10).fill(null);
  if(!Array.isArray(collage)||collage.length!==10||collage.some(id=>id!==null&&(!Number.isInteger(id)||id<1||id>10))||new Set(collage.filter(Boolean)).size!==collage.filter(Boolean).length||(journey[10]>0&&!collage.every(Boolean)))throw new Error('长卷格式不正确');
  const result={version:1,x:s.x,hits:s.hits,collected:[...s.collected],complete:s.complete,started:Boolean(s.started),chapter,garden:{step:g.step,adult:g.adult,ring:[...g.ring],thin:[...g.thin],prune:[...g.prune],observed:g.observed},journey,profileText,profileFacts:[...profileFacts],sketches,collage:[...collage]};
  if(!isUnlocked(result,chapter)||chapters.some(c=>c.id>=3&&journey[c.id]>0&&!isUnlocked(result,c.id)))throw new Error('尚未走到这段旅程');
  return result;
}
export function fresh() { return validate({version:1,x:320,hits:0,collected:[],complete:false,started:false,chapter:1,garden:freshGarden()}); }
export function read(storage) { try { const raw = storage.getItem(KEY); return raw ? validate(JSON.parse(raw)) : fresh(); } catch { return fresh(); } }
export function write(storage, state) { try { storage.setItem(KEY, JSON.stringify(validate(state))); return true; } catch { return false; } }
