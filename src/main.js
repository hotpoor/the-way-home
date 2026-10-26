import * as THREE from 'three';
import './style.css';
import {fresh, read, write, validate} from './save.js';
import {advanceWalk,walkFrame} from './walk-cycle.js';
import {IdleMotion} from './idle-motion.js';

const $ = s => document.querySelector(s);
const storage = {getItem: k => window.localStorage.getItem(k), setItem: (k,v) => window.localStorage.setItem(k,v)};
let state = read(storage), target = state.x, active = false, time = 0, strikeAt = -100, lastSaved = 0;
let viewportHeight=900;
let viewWidth = 1600, viewHeight = 900, cameraTop = 0, cameraLeft = 0, dialogueUntil = 0, soundEnabled = false, audio;
const keys = new Set(), scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(0,1600,0,900,.1,100);
camera.position.z = 20;
const loading = document.createElement('div'); loading.className='loading'; loading.innerHTML='来时的路<small>风正吹过麦田……</small>'; document.body.append(loading);
let renderer;
try { renderer = new THREE.WebGLRenderer({antialias:true,alpha:false}); }
catch { loading.innerHTML='暂时无法展开这幅画<small>请开启浏览器硬件加速，或换一个支持 WebGL 的浏览器。</small>'; throw Error('WebGL unavailable'); }
renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setClearColor('#eee3c8'); renderer.outputColorSpace = THREE.SRGBColorSpace;
$('#game').append(renderer.domElement);

function texture(w,h,draw) { const canvas=document.createElement('canvas'); canvas.width=w;canvas.height=h;draw(canvas.getContext('2d'));const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;return t; }
function plane(map,w,h,x,y,z){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map,transparent:true,depthTest:false,side:THREE.DoubleSide}));m.scale.y=-1;m.position.set(x,y,z);m.renderOrder=z;scene.add(m);return m;}
const asset = n => `${import.meta.env.BASE_URL}assets/${n}`;
let background;
try { background=await new THREE.TextureLoader().loadAsync(asset('village.png')); }
catch { loading.innerHTML='画卷加载失败<small>请刷新页面重试。</small>'; throw Error('Background loading failed'); }
background.colorSpace=THREE.SRGBColorSpace; plane(background,1600,900,800,450,0);
// Hand-painted animated silhouettes, rendered as independent Three.js planes.
function womanTexture(step=0,striking=false){return texture(200,260,c=>{
 c.translate(100,235);c.fillStyle='#383b2960';c.beginPath();c.ellipse(1,5,38,7,0,0,Math.PI*2);c.fill();
 c.strokeStyle='#262a24';c.lineWidth=9;c.lineCap='round';for(const [x,s] of [[-10,1],[10,-1]]){c.beginPath();c.moveTo(x,-23);c.lineTo(x+Math.sin(step)*7*s,0);c.stroke();}
 c.fillStyle='#252a25';c.beginPath();c.moveTo(-14,-151);c.bezierCurveTo(-25,-118,-18,-85,-36,-30);c.quadraticCurveTo(0,-15,33,-29);c.lineTo(14,-145);c.closePath();c.fill();
 c.strokeStyle='#353a30';c.lineWidth=3;c.beginPath();c.moveTo(-8,-131);c.lineTo(-18,-34);c.stroke();
 c.fillStyle='#bba88b';c.beginPath();c.ellipse(1,-165,13,18,-.1,0,Math.PI*2);c.fill();
 c.strokeStyle='#262b25';c.lineWidth=12;c.beginPath();c.moveTo(-16,-139);c.lineTo(-25,-96);c.lineTo(striking?27:-17,striking?-177:-79);c.stroke();
 c.fillStyle='#c1ac8b';c.beginPath();c.arc(striking?27:-17,striking?-177:-79,5,0,7);c.fill();
 if(striking){c.strokeStyle='#695b3e';c.lineWidth=4;c.beginPath();c.moveTo(23,-160);c.lineTo(74,-253);c.stroke();}
 c.fillStyle='#20261f';c.beginPath();c.ellipse(0,-181,30,7,-.07,0,7);c.fill();c.beginPath();c.moveTo(-17,-182);c.quadraticCurveTo(-19,-210,0,-210);c.quadraticCurveTo(18,-210,18,-182);c.fill();
 c.strokeStyle='#605e43';c.lineWidth=2;c.beginPath();c.moveTo(-16,-185);c.lineTo(17,-185);c.stroke();
 });}
