import {propImg} from './props.js';
export const gardenTasks=[
 {season:'初夏 · 花开的时候',title:'先看树，再动手',intro:'长辈把工具放在一旁：“这棵枝叶饱满，那棵还小。你说，先看哪一棵？”',hint:'先选树势健壮的成年树，再沿示意圈依次标出四处位置。',quote:'“不能只惦记着果子，也得先看看树。”'},
 {season:'夏日 · 青枣挤满枝头',title:'给留下的枣让一点光',intro:'小时候，她总舍不得摘掉任何一颗。如今再看，几颗小枣挤在同一处，连叶子都翻不过身。',hint:'找出三颗挤在一起的小果，留下三颗饱满、间隔较开的果子。',quote:'“留得少一点，剩下的才长得好。”'},
 {season:'冬日 · 枝条露出轮廓',title:'剪开一道透光的缝',intro:'一根交叉枝上，还缠着旧秋千的绳头。她摸了摸绳痕，把那截绳子收进衣袋。',hint:'找到交叉、枯弱的两根枝条，保留向外伸展的健壮枝。',quote:'她把绳头收好，才举起剪刀。'},
 {season:'又一春 · 一簇不一样的新叶',title:'病树也要慢慢看',intro:'这一簇小枝挤得格外密，叶子也和旁边不同。长辈问：“是缺水，还是别的缘故？”',hint:'先找到异常簇生的小枝，再决定下一步。',quote:'“别急着下结论。等懂树的人来，一起看看。”'}
];
const trunk='<path d="M338 360 Q358 270 350 210 Q342 140 366 64"/><path d="M350 224 Q295 177 218 140 Q171 121 136 80"/><path d="M352 183 Q414 160 473 104 Q497 84 531 74"/><path d="M348 266 Q425 255 544 200"/>';
const leaf=(x,y,angle=0)=>`<ellipse cx="${x}" cy="${y}" rx="19" ry="8" transform="rotate(${angle} ${x} ${y})" fill="#7c8654" stroke="none"/>`;
const tree=(extra='',winter=false)=>`<svg preserveAspectRatio="none" viewBox="0 0 720 400" aria-hidden="true"><ellipse cx="360" cy="362" rx="245" ry="12" fill="#d9c9a7"/><g fill="none" stroke="#796044" stroke-width="15" stroke-linecap="round" stroke-linejoin="round">${trunk}</g><g fill="none" stroke="#a28a65" stroke-width="3">${trunk}</g>${winter?'':[[160,104,-30],[223,140,30],[300,185,-25],[365,90,50],[455,125,-40],[520,85,20],[510,210,-20],[420,240,35]].map(p=>leaf(...p)).join('')}${extra}</svg>`;
const button=(id,label,x,y,selected=false,kind='target')=>`<button type="button" class="garden-${kind}${selected?' selected':''}" data-garden-pick="${id}" style="left:${x}%;top:${y}%" aria-label="${label}" aria-pressed="${selected}">${kind.includes('fruit')?propImg(kind.includes('small-fruit')?'jujube-green':'jujube-ripe','garden-fruit-image'):label}</button>`;

