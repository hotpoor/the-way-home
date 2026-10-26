import {chapterById,chapters} from './chapters.js';
import {propImg,propFigure,loadProp} from './props.js';
const $=(root,selector)=>root.querySelector(selector);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const choice=(id,label)=>`<button type="button" data-choice="${id}">${esc(label)}</button>`;
const palette=['#526449','#a66543','#d2ad65','#567585','#725b71'];
const icon=scene=>scene==='corn'?`<div class="prop-still-life corn-still-life">${propImg('corn')+propImg('basket')+propImg('schoolbag')}</div>`:scene==='moon'?`<img class="memory-illustration moon-memory" src="${import.meta.env.BASE_URL}assets/school-moon.webp" alt="月光下紧锁的学校大门" width="720" height="260">`:propFigure(scene==='dorm'?'dorm-objects':scene==='home'?'shared-home':'sketchbook');

export function createJourney({dialog,getState,onChange,onComplete,onWalk,onStage=()=>{}}){
 let chapter,index=0,review=false,showResult=false,feedback='',dispose=()=>{},resumeHome=false;
 const body=dialog.querySelector('.journey-body');
 const state=()=>getState();
 const status=text=>{const el=$(body,'.journey-feedback');if(el)el.textContent=text;};
 function clear(){dispose();dispose=()=>{};}
 dialog.addEventListener('close',clear);
 function finish(){clear();index++;if(!review){state().journey[chapter.id]=index;onChange();}showResult=true;feedback='';render();dialog.scrollTop=0;$(body,'#journey-next')?.focus();}
 function shell(task,content){
  body.innerHTML=`<span class="eyebrow">${review?'重温 · ':''}${esc(chapter.place)} · ${index+1} / ${chapter.tasks.length}</span><h2 id="journey-title">${esc(task.title)}</h2><p class="journey-story">${esc(task.story)}</p>${content}<p class="journey-instruction">${esc(task.hint||'慢慢看，按自己的节奏走。')}</p><p class="journey-feedback" role="status" aria-live="polite">${esc(feedback||'这一段，不用急。')}</p><small>每段回忆结束后自动保存 · 可随时收起</small>`;
 }
 function onChoices(callback){body.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>callback(b.dataset.choice,b));}
 function render(){clear();
  if(showResult){const last=chapter.tasks[index-1];body.innerHTML=`<div class="journey-result"><span class="eyebrow">${index===chapter.tasks.length?'拾起一页 · '+String(chapter.id).padStart(2,'0'):'记忆里的一次停留'}</span><h2 id="journey-title">${index===chapter.tasks.length?esc(chapter.title):'这一段，她记住了。'}</h2><blockquote>${esc(last.quote)}</blockquote><p>${index===chapter.tasks.length?'她合上这一页，黑狗已经在路边等她。':'风翻动纸页，下一段日子也慢慢展开。'}</p><button class="primary" id="journey-next">${index===chapter.tasks.length?'把这一页收进手记':chapter.id===10?'沿着画卷，再走一会儿':'翻到下一段回忆 →'}</button></div>`;$(body,'#journey-next').onclick=()=>{showResult=false;if(index===chapter.tasks.length){dialog.close();onComplete(chapter.id);}else if(chapter.id===10&&index===1){resumeHome=true;dialog.close();onWalk();}else render();};return;}
  const task=chapter.tasks[index];if(!task)return;onStage(chapter.id,index);
  if(['collect','observe'].includes(task.type))renderCollect(task);
  else if(['route','assemble'].includes(task.type))renderOrder(task);
  else if(task.type==='conversation')renderConversation(task);
  else if(task.type==='schedule')renderSchedule(task);
  else if(task.type==='ride')renderRide(task);
  else if(task.type==='trace')renderTrace(task);
  else if(['sketch','paint'].includes(task.type))renderSketch(task);
  else if(task.type==='layout')renderLayout(task);
  else if(task.type==='design')renderDesign(task);
  else if(task.type==='water')renderWater(task);
  else if(task.type==='profile')renderProfile(task);
  else if(task.type==='collage')renderCollage(task);
  else {shell(task,propFigure('sketchbook')+`<button class="primary" id="home-finish">收好画册，和黑狗一起回家</button>`);$(body,'#home-finish').onclick=finish;}
 }
 function renderCollect(task){let picked=new Set();
  const corn=task.scene==='corn';
  const picks=task.items.map((s,i)=>`<button type="button" data-choice="object-${i}">${corn?propImg('corn','collected-prop'):''}<span>${corn?esc(s.slice(0,-2))+'<br>玉米':esc(s)}</span></button>`).join('');
  shell(task,(corn?`<div class="prop-collection">${picks}</div><div class="collection-storage">${propImg('basket')+propImg('schoolbag')}</div>`:icon(task.scene)+`<div class="journey-choices object-choices">${picks}</div>`)+`<button id="collect-finish" class="primary" disabled>${esc(task.after||'把这些日常收好')}</button>`);
  onChoices((id,b)=>{const i=Number(id.split('-')[1]);picked.add(i);b.disabled=true;b.classList.add('object-picked');b.setAttribute('aria-pressed','true');status(task.notes?.[i]||`已收好 ${picked.size} / ${task.items.length} 件。`);$(body,'#collect-finish').disabled=picked.size!==task.items.length;});$(body,'#collect-finish').onclick=finish;}

 function renderOrder(task){let position=0;const labels=task.type==='assemble'?task.order.map((s,i)=>`${i+1} · ${s}`):task.order;
  shell(task,(task.prop?propFigure(task.prop):'')+`<div class="order-board ${task.type==='assemble'?'model-board':''}" aria-label="已排列的顺序">${task.order.map((s,i)=>`<span id="order-${i}">${task.type==='assemble'?'□':'○'}</span>`).join('')}</div><div class="journey-choices">${[...task.order,...(task.extras||[])].map((s,i)=>choice('order-'+i,s)).reverse().join('')}</div>`);
  onChoices((id,b)=>{const i=Number(id.split('-')[1]);if(i!==position){status('先看看上一站在哪里，再往这里走。');return;}$(body,'#order-'+position).textContent=labels[position];b.disabled=true;position++;status(`已经接好 ${position} / ${task.order.length} 处。`);if(position===task.order.length)finish();});
 }
 function renderConversation(task){let turn=0;const draw=()=>{const t=task.turns[turn];shell(task,`<div class="conversation-line"><span>她听见</span><blockquote>${esc(t.line)}</blockquote></div><div class="journey-choices">${t.options.map((s,i)=>choice('reply-'+i,s)).join('')}</div>`);onChoices(id=>{const i=Number(id.split('-')[1]);if(i!==t.good){status('她想了想，先把话说得更贴近眼前的人。可以换一种回应。');return;}feedback=t.reply;turn++;if(turn===task.turns.length)finish();else draw();});};draw();}
 function renderSchedule(task){let slots=[];shell(task,`<div class="schedule-slots">${Array.from({length:6},(_,i)=>`<span id="slot-${i}">${i+1} · 待安排</span>`).join('')}</div><div class="journey-choices">${choice('study','整理错题')+choice('rest','休息散步')+choice('meal','好好吃饭')+choice('undo','撤回上一段')}</div><button class="primary" id="schedule-finish" disabled>照这个节奏，再试一年</button>`);const update=()=>{for(let i=0;i<6;i++)$(body,'#slot-'+i).textContent=`${i+1} · ${slots[i]||'待安排'}`;$(body,'#schedule-finish').disabled=!(slots.length===6&&slots.filter(s=>s==='整理错题').length>=3&&slots.includes('休息散步')&&slots.includes('好好吃饭'));};onChoices(id=>{if(id==='undo')slots.pop();else if(slots.length<6)slots.push({study:'整理错题',rest:'休息散步',meal:'好好吃饭'}[id]);update();status(slots.length===6?'看看学习、休息和吃饭有没有都照顾到。':`已经安排 ${slots.length} / 6 段。`);});$(body,'#schedule-finish').onclick=finish;}
 function renderTrace(task){let points=0;const pos=[[18,78],[18,22],[47,22],[47,40],[80,40],[80,78]];shell(task,`<div class="plan-trace"><svg viewBox="0 0 720 360" preserveAspectRatio="none" aria-hidden="true"><path d="M130 281V79H338V144H576V281Z" fill="none" stroke="#b8b297" stroke-width="3" stroke-dasharray="7 8"/><path id="trace-line" d="" fill="none" stroke="#546948" stroke-width="5"/></svg>${pos.map(([x,y],i)=>`<button data-choice="point-${i}" style="left:${x}%;top:${y}%" aria-label="定位点 ${i+1}">${i+1}</button>`).join('')}</div>`);onChoices((id,b)=>{const i=Number(id.split('-')[1]);if(i!==points){status('沿着轮廓，从上一个定位点接着画。');return;}points++;b.classList.add('selected');b.disabled=true;$(body,'#trace-line').setAttribute('d',pos.slice(0,points).map(([x,y],i)=>`${i?'L':'M'}${x*7.2} ${y*3.6}`).join(' ')+(points===6?'Z':''));if(points===6)finish();});}
 function renderLayout(task){let windowSide='wall',door='blocked';const draw=()=>{shell(task,`<div class="layout-plan"><div class="plan-room"><span class="plan-window ${windowSide==='open'?'open':''}">窗 · ${windowSide==='open'?'面向开阔处':'被高墙挡住'}</span><div class="plan-table">工作台</div><div class="plan-walk ${door==='clear'?'clear':''}">入口 → 院子</div></div></div><div class="journey-choices">${choice('window',windowSide==='open'?'把窗移回墙边':'把窗移到开阔的一侧')+choice('door',door==='clear'?'把工作台移回通道':'移开挡路的工作台')}</div><button class="primary" id="layout-finish" ${windowSide==='open'&&door==='clear'?'':'disabled'}>让光和人都能进来</button>`);onChoices(id=>{if(id==='window')windowSide=windowSide==='open'?'wall':'open';else door=door==='clear'?'blocked':'clear';draw();});$(body,'#layout-finish').onclick=finish;};draw();}
 function renderDesign(task){let chosen=new Set();shell(task,`<div class="design-garden" aria-label="毕业设计小院"><div class="design-title">一处可以歇脚的小院</div><div id="design-parts"></div></div><div class="journey-choices">${task.items.map((s,i)=>choice('part-'+i,s)).join('')}</div><button class="primary" id="design-finish" disabled>把这一处小院画进毕业图纸</button>`);onChoices((id,b)=>{const i=Number(id.split('-')[1]);chosen.has(i)?chosen.delete(i):chosen.add(i);b.setAttribute('aria-pressed',chosen.has(i));$(body,'#design-parts').textContent=[...chosen].map(i=>task.items[i]).join('　 ·　');$(body,'#design-finish').disabled=!(chosen.has(0)&&chosen.has(1)&&chosen.size>=3);});$(body,'#design-finish').onclick=finish;}
 function renderWater(task){let amounts=[10,10,10];shell(task,`<div class="plant-row">${amounts.map((_,i)=>`<div class="plant">${propImg('potted-plant','plant-prop')}<label for="water-${i}">窗边的花 ${i+1}</label><meter id="water-${i}" min="0" max="100" low="30" high="65" optimum="45" value="10"></meter><button data-choice="water-${i}">浇一点水</button><button data-choice="wait-${i}">等一会儿</button></div>`).join('')}</div><button class="primary" id="water-finish" disabled>把花放回阳光里</button>`);onChoices(id=>{const [action,n]=id.split('-'),i=Number(n);amounts[i]=Math.max(0,Math.min(100,amounts[i]+(action==='water'?20:-15)));$(body,'#water-'+i).value=amounts[i];$(body,'#water-finish').disabled=!amounts.every(n=>n>=30&&n<=65);status('一点点来，土里的水也需要时间慢慢渗开。');});$(body,'#water-finish').onclick=finish;}
 function renderProfile(task){let facts=new Set(state().profileFacts||[]);shell(task,`<div class="journey-choices">${task.items.map((s,i)=>choice('fact-'+i,s)).join('')}</div><label class="profile-label" for="profile-text">写一段自己的介绍</label><textarea id="profile-text" maxlength="360" rows="5" placeholder="从喜欢的日常开始，也可以说说想一起做的事。"></textarea><div class="profile-preview"><span class="eyebrow">画册里的一封介绍</span><p id="profile-preview"></p></div><button class="primary" id="profile-finish">把这封介绍留在画册里</button>`);
  const input=$(body,'#profile-text');input.value=state().profileText||'';const sync=()=>{state().profileText=input.value.slice(0,360);state().profileFacts=[...facts];$(body,'#profile-preview').textContent=input.value||'这里会留下她愿意让别人认识的自己。';body.querySelectorAll('[data-choice]').forEach(b=>b.setAttribute('aria-pressed',facts.has(Number(b.dataset.choice.split('-')[1]))));onChange();};
  onChoices(id=>{const i=Number(id.split('-')[1]);facts.has(i)?facts.delete(i):facts.add(i);input.value=[...facts].map(i=>task.items[i]).join('，')+(facts.size?'。想认识一个能一起散步，也能各自安静做事的人。':'');sync();});input.oninput=sync;sync();$(body,'#profile-finish').onclick=()=>{if(input.value.trim().length<12){status('再写具体一点，比如喜欢的事，或愿意一起度过的日常。');return;}sync();finish();};
 }
 function renderCollage(task){let selected=null;const order=state().collage;const draw=()=>{shell(task,propFigure('sketchbook')+`<div class="memory-palette" aria-label="可安放的记忆">${chapters.map(c=>`<button data-memory="${c.id}" ${order.includes(c.id)?'disabled':''} aria-pressed="${selected===c.id}">${String(c.id).padStart(2,'0')} · ${esc(c.title)}</button>`).join('')}</div><div class="collage-slots" aria-label="长卷的十处空位">${order.map((id,i)=>`<button data-slot="${i}" ${id?'disabled':''}>${id?esc(chapterById(id).title):'安放在这里 · '+(i+1)}</button>`).join('')}</div><button class="primary" id="collage-finish" ${order.every(Boolean)?'':'disabled'}>走进这幅装着记忆的画</button>`);body.querySelectorAll('[data-memory]').forEach(b=>b.onclick=()=>{selected=Number(b.dataset.memory);draw();});body.querySelectorAll('[data-slot]').forEach(b=>b.onclick=()=>{if(!selected){status('先从上面选一段记忆。');return;}order[Number(b.dataset.slot)]=selected;selected=null;onChange();draw();});$(body,'#collage-finish').onclick=finish;};draw();}
 function renderSketch(task){
  const key=task.key;state().sketches[key]??=[];const strokes=state().sketches[key];let color=0,current=null;
  shell(task,`<div class="art-supplies">${propImg('art-tools')}</div><div class="sketch-tools">${palette.map((c,i)=>`<button data-color="${i}" style="--paint:${c}" aria-label="颜色 ${['灰绿','赭红','土黄','青蓝','紫灰'][i]}" aria-pressed="${i===0}"></button>`).join('')}<button id="sketch-undo">撤回一笔</button><button id="add-stroke">用键盘添一笔</button><button id="download-art">保存这张画</button></div><canvas class="sketch-canvas" width="720" height="400" aria-label="${esc(task.title)}，用鼠标或手指绘画，也可使用添一笔按钮"></canvas><button class="primary" id="sketch-finish">把这一张画留在画册</button>`);
  const canvas=$(body,'canvas'),ctx=canvas.getContext('2d');
  function redraw(){ctx.fillStyle='#f5ecd6';ctx.fillRect(0,0,720,400);ctx.save();ctx.globalAlpha=.2;ctx.strokeStyle='#8b795c';ctx.lineWidth=2;ctx.beginPath();if(key==='jinci'){ctx.moveTo(100,230);ctx.lineTo(360,80);ctx.lineTo(620,230);ctx.moveTo(155,207);ctx.lineTo(565,207);ctx.moveTo(210,207);ctx.lineTo(210,330);ctx.moveTo(510,207);ctx.lineTo(510,330);ctx.moveTo(100,340);ctx.lineTo(620,340);}else{ctx.ellipse(360,245,70,50,0,0,Math.PI);ctx.moveTo(290,245);ctx.lineTo(320,340);ctx.lineTo(400,340);ctx.lineTo(430,245);ctx.moveTo(360,250);ctx.lineTo(340,120);ctx.moveTo(360,250);ctx.lineTo(410,140);}ctx.stroke();ctx.restore();
   for(const s of strokes){ctx.strokeStyle=palette[s.color];ctx.lineWidth=key==='painting'?6:3;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();s.points.forEach(([x,y],i)=>{if(i)ctx.lineTo(x*.72,y*.4);else ctx.moveTo(x*.72,y*.4);});ctx.stroke();}
  }
  function limit(){return strokes.reduce((n,s)=>n+s.points.length,0)>=800||strokes.length>=80;}
  const point=e=>{const r=canvas.getBoundingClientRect();return [Math.round(Math.max(0,Math.min(1000,(e.clientX-r.left)/r.width*1000))),Math.round(Math.max(0,Math.min(1000,(e.clientY-r.top)/r.height*1000)))];};
  canvas.onpointerdown=e=>{if(limit()){status('这一页已经画得很满，可以撤回几笔，或把画收好。');return;}canvas.setPointerCapture(e.pointerId);current={color,points:[point(e)]};strokes.push(current);};
  canvas.onpointermove=e=>{if(!current||limit())return;const p=point(e),last=current.points.at(-1);if(Math.hypot(p[0]-last[0],p[1]-last[1])<4)return;current.points.push(p);redraw();};
  const end=()=>{if(current?.points.length===1)current.points.push([current.points[0][0]+(current.points[0][0]<1000?1:-1),current.points[0][1]]);current=null;onChange();redraw();};canvas.onpointerup=canvas.onpointercancel=end;dispose=()=>{if(current)end();};
  body.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>{color=Number(b.dataset.color);body.querySelectorAll('[data-color]').forEach(x=>x.setAttribute('aria-pressed',x===b));});
  $(body,'#sketch-undo').onclick=()=>{strokes.pop();onChange();redraw();};$(body,'#add-stroke').onclick=()=>{if(limit())return;const n=strokes.length;strokes.push({color,points:[[180+(n*53)%540,300+(n*37)%400],[360+(n*43)%500,220+(n*29)%500]]});onChange();redraw();};
  $(body,'#download-art').onclick=()=>{const a=document.createElement('a');a.download=key==='jinci'?'晋祠写生.png':'窗边的画.png';a.href=canvas.toDataURL('image/png');a.click();};
  $(body,'#sketch-finish').onclick=()=>{if(strokes.length<2){status('再留下一些自己的线条或颜色吧。');return;}onChange();finish();};redraw();
 }
 function renderRide(task){
  shell(task,`<div class="ride-stage"><canvas width="720" height="360" aria-label="三条车道的骑行路，使用上下方向键或下方按钮换道"></canvas><div class="ride-hud"><span id="ride-distance">路程 0%</span><span id="ride-note">先看看前面的路。</span></div></div><div class="ride-controls">${[0,1,2].map((n)=>`<button data-lane="${n}" aria-pressed="${n===1}">${['上方车道','中间车道','下方车道'][n]}</button>`).join('')}${task.vehicle==='motorcycle'?'<button id="ride-brake">按住，慢一点</button>':''}<button class="primary" id="ride-start">准备好了，出发</button></div>`);
  const canvas=$(body,'canvas'),ctx=canvas.getContext('2d'),abort=new AbortController();let lane=1,distance=0,started=false,brake=false,hitUntil=0,previous=0,raf=0,alive=true;
  let sprites=null;$(body,'#ride-start').disabled=true;status('正在把车子和路上的物件准备好……');
  Promise.all([loadProp(task.vehicle),loadProp('road-stone'),loadProp('puddle')]).then(images=>{if(!alive)return;sprites=images;$(body,'#ride-start').disabled=false;status('车子准备好了，按自己的节奏出发。');}).catch(()=>{if(alive)status('道具图片暂时没有加载好，可以收起这页再试一次。');});
  const hazards=Array.from({length:10},(_,i)=>({distance:200+i*110,lane:[1,0,2,1,2,0,1,0,2,1][i],passed:false}));
  const setLane=n=>{lane=Math.max(0,Math.min(2,n));body.querySelectorAll('[data-lane]').forEach(b=>b.setAttribute('aria-pressed',Number(b.dataset.lane)===lane));};
  body.querySelectorAll('[data-lane]').forEach(b=>b.onclick=()=>setLane(Number(b.dataset.lane)));
  window.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','w','s','W','S'].includes(e.key)){e.preventDefault();setLane(lane+(['ArrowUp','w','W'].includes(e.key)?-1:1));}}, {signal:abort.signal});
  const br=$(body,'#ride-brake');if(br){br.onpointerdown=e=>{br.setPointerCapture(e.pointerId);brake=true;};br.onpointerup=br.onpointercancel=()=>brake=false;br.onkeydown=e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();brake=true;}};br.onkeyup=()=>brake=false;br.onblur=()=>brake=false;}
  window.addEventListener('blur',()=>{brake=false;},{signal:abort.signal});document.addEventListener('visibilitychange',()=>{if(document.hidden)brake=false;},{signal:abort.signal});
  $(body,'#ride-start').onclick=()=>{started=true;$(body,'#ride-start').disabled=true;status('前方有石块和水洼。慢慢熟悉路，碰到了也能继续。');};
  function draw(now){if(!alive)return;const dt=previous?Math.min(.05,(now-previous)/1000):0;previous=now;
   if(started&&!document.hidden){const speed=now<hitUntil?32:brake?40:80;distance=Math.min(1400,distance+dt*speed);}
   ctx.fillStyle='#c9c29b';ctx.fillRect(0,0,720,360);ctx.fillStyle='#e0cca1';ctx.fillRect(0,55,720,245);ctx.strokeStyle='#ab9d79';ctx.lineWidth=2;ctx.setLineDash([18,20]);for(const y of [136,218]){ctx.beginPath();ctx.moveTo(-(distance%38),y);ctx.lineTo(720,y);ctx.stroke();}ctx.setLineDash([]);
   for(const h of hazards){const x=140+(h.distance-distance)*1.3,y=95+h.lane*82;if(sprites&&x>-40&&x<760){ctx.drawImage(h.lane===2?sprites[2]:sprites[1],x-38,y-28,76,56);}if(started&&!h.passed&&distance>=h.distance){h.passed=true;if(h.lane===lane&&!(task.vehicle==='motorcycle'&&brake)){hitUntil=now+900;$(body,'#ride-note').textContent='颠了一下，慢一点再走。';}else $(body,'#ride-note').textContent=brake?'她减速，等后座的人坐稳。':'这一处，平稳地绕过去了。';}}
   const y=95+lane*82;if(sprites)ctx.drawImage(sprites[0],84,y-46,112,92);
   $(body,'#ride-distance').textContent=`路程 ${Math.floor(distance/14)}%`;
   if(distance>=1400){finish();return;}raf=requestAnimationFrame(draw);
  }
  dispose=()=>{alive=false;cancelAnimationFrame(raf);abort.abort();};raf=requestAnimationFrame(draw);
 }
 return {open(id){chapter=chapterById(id);review=(state().journey[id]??0)>=chapter.tasks.length;index=id===10&&resumeHome?1:review?0:(state().journey[id]??0);resumeHome=false;showResult=false;feedback='';render();dialog.showModal();dialog.scrollTop=0;}};
}