const frames=Array.from({length:8},(_,i)=>womanTexture(i*Math.PI/4));const strikeFrame=womanTexture(0,true);
const woman=plane(frames[0],115,150,state.x,0,4);
async function loadAtlas(name,columns=4,rows=2,count=8){
 const sheet=await new THREE.TextureLoader().loadAsync(asset(name));sheet.colorSpace=THREE.SRGBColorSpace;
 sheet.generateMipmaps=false;sheet.minFilter=THREE.LinearFilter;sheet.magFilter=THREE.LinearFilter;
 return Array.from({length:count},(_,i)=>{const t=sheet.clone();t.repeat.set(1/columns,1/rows);t.offset.set((i%columns)/columns,1-(Math.floor(i/columns)+1)/rows);t.needsUpdate=true;return t;});
}
let paintedWoman,paintedWomanIdle,paintedDog,womanCycle,womanPhase=0;
async function loadMotion(filename){
 const response=await fetch(asset(filename));if(!response.ok)throw Error('Motion not available');
 const meta=await response.json();const maps=await loadAtlas(meta.image,meta.columns,meta.rows,meta.frameCount);
 const idle=await new THREE.TextureLoader().loadAsync(asset(meta.idleImage));idle.colorSpace=THREE.SRGBColorSpace;
 return {meta,maps,idle};
}
let womanRest,womanIdleMotion;
try{
 const response=await fetch(asset('woman-walk-video.json'));if(!response.ok)throw Error('Video gait unavailable');
 womanCycle=await response.json();
 paintedWoman=await loadAtlas(womanCycle.image,womanCycle.columns,womanCycle.rows,womanCycle.frameCount);
 paintedWomanIdle=await new THREE.TextureLoader().loadAsync(asset(womanCycle.idleImage));paintedWomanIdle.colorSpace=THREE.SRGBColorSpace;
 woman.geometry.dispose();woman.geometry=new THREE.PlaneGeometry(womanCycle.displayWidth,womanCycle.displayHeight);
}catch{womanCycle=null;try{paintedWoman=await loadAtlas('woman-walk.png');}catch{console.warn('Using fallback woman animation');}}
try{womanRest=await loadMotion('woman-rest-walk-video.json');womanIdleMotion=new IdleMotion(womanRest.meta,{delay:4.5,cooldown:13,exitSeconds:2.2,exitRate:4});}catch{console.warn('Woman idle gesture not available');}
const dogFrames=Array.from({length:8},(_,i)=>texture(160,110,c=>{const a=i*Math.PI/4;c.fillStyle='#383b293c';c.beginPath();c.ellipse(78,96,55,6,0,0,7);c.fill();c.strokeStyle='#252a24';c.lineWidth=7;c.lineCap='round';for(let j=0;j<4;j++){const x=47+j*17;c.beginPath();c.moveTo(x,68);c.lineTo(x+Math.sin(a+j)*8,94);c.stroke();}c.fillStyle='#242a25';c.beginPath();c.ellipse(75,62,40,20,0,0,7);c.fill();c.beginPath();c.ellipse(112,42,18,21,-.4,0,7);c.fill();c.beginPath();c.ellipse(128,46,19,8,-.1,0,7);c.fill();c.beginPath();c.ellipse(104,49,8,19,-.4,0,7);c.fill();c.strokeStyle='#242a25';c.lineWidth=8;c.beginPath();c.moveTo(39,58);c.quadraticCurveTo(9,46,17,27+Math.sin(a)*5);c.stroke();c.fillStyle='#a99a73';c.fillRect(114,36,2,2);}));
const dog=plane(dogFrames[0],80,55,state.x-65,0,5);let dogX=state.x-65;
let dogCycle,dogRest,dogIdleMotion,dogPhase=0;
try{dogCycle=await loadMotion('dog-walk-video.json');paintedDog=dogCycle.maps;}catch{try{paintedDog=await loadAtlas('dog-walk.png');}catch{console.warn('Using fallback dog animation');}}
try{dogRest=await loadMotion('dog-rest-walk-video.json');dogIdleMotion=new IdleMotion(dogRest.meta,{delay:2.5,cooldown:11,exitSeconds:1.8,exitRate:2.4});}catch{console.warn('Dog idle gesture not available');}
if(paintedDog){dog.geometry.dispose();dog.geometry=new THREE.PlaneGeometry(dogCycle?.meta.displayWidth||100,dogCycle?.meta.displayHeight||100);}
function showMotion(mesh,motion,map){
 if(mesh.userData.motion!==motion.meta){mesh.geometry.dispose();mesh.geometry=new THREE.PlaneGeometry(motion.meta.displayWidth,motion.meta.displayHeight);mesh.userData.motion=motion.meta;}
 mesh.material.map=map;return (motion.meta.anchorY-.5)*motion.meta.displayHeight;
}
const poleMap=texture(80,300,c=>{c.strokeStyle='#776344';c.lineWidth=5;c.lineCap='round';c.beginPath();c.moveTo(16,285);c.lineTo(68,12);c.stroke();c.strokeStyle='#b09a67';c.lineWidth=1.5;c.beginPath();c.moveTo(15,285);c.lineTo(67,12);c.stroke();});
const pole=plane(poleMap,55,210,0,0,5);pole.visible=false;
const walnutMap=texture(40,40,c=>{c.strokeStyle='#f8e9a8';c.lineWidth=2;c.beginPath();c.arc(20,21,17,0,Math.PI*2);c.stroke();c.fillStyle='#6c4a28';c.beginPath();c.ellipse(20,21,11,13,.3,0,7);c.fill();c.strokeStyle='#a28046';c.lineWidth=2;c.beginPath();c.moveTo(20,9);c.bezierCurveTo(11,17,26,24,18,33);c.stroke();});
const nuts=[1200,1330,1430].map((x,i)=>{const n=plane(walnutMap,24,24,x,0,6);n.userData={i,landed:false,fall:0};return n;});
// A restrained layer of wind-blown leaves adds depth without moving the painting.
let seed=182;function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
const leafMap=texture(40,20,c=>{c.fillStyle='#ac853ac0';c.beginPath();c.ellipse(20,10,17,5,-.25,0,7);c.fill();});
const leaves=Array.from({length:20},()=>{const l=plane(leafMap,9+random()*10,7,random()*1600,random()*800,3);l.userData={speed:8+random()*14,phase:random()*7};return l;});
const pathY=x=> 635+85*Math.sin(Math.PI*x/1600)+40*x/1600;
function resize(){
 const {width:w,height:h}=$('#game').getBoundingClientRect();
 viewportHeight=h;renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(w,h);
 viewWidth=Math.min(1600,900*w/h);viewHeight=viewWidth*h/w;
 camera.right=viewWidth;camera.bottom=viewHeight;camera.updateProjectionMatrix();
 cameraLeft=THREE.MathUtils.clamp(state.x-viewWidth*.4,0,Math.max(0,1600-viewWidth));
 cameraTop=THREE.MathUtils.clamp(pathY(state.x)-viewHeight*.78,0,900-viewHeight);
 camera.position.set(cameraLeft,cameraTop,20);keys.clear();target=state.x;
}
addEventListener('resize',resize);window.visualViewport?.addEventListener('resize',resize);resize();loading.remove();
if(document.fullscreenEnabled){$('#fullscreen').hidden=false;$('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{say('当前浏览器暂不支持全屏，可以继续游玩。');}};document.addEventListener('fullscreenchange',()=>{$('#fullscreen').textContent=document.fullscreenElement?'退出全屏':'全屏';resize();});}

function save(){const ok=write(storage,state);$('#save-status').textContent=ok?'已存档 · 此浏览器':'无法保存 · 请从手记导出存档';}
function say(text,duration=5000){$('#subtitle').textContent=text;$('#subtitle').classList.add('visible');dialogueUntil=performance.now()+duration;}
function chime(note=440){if(!soundEnabled)return;audio??=new AudioContext();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.value=note;g.gain.setValueAtTime(0,audio.currentTime);g.gain.linearRampToValueAtTime(.045,audio.currentTime+.03);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+1.4);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+1.5);}
function updateUI(){
 $('#progress').textContent=`记忆碎片 ${state.complete?1:0} / 1`;
 $('#objective').textContent=state.complete?'画册多了一页。和黑狗再散一会儿步吧。':state.hits===0?'沿着小路，去看看那棵老核桃树。':state.hits<3?`轻轻敲打树枝 · ${state.hits} / 3`:`捡起落在小路上的核桃 · ${state.collected.length} / 3`;
 $('#memory-state').textContent=state.complete?'故乡 · 已拾起':'故乡 · 等待拾起';
 $('#memory-text').textContent=state.complete?'“留着明天吃。”她把一颗核桃留在了口袋里。':'画册还空着。去老树下看看吧。';
}
if(state.started){$('#start').innerHTML='继续旅程 <span>→</span>';$('#resume-note').textContent='上一次的脚步，已为你留下。';}updateUI();
$('#start').onclick=()=>{active=true;state.started=true;document.body.classList.add('playing');save();say(state.complete?'黑狗还记得回家的路。':'好多年了。这棵树，倒还认得我。');};
function dialogOpen(){return Boolean(document.querySelector('dialog[open]'));}
function interact(){if(!active||dialogOpen())return;womanIdleMotion?.reset();const near=nearestNut();
 if(near){state.collected.push(near.userData.i);chime(520+state.collected.length*90);say(['这一颗，滚得真远。','小时候，总嫌口袋不够大。','“留着明天吃。”'][state.collected.length-1]);if(state.collected.length===3){state.complete=true;save();$('#ending').showModal();} }
 else if(state.hits<3&&Math.abs(state.x-1320)<155&&time-strikeAt>1){strikeAt=time;state.hits++;chime(210+state.hits*40);say(['“你站远点，我要打了。”','她握稳长杆，轻轻敲了敲树枝。','树梢摇晃。像有人在上面笑。'][state.hits-1]);}
 updateUI();save();}