export function createGarden({dialog,getState,onChange,onComplete}){
 let feedback='',showingResult=false;
 const g=()=>getState().garden;
 function render(){
  const state=g(),step=state.step;
  if(showingResult||step===4){const task=gardenTasks[Math.max(0,step-1)];dialog.querySelector('.garden-body').innerHTML=`<div class="garden-result"><span class="eyebrow">${step===4?'拾起一页 · 02':'照料过的一段时光'}</span><h2 id="garden-title">${step===4?'枣树下的光':'这一回，她记住了。'}</h2><blockquote>${task.quote}</blockquote><p>${step===4?'四个季节翻过去，树仍在院里。她把那截旧绳放在画册旁，黑狗趴在树影下。':'院里的光慢慢移动。记忆翻到了另一个季节。'}</p><button class="primary" id="garden-next">${step===4?'把这一页收进手记':'翻到下一段回忆 →'}</button></div>`;dialog.querySelector('#garden-next').onclick=()=>{showingResult=false;if(step===4){dialog.close();onComplete();}else render();};return;}
  const task=gardenTasks[step];let art='',choices='';
  if(step===0){art=tree('<ellipse cx="350" cy="250" rx="145" ry="95" fill="none" stroke="#a98554" stroke-width="3" stroke-dasharray="5 6"/>');
   if(state.adult){art+= [[48.6,39],[68.6,62.5],[48.6,86],[28.6,62.5]].map(([x,y],i)=>button('ring-'+i,''+(i+1),x,y,state.ring.includes(i))).join('');}
   choices=`<button data-garden-pick="adult" aria-pressed="${state.adult}">枝叶饱满的成年树</button><button data-garden-pick="young">细弱的小树</button><p class="garden-note">记忆中的环切示意：先辨树势，再由有经验的长辈操作。</p>`;
  }else if(step===1){art=tree('<g stroke="#8d7954" stroke-width="3" fill="none"><path d="M136 80 L115 96 M350 80 L310 76 M531 74 L590 100 M218 140 L230 200 M350 210 L360 216 M480 220 L475 192"/></g>');art+=[[16,24],[43,19],[82,25]].map(([x,y],i)=>button('keep-'+i,'饱满且间隔较开的果子',x,y,false,'fruit')).join('');art+=[[32,50],[50,54],[66,48]].map(([x,y],i)=>button('thin-'+i,'挤在一起的小果 '+(i+1),x,y,state.thin.includes(i),'fruit small-fruit')).join('');
  }else if(step===2){art=tree(`<path class="${state.prune.includes(0)?'removed':''}" d="M286 184 Q360 170 465 243" stroke="#997c5e" stroke-width="10" fill="none"/><path class="${state.prune.includes(1)?'removed':''}" d="M350 146 Q306 106 281 61" stroke="#ae9d7d" stroke-width="7" fill="none"/><path d="M304 189 Q305 244 310 274" stroke="#b09b73" stroke-width="3" fill="none"/>`,true);art+=button('prune-0','交叉枝',55,53,state.prune.includes(0))+button('prune-1','枯弱枝',40,22,state.prune.includes(1))+button('keep-branch','向外的健壮枝',70,30);
  }else{art=tree('<g stroke="#7e7850" stroke-width="3">'+Array.from({length:9},(_,i)=>`<path d="M480 150 Q${450+i*7} 115 ${455+i*7} ${70+i%3*11}" fill="none"/>${leaf(455+i*7,75+i%3*11,-60)}`).join('')+'</g>');art+=button('observe','看看这簇小枝',67,26,state.observed);if(state.observed)choices='<button data-garden-pick="diagnose">记下异常，请懂病树的人确认</button><button data-garden-pick="water">先不停浇水试试</button><button data-garden-pick="medicine">随手找药涂上</button>';}
  if(step===1)art+=`<div class="garden-prop garden-basket">${propImg('basket')}</div>`;
  if(step===2)art+=`<div class="garden-prop garden-shears">${propImg('pruning-shears')}</div>`;
  dialog.querySelector('.garden-body').innerHTML=`<span class="eyebrow">${task.season} · ${step+1} / 4</span><h2 id="garden-title">${task.title}</h2><p class="garden-story">${task.intro}</p><div class="garden-work" role="group" aria-label="${task.hint}">${art}</div><p class="garden-instruction">${task.hint}</p><div class="garden-choices">${choices}</div><p class="garden-feedback" role="status" aria-live="polite">${feedback||'慢慢看，不用赶时间。'}</p><small>四个季节里的回忆 · 每一步都会自动保存</small>`;
  dialog.querySelectorAll('[data-garden-pick]').forEach(b=>b.onclick=()=>pick(b.dataset.gardenPick));
 }
 function finish(){g().step++;showingResult=true;feedback='';onChange();render();dialog.scrollTop=0;dialog.querySelector('#garden-next')?.focus();}
 function pick(id){const state=g();let accepted=false;
  if(id==='adult'){state.adult=true;feedback='枝叶饱满。长辈点点头，让她沿示意圈标出位置。';accepted=true;}
  else if(id==='young')feedback='这棵还细弱，先让它好好长。看看旁边那棵成年树。';
  else if(id.startsWith('ring-')&&state.step===0&&state.adult){const n=Number(id.split('-')[1]);if(!state.ring.includes(n))state.ring.push(n);feedback=`示意位置已标出 ${state.ring.length} / 4。`;accepted=true;if(state.ring.length===4){finish();return;}}
  else if(id.startsWith('thin-')&&state.step===1){const n=Number(id.split('-')[1]);if(!state.thin.includes(n))state.thin.push(n);feedback=`留出了一点空隙 · ${state.thin.length} / 3。`;accepted=true;if(state.thin.length===3){finish();return;}}
  else if(id.startsWith('prune-')&&state.step===2){const n=Number(id.split('-')[1]);if(!state.prune.includes(n))state.prune.push(n);feedback='光从枝条间透进来。';accepted=true;if(state.prune.length===2){finish();return;}}
  else if(id==='observe'&&state.step===3){state.observed=true;feedback='她记下了异常簇生的小枝和叶片，先不猜病名。';accepted=true;}
  else if(id==='diagnose'&&state.step===3&&state.observed){finish();return;}
  else if(id==='water')feedback='还没找到原因，反复浇水并不能替代诊断。';
  else if(id==='medicine')feedback='先辨认、再确认，才知道该怎样照料。';
  else feedback=state.step===1?'这一颗饱满，也有生长空间。先留下它。':'这根向外伸展，先保留，让阳光照进来。';
  if(accepted)onChange();render();dialog.querySelector(`[data-garden-pick="${id}"]`)?.focus({preventScroll:true});
 }
 return {open(){feedback='';showingResult=false;render();dialog.showModal();dialog.scrollTop=0;}};
}