function nearestNut(){return nuts.find(n=>n.visible&&n.userData.landed&&Math.abs(n.position.x-state.x)<55);}
$('#interact').onclick=interact;
renderer.domElement.addEventListener('pointerdown',e=>{if(!active||dialogOpen())return;target=THREE.MathUtils.clamp(cameraLeft+(e.clientX-renderer.domElement.getBoundingClientRect().left)/renderer.domElement.clientWidth*viewWidth,70,1510);});
addEventListener('keydown',e=>{if(dialogOpen())return;if(['ArrowLeft','ArrowRight','a','d','A','D','e','E',' '].includes(e.key)){e.preventDefault();keys.add(e.key.toLowerCase());if(!e.repeat&&['e','E',' '].includes(e.key))interact();}});
addEventListener('keyup',e=>{keys.delete(e.key.toLowerCase());});addEventListener('blur',()=>keys.clear());
for(const [id,key] of [['left','arrowleft'],['right','arrowright']]){const b=$('#'+id);b.onpointerdown=e=>{b.setPointerCapture(e.pointerId);keys.add(key);};b.onpointerup=b.onpointercancel=()=>keys.delete(key);}
$('#journal').onclick=()=>{keys.clear();$('#book').showModal();};$('.close').onclick=()=>$('#book').close();
$('#continue').onclick=()=>{$('#ending').close();say('走吧。天还亮着。');};
$('#sound').onclick=()=>{soundEnabled=!soundEnabled;$('#sound').textContent=`声音 · ${soundEnabled?'开':'关'}`;$('#sound').setAttribute('aria-label',soundEnabled?'关闭声音':'开启声音');chime(440);};
$('#export').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='来时的路-存档.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('#import').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{if(f.size>10000)throw Error('存档文件过大');state=validate(JSON.parse(await f.text()));target=state.x;dogX=state.x-65;save();updateUI();$('#book').close();say('旧日的脚步，找回来了。');}catch(err){$('#memory-text').textContent=err.message;}e.target.value='';};
$('#reset').onclick=()=>{if(!confirm('重新启程会覆盖本浏览器的进度。需要的话，请先导出存档。'))return;state=fresh();state.started=true;target=state.x;dogX=state.x-65;for(const n of nuts){n.userData.landed=false;n.userData.fall=0;}active=true;document.body.classList.add('playing');save();updateUI();$('#book').close();say('这一次，慢慢走。');};
addEventListener('pagehide',save);document.addEventListener('visibilitychange',()=>{if(document.hidden){keys.clear();save();}});
let previous=performance.now();
function frame(now){const dt=Math.min((now-previous)/1000,.05);previous=now;time+=dt;const paused=!active||dialogOpen()||document.hidden;
 const previousX=state.x;
 const dir=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0);
 const womanIdle=womanIdleMotion?.update(dt,Boolean(dir)||Math.abs(target-state.x)>.2,paused);
 let moving=false;
 if(!paused&&womanIdle?.allowMove!==false){const speed=womanCycle?womanCycle.stride*womanCycle.fps/womanCycle.frameCount:110;if(dir)target=THREE.MathUtils.clamp(state.x+dir*speed*dt,70,1510);const delta=target-state.x;state.x+=Math.sign(delta)*Math.min(Math.abs(delta),speed*dt);moving=Math.abs(state.x-previousX)>.0001;if(moving&&time-lastSaved>2){save();lastSaved=time;}}
 const desiredLeft=THREE.MathUtils.clamp(state.x-viewWidth*.4,0,Math.max(0,1600-viewWidth));cameraLeft+= (desiredLeft-cameraLeft)*Math.min(1,dt*3);cameraTop+=(THREE.MathUtils.clamp(pathY(state.x)-viewHeight*.78,0,900-viewHeight)-cameraTop)*Math.min(1,dt*3);camera.position.set(cameraLeft,cameraTop,20);
 if(womanCycle)womanPhase=advanceWalk(womanPhase,state.x-previousX,womanCycle.stride);
 const womanOffset=womanCycle?(womanCycle.anchorY-.5)*womanCycle.displayHeight:65;
 woman.position.set(state.x,pathY(state.x)-womanOffset,4);
 const womanIndex=womanCycle?(moving?walkFrame(womanPhase,womanCycle.frameCount):womanCycle.idleFrame):(moving?Math.floor(time*8)%8:0);
 woman.material.map=paintedWomanIdle&&!moving?paintedWomanIdle:paintedWoman?paintedWoman[womanIndex]:(time-strikeAt<.65?strikeFrame:frames[moving?Math.floor(time*9)%8:0]);
 if(womanRest&&womanIdle?.active){const offset=showMotion(woman,womanRest,womanRest.maps[womanIdle.frame]);woman.position.y=pathY(state.x)-offset;}
 else if(womanCycle){showMotion(woman,{meta:womanCycle},woman.material.map);}
 pole.visible=active&&time-strikeAt<.65;pole.position.set(state.x+29,pathY(state.x)-144,5);pole.rotation.z=Math.sin((time-strikeAt)*Math.PI/.65)*-.2;
 const facing=state.x<previousX-.0001?-1:state.x>previousX+.0001?1:Math.sign(woman.scale.x);woman.scale.x=facing;
 const dogTarget=Math.max(55,state.x-65),previousDogX=dogX;
 const dogIdle=dogIdleMotion?.update(dt,Math.abs(dogTarget-dogX)>.35||moving,paused);
 if(!paused&&dogIdle?.allowMove!==false&&Math.abs(dogTarget-dogX)>.08)dogX+=(dogTarget-dogX)*Math.min(1,dt*2.8);
 const dogMoving=Math.abs(dogX-previousDogX)>.0001;
 dog.position.set(dogX,pathY(dogX)-(paintedDog?35:17),5);
 if(dogCycle){dogPhase=advanceWalk(dogPhase,dogX-previousDogX,dogCycle.meta.stride);const map=dogMoving?dogCycle.maps[walkFrame(dogPhase,dogCycle.meta.frameCount)]:dogCycle.idle;if(!dogRest||!dogIdle?.active)dog.position.y=pathY(dogX)-showMotion(dog,dogCycle,map);}
 else dog.material.map=(paintedDog||dogFrames)[dogMoving?Math.floor(time*10)%8:0];
 if(dogRest&&dogIdle?.active){dog.position.y=pathY(dogX)-showMotion(dog,dogRest,dogRest.maps[dogIdle.frame]);}
 if(dogMoving)dog.scale.x=dogX<previousDogX?-1:1;
 nuts.forEach((n,i)=>{n.visible=i<state.hits&&!state.collected.includes(i);if(n.visible){n.userData.fall=Math.min(1,n.userData.fall+dt*.8);n.userData.landed=n.userData.fall>=1;n.position.y=THREE.MathUtils.lerp(420,pathY(n.position.x)-5,n.userData.fall*n.userData.fall);n.rotation.z=n.userData.landed?Math.sin(time*2+i)*.06:time*3;}});
 leaves.forEach(l=>{l.position.x-=dt*l.userData.speed;if(l.position.x<0)l.position.x=1600;l.position.y+=Math.sin(time*.7+l.userData.phase)*dt*5;l.rotation.z=Math.sin(time+l.userData.phase)*.5;});
 const near=nearestNut(),tree=state.hits<3&&Math.abs(state.x-1320)<155;
 $('#interact').hidden=paused||(!near&&!tree);if(!$('#interact').hidden)$('#interact').innerHTML=near?'捡起核桃 <span>E</span>':'敲打核桃树 <span>E</span>';
 $('#subtitle').style.setProperty('--subtitle-offset',viewWidth<viewHeight?`${Math.max(110,viewportHeight-(pathY(state.x)-140-cameraTop)/viewHeight*viewportHeight+12)}px`:'110px');
 if(now>dialogueUntil)$('#subtitle').classList.remove('visible');renderer.render(scene,camera);
}
renderer.setAnimationLoop(frame);
