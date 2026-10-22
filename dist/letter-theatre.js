const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const MAIL_TITLE_LIMIT=30;
const envelopeTitle=value=>{const chars=Array.from(String(value??''));return chars.length>MAIL_TITLE_LIMIT?`${chars.slice(0,MAIL_TITLE_LIMIT-1).join('')}…`:chars.join('');};
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const searchIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg>';
let mailBrushId=0;

export function renderLetterTheatre(){
 return `<main class="page letters-page post-office letter-mailbox" aria-label="枝友来信"><h1 class="office-live">枝友来信</h1>
 <section class="mailbox-well" aria-label="上下浏览来信，点按抽出信纸"><div class="mailbox-stack" role="list"></div><div class="mailbox-empty" hidden><span class="mailbox-empty-kicker">来信检索 · 暂无结果</span><div class="mailbox-empty-rule" aria-hidden="true"></div><h2>这次没有找到来信</h2><p>试试别的植物或关键词<br>也欢迎写下你的问题，寄给枝友</p><div class="mailbox-empty-actions"><button data-mail-action="reset">查看全部来信 <span aria-hidden="true">→</span></button><button data-mail-action="write">寄出一封信 <span aria-hidden="true">↗</span></button></div></div></section>
 <div class="mailbox-toolbar" role="search"><label class="mailbox-query">${searchIcon}<input type="search" aria-label="搜索植物或来信" placeholder="找植物，找来信" autocomplete="off"></label><button class="mailbox-find" aria-label="筛选来信" aria-expanded="false" aria-controls="mailbox-search"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h4m4 0h8M4 17h9m4 0h3"/><circle cx="10" cy="7" r="2"/><circle cx="15" cy="17" r="2"/></svg><i aria-hidden="true"></i></button><button class="mailbox-write" data-mail-action="write" aria-label="寄出一封信"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 16 11-11 3 3-11 11-4 1 1-4ZM14 7l3 3"/></svg></button></div>
 <section class="mailbox-search" id="mailbox-search" aria-label="筛选来信" hidden><header><h2>找一封来信</h2><button class="mailbox-search-close" aria-label="收起筛选">×</button></header><div class="mailbox-filters"><fieldset><legend>关于哪一枝</legend><div class="mailbox-plants" role="group" aria-label="按植物筛选来信"></div></fieldset><fieldset><legend>回信状态</legend><div class="mailbox-status" role="group" aria-label="回信状态"><button data-mail-filter="" aria-pressed="true">全部</button><button data-mail-filter="answered" aria-pressed="false">有回信</button><button data-mail-filter="waiting" aria-pressed="false">待回信</button></div></fieldset><fieldset><legend>来信来源</legend><div class="mailbox-origin" role="group" aria-label="按来信来源筛选"><button data-mail-origin="" aria-pressed="true">全部来信</button><button data-mail-origin="mine" aria-pressed="false">我写的信</button></div></fieldset></div><footer><button class="mailbox-reset" data-mail-action="reset">清除条件</button><button class="mailbox-filter-done">查看 <span></span> 封来信 ↗</button></footer></section><span class="office-live mailbox-live" role="status" aria-live="polite"></span></main>`;
}

export function mountLetterTheatre({plants,getLetters,onOpen,onWrite,onDelete,filter,freshId,freshAnchorId,onReader}){
 const root=document.querySelector('.letter-mailbox');if(!root)return;
 const controller=new AbortController(),signal=controller.signal,P=Object.fromEntries(plants.map(p=>[p.id,p]));
 const compact=matchMedia('(max-width:799px), (pointer:coarse)').matches,cycleCount=compact?3:5,centerCycle=(cycleCount-1)/2;
 const well=root.querySelector('.mailbox-well'),stack=root.querySelector('.mailbox-stack'),searchPanel=root.querySelector('.mailbox-search'),find=root.querySelector('.mailbox-find'),query=root.querySelector('.mailbox-query input');
 const animations=new Set();let stage=null,items=[],plantFilter=filter||'',statusFilter='',originFilter='',term='',opening=false,centering=false,activeId=freshId||null,needsRefresh=false,period=0,looping=true;
 let scrollFrame=0,scrollTarget=null,scrollPosition=0,lastFrame=0,drag=null,suppressClickUntil=0,searchExpanded=false,panelAnimation=null,panelVersion=0;
 const limitScroll=value=>Math.max(0,Math.min(well.scrollHeight-well.clientHeight,value));
 function paint(element,{enter=true,delay=0,duration=600}={}){
  if(!element||reduced())return Promise.resolve();
  const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),defs=document.createElementNS(ns,'defs'),mask=document.createElementNS(ns,'mask'),brush=document.createElementNS(ns,'path'),id=`mail-paint-${++mailBrushId}`;
  svg.setAttribute('width','0');svg.setAttribute('height','0');svg.setAttribute('aria-hidden','true');
  for(const [key,value] of Object.entries({id,maskUnits:'objectBoundingBox',maskContentUnits:'objectBoundingBox',x:'-.3',y:'-.2',width:'1.7',height:'1.6'}))mask.setAttribute(key,value);
  const rows=Array.from({length:10},(_,index)=>{const y=-.08+index*.15,left=-.25,right=1.4;return `${index?'L':'M'}${index%2?right:left} ${y}L${index%2?left:right} ${y+.012}`;});
  for(const [key,value] of Object.entries({d:rows.join(''),fill:'none',stroke:'white','stroke-width':'.18','stroke-linecap':'round',pathLength:'1','stroke-dasharray':'1 1','stroke-dashoffset':enter?'1':'0'}))brush.setAttribute(key,value);
  mask.append(brush);defs.append(mask);svg.append(defs);root.append(svg);
  const previousMask=element.style.maskImage,previousVisibility=element.style.visibility;
  element.style.maskImage=`url("#${id}")`;
  const animation=brush.animate([{strokeDashoffset:enter?1:0},{strokeDashoffset:enter?0:1}],{duration,delay,easing:'linear',fill:'both'});
  animations.add(animation);
  return animation.finished.then(()=>{element.style.visibility=enter?previousVisibility:'hidden';}).catch(()=>{}).finally(()=>{element.style.maskImage=previousMask;svg.remove();animation.cancel();animations.delete(animation);});
 }
 function stopGlide(){cancelAnimationFrame(scrollFrame);scrollFrame=0;scrollTarget=null;lastFrame=0;}
 function recycle(){
  if(opening||centering||!period)return;
  let shift=0,position=well.scrollTop;
  while(position<period*(centerCycle-.75)){position+=period;shift+=period;}
  while(position>period*(centerCycle+.75)){position-=period;shift-=period;}
  if(!shift)return;
  well.scrollTop=position;if(scrollTarget!==null){scrollTarget+=shift;scrollPosition+=shift;}if(drag)drag.scroll+=shift;
 }
 function glide(now){
  if(signal.aborted||opening||searchExpanded){stopGlide();return;}
  const dt=lastFrame?Math.min(40,now-lastFrame):16;lastFrame=now;
  scrollTarget=limitScroll(scrollTarget);const distance=scrollTarget-scrollPosition;
  scrollPosition+=distance*(1-Math.exp(-dt/105));well.scrollTop=scrollPosition;recycle();
  if(Math.abs(distance)<.7){well.scrollTop=scrollTarget;recycle();stopGlide();return;}
  scrollFrame=requestAnimationFrame(glide);
 }
 function glideTo(target){scrollTarget=limitScroll(target);if(!scrollFrame){scrollPosition=well.scrollTop;lastFrame=0;scrollFrame=requestAnimationFrame(glide);}}
 function markup(letter){
  const plant=P[letter.plantId];
  return `<span class="garden-letter"><img class="garden-botanical" src="./assets/${plant.art.replace(/\.webp$/,'-preview.webp')}" decoding="async" alt="" aria-hidden="true" draggable="false"><span class="garden-envelope-back" aria-hidden="true"></span><span class="garden-envelope-flap" aria-hidden="true"></span><span class="garden-letter-paper"><span class="garden-paper-brand">下一枝 <small>NEXT BRANCH</small></span><span class="garden-letter-topic">${plant.name} · ${esc(letter.category)}<small>${esc(letter.date)}</small></span><span class="garden-salutation">亲爱的枝友：</span><strong class="garden-letter-subject">${esc(envelopeTitle(letter.title))}</strong><span class="garden-letter-foot">一封寄给枝友的信 <small>枝条手记</small></span></span><span class="garden-envelope-pocket" aria-hidden="true"><img src="./assets/letter-pocket-paper.webp" decoding="async" alt="" draggable="false"></span><span class="garden-envelope-address">致，每一位枝友<span>${letter.replies?.length?`${letter.replies.length} 封回信`:'等一封回信'}</span></span></span>`;
 }
 function markActive(id,button){activeId=id;const matches=[...stack.querySelectorAll(`[data-id="${id}"]`)],distance=b=>Math.abs(b.getBoundingClientRect().top+b.offsetHeight/2-innerHeight/2),selected=button||matches.sort((a,b)=>distance(a)-distance(b))[0];stack.querySelectorAll('.mailbox-letter').forEach(b=>b.setAttribute('aria-current',String(b===selected)));}
 function measurePeriod(){
  if(!items.length)return 0;stack.style.gap='';const button=stack.querySelector('.mailbox-letter'),h=stack.children[0].getBoundingClientRect().height,gap=parseFloat(getComputedStyle(stack).rowGap);stack.style.paddingTop=`${Math.max(126,envelopeTop(button))}px`;
  // Keep each repeat on whole pixels so the recycling seam cannot drift.
  stack.style.gap=`${Math.ceil(h+gap)-h}px`;
  return stack.children[items.length].getBoundingClientRect().top-stack.children[0].getBoundingClientRect().top;
 }
 function load(keep=true){
  stopGlide();drag=null;
  const previousTop=well.scrollTop,wasLooping=looping,phase=keep&&period?previousTop%period:0;
  items=getLetters().filter(l=>P[l.plantId]&&(!plantFilter||l.plantId===plantFilter)&&(statusFilter==='waiting'?!l.replies?.length:statusFilter==='answered'?Boolean(l.replies?.length):true)&&(!originFilter||l.mine===true||/^L-\d+$/.test(l.id))&&(!term||`${P[l.plantId].name} ${l.title} ${l.text}`.toLocaleLowerCase().includes(term.toLocaleLowerCase())));
  if(freshId&&freshAnchorId){const index=items.findIndex(letter=>letter.id===freshId);if(index>=0&&items.some(letter=>letter.id===freshAnchorId)){const [fresh]=items.splice(index,1);items.splice(items.findIndex(letter=>letter.id===freshAnchorId),0,fresh);}}
  looping=!plantFilter&&!statusFilter&&!originFilter&&!term;
  // The complete archive repeats; a chosen plant, state, or search result is finite.
  const nodes=Array.from({length:looping?cycleCount:1},()=>items.map((letter,index)=>{const item=document.createElement('article');item.className=`mailbox-entry${plants.findIndex(p=>p.id===letter.plantId)%2?' is-flower-right':''}`;item.setAttribute('role','listitem');item.setAttribute('aria-posinset',index+1);item.setAttribute('aria-setsize',items.length);const button=document.createElement('button');button.type='button';button.className='mailbox-letter';button.dataset.id=letter.id;button.setAttribute('aria-label',`抽出查看：${letter.title}`);button.innerHTML=markup(letter);const frame=document.createElement('div');frame.className='mailbox-ink-frame';frame.append(button);item.append(frame);if(letter.mine===true||/^L-\d+$/.test(letter.id)){const remove=document.createElement('button');remove.type='button';remove.className='mailbox-delete';remove.dataset.deleteLetter=letter.id;remove.setAttribute('aria-label',`删除我写的信：${letter.title}`);remove.innerHTML=[...'删除这封信'].map(character=>`<span class="mailbox-delete-char" aria-hidden="true">${character}</span>`).join('')+'<span class="mailbox-delete-rule" aria-hidden="true"></span>';item.append(remove);}return item;})).flat();stack.replaceChildren(...nodes);
  if(looping){period=measurePeriod();well.scrollTop=period*centerCycle+phase;}else{period=0;stack.style.gap='';stack.style.paddingTop='';well.scrollTop=keep&&!wasLooping?previousTop:0;}
  if(freshId){const index=items.findIndex(letter=>letter.id===freshId),target=index<0?null:stack.children[(looping?centerCycle*items.length:0)+index]?.querySelector('.mailbox-letter');if(target){const box=target.getBoundingClientRect(),view=well.getBoundingClientRect();well.scrollTop+=(box.top+box.bottom-view.top-view.bottom)/2+12;}}
  root.classList.toggle('is-filtered',!looping);markActive(items.some(l=>l.id===activeId)?activeId:items[0]?.id);root.querySelector('.mailbox-empty').hidden=Boolean(items.length);
  root.querySelectorAll('[data-mail-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mailFilter===statusFilter)));
  root.querySelectorAll('[data-mail-origin]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mailOrigin===originFilter)));
  root.querySelectorAll('[data-mail-plant]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mailPlant===plantFilter)));
  root.querySelector('.mailbox-filter-done span').textContent=items.length;
  find.classList.toggle('has-filter',Boolean(plantFilter||statusFilter||originFilter));root.querySelector('.mailbox-live').textContent=`${items.length} 封来信`;
 }
 function searchOpen(value,focus=true){
  stopGlide();drag=null;searchExpanded=value;const version=++panelVersion;
  const closed='inset(100% 0px 0px round 22px)',opened='inset(0px 0px 0px round 22px)',style=getComputedStyle(searchPanel),from=searchPanel.hidden?{clipPath:closed,translate:'0 14px'}:{clipPath:style.clipPath==='none'?opened:style.clipPath,translate:style.translate};
  if(panelAnimation){animations.delete(panelAnimation);panelAnimation.cancel();panelAnimation=null;}
  searchPanel.hidden=false;searchPanel.inert=!value;find.setAttribute('aria-expanded',String(value));root.classList.toggle('is-searching',value);
  if(focus)(value?searchPanel.querySelector('[data-mail-plant][aria-pressed="true"]'):find)?.focus({preventScroll:true});
  if(reduced()){searchPanel.hidden=!value;return;}
  const animation=searchPanel.animate([from,{clipPath:value?opened:closed,translate:value?'0 0':'0 14px'}],{duration:value?380:250,easing:'cubic-bezier(.22,.72,.24,1)',fill:'both'});panelAnimation=animation;animations.add(animation);
  animation.finished.then(()=>{if(version!==panelVersion||signal.aborted)return;searchPanel.hidden=!value;animation.cancel();animations.delete(animation);panelAnimation=null;}).catch(()=>{});
 }
 function resizeLoop(){
  if(opening||!items.length||!looping)return;stopGlide();const next=measurePeriod();
  if(period&&Math.abs(next-period)>.5){const cycle=Math.floor(well.scrollTop/period),phase=well.scrollTop%period;well.scrollTop=next*cycle+phase/period*next;}period=next;
 }
 const resizeObserver=new ResizeObserver(resizeLoop);resizeObserver.observe(well);
 const envelopeTop=button=>Math.max(118,(innerHeight-button.offsetHeight)/2-12);
 async function centerLetter(button){
  const view=well.getBoundingClientRect(),box=button.getBoundingClientRect();
  // The gallery deliberately rests each envelope 12px above the viewport's
  // mathematical centre. Do not scroll it again when it is already at rest.
  const delta=(box.top+box.bottom-view.top-view.bottom)/2+12;
  if(Math.abs(delta)>3&&!reduced()){
   const from=well.scrollTop;
   await new Promise(resolve=>{
    let started=0;
    const step=now=>{
     if(signal.aborted){resolve();return;}
     started ||=now;const t=Math.min(1,(now-started)/540),ease=1-(1-t)**3;
     well.scrollTop=from+delta*ease;
     if(t<1)requestAnimationFrame(step);else resolve();
    };
    requestAnimationFrame(step);
   });
  }
  centering=false;
  const matches=[...stack.querySelectorAll('.mailbox-letter')].filter(candidate=>candidate.dataset.id===button.dataset.id);
  return matches.sort((a,b)=>Math.abs(a.getBoundingClientRect().top+a.getBoundingClientRect().height/2-(innerHeight/2-12))-Math.abs(b.getBoundingClientRect().top+b.getBoundingClientRect().height/2-(innerHeight/2-12)))[0]||button;
 }
 async function open(button){
  if(opening||centering||!items.length)return;stopGlide();drag=null;centering=true;root.classList.add('is-reading');
  button=await centerLetter(button);if(signal.aborted)return;opening=true;markActive(button.dataset.id,button);
  const rect=button.getBoundingClientRect(),id=button.dataset.id,face=button.querySelector('.garden-letter');
  const reset=()=>{face?.querySelector('.garden-letter-paper')?.style.removeProperty('visibility');stage?.remove();stage=null;if(signal.aborted)return;opening=false;animations.forEach(a=>a.cancel());animations.clear();root.classList.remove('is-reading');if(needsRefresh){needsRefresh=false;load();}stack.querySelector('[aria-current="true"]')?.focus({preventScroll:true});};
  const move=async(el,frames,duration)=>{if(reduced())return;const a=el.animate(frames,{duration,easing:'linear',fill:'both'});animations.add(a);await a.finished;el.style.transform=frames.at(-1).transform;a.cancel();animations.delete(a);};
  try{
   stage=document.createElement('div');stage.className='mail-opening-stage';stage.setAttribute('aria-hidden','true');stage.append(face.cloneNode(true));
   const w=rect.width,h=rect.height,x=rect.x,y=rect.y;
   Object.assign(stage.style,{width:`${w}px`,height:`${h}px`,left:`${x}px`,top:`${y}px`});document.body.append(stage);
   const slip=stage.querySelector('.garden-letter-paper');
   const tuckedPaper=slip.getBoundingClientRect();
   face.querySelector('.garden-letter-paper').style.visibility='hidden';
   const readerWidth=Math.min(620,innerWidth-32);
   const navLabel=document.querySelector('.main-nav .nav-label')?.getBoundingClientRect();
   const readerLeft=(innerWidth-readerWidth)/2,readerTop=navLabel?Math.round(navLabel.top+navLabel.bottom):84;
   const grow=readerWidth/tuckedPaper.width;
   const dx=readerLeft-tuckedPaper.left-(tuckedPaper.width-readerWidth)/2;
   const dy=readerTop-tuckedPaper.top-(tuckedPaper.height-tuckedPaper.height*grow)/2;
   const pocket=stage.querySelector('.garden-envelope-pocket'),address=stage.querySelector('.garden-envelope-address');
   const preScale=Math.min(1.1,grow);
   const liftY=Math.min(0,pocket.getBoundingClientRect().top-tuckedPaper.bottom-12-tuckedPaper.height*(preScale-1)/2);
   const frame=(x,y,scale)=>({transform:`translate3d(${x}px,${y}px,0) scale(${scale})`});
   const liftFrames=Array.from({length:19},(_,index)=>{
    const t=index/18,motion=t*t*(2-t),scaleTime=Math.max(0,(t-.2)/.8),scaleEase=scaleTime*scaleTime*(2-scaleTime);
    return {...frame(0,liftY*motion,1+(preScale-1)*scaleEase),offset:t};
   });
   const expandFrames=Array.from({length:27},(_,index)=>{
    const t=index/26,motion=t+t*t-t*t*t,arcLift=Math.sin(Math.PI*motion)*Math.min(22,Math.abs(dy-liftY)*.1);
    return {...frame(dx*motion,liftY+(dy-liftY)*motion-arcLift,preScale+(grow-preScale)*motion),offset:t};
   });
   const retractFrames=Array.from({length:27},(_,index)=>{
    const t=index/26,motion=t+.2*t*(1-t),remaining=1-motion,arcLift=Math.sin(Math.PI*remaining)*Math.min(22,Math.abs(dy-liftY)*.1);
    return {...frame(dx*remaining,liftY+(dy-liftY)*remaining-arcLift,grow+(preScale-grow)*motion),offset:t};
   });
   const reverse=frames=>frames.slice().reverse().map((item,index)=>({...item,offset:index/(frames.length-1)}));
   const extractedTransform=expandFrames.at(-1).transform;
   await move(slip,liftFrames,340);
   pocket.style.visibility='hidden';address.style.visibility='hidden';
   await move(slip,expandFrames,510);slip.style.transform=extractedTransform;
   const paper=slip.getBoundingClientRect();
   onReader({kind:'mailbox',readerTop,paper,paperElement:slip,tuckedPaper,envelope:rect,paperMarkup:slip.innerHTML,extracted:()=>{slip.style.visibility='hidden';},revealPaper:()=>{slip.style.visibility='';},returnPaper:async()=>{
    await move(slip,retractFrames,510);
    pocket.style.visibility='';address.style.visibility='';
    await move(slip,reverse(liftFrames),340);slip.style.transform='';
   }},reset);
   if(!signal.aborted)onOpen(id);
  }catch{if(!signal.aborted&&stage){onReader({kind:'mailbox'},reset);onOpen(id);}else reset();}
 }
 root.querySelector('.mailbox-plants').innerHTML=`<button data-mail-plant="" aria-pressed="true">全部植物</button>${plants.map(p=>`<button data-mail-plant="${p.id}" aria-pressed="false" style="--filter-color:${p.bg};--filter-ink:${p.ink}">${p.name}</button>`).join('')}`;
 async function deleteOwnLetter(button){
  if(opening||centering||!onDelete)return;
  const id=button.dataset.deleteLetter;
  opening=true;stopGlide();
  try{
   if(!await onDelete(id))return;
   const copies=[...stack.querySelectorAll('.mailbox-entry')].filter(entry=>entry.querySelector('.mailbox-letter')?.dataset.id===id);
   if(!reduced()){
    const visible=copies.filter(entry=>{const box=entry.getBoundingClientRect();return box.bottom>-40&&box.top<innerHeight+40;});
    const lineMotions=copies.map(entry=>{const rule=entry.querySelector('.mailbox-delete-rule'),button=entry.querySelector('.mailbox-delete'),from=button.matches(':hover')?getComputedStyle(rule).clipPath:'inset(0)';entry.classList.add('is-deleting');const motion=rule.animate([{clipPath:from},{clipPath:'inset(0 100% 0 0)'}],{duration:320,easing:'cubic-bezier(.35,0,.65,1)',fill:'both'});animations.add(motion);return motion;});
    await Promise.allSettled([...lineMotions.map(motion=>motion.finished),...visible.flatMap(entry=>[
     paint(entry.querySelector('.mailbox-ink-frame'),{enter:false,duration:620}),
     paint(entry.querySelector('.garden-botanical'),{enter:false,duration:570}),
     ...[...entry.querySelectorAll('.mailbox-delete-char')].reverse().map((character,index)=>paint(character,{enter:false,delay:index*45,duration:280}))
    ])]);
    lineMotions.forEach(motion=>{motion.cancel();animations.delete(motion);});
   }
   if(signal.aborted)return;
   const remaining=[...stack.children].filter(entry=>!copies.includes(entry));
   const before=new Map(remaining.map(entry=>[entry,entry.getBoundingClientRect().top]));
   const oldPeriod=period,oldScroll=well.scrollTop;
   copies.forEach(entry=>entry.remove());
   items=items.filter(letter=>letter.id!==id);
   if(items.length&&looping){period=measurePeriod();well.scrollTop=oldScroll+(period-oldPeriod)*centerCycle;}
   else{period=0;if(!items.length){looping=false;stack.style.gap='';stack.style.paddingTop='';}well.scrollTop=oldScroll;}
   remaining.forEach((entry,index)=>{entry.setAttribute('aria-posinset',index%items.length+1);entry.setAttribute('aria-setsize',items.length);});
   root.classList.toggle('is-filtered',!looping);
   root.querySelector('.mailbox-empty').hidden=Boolean(items.length);
   root.querySelector('.mailbox-filter-done span').textContent=items.length;
   const nearest=[...stack.querySelectorAll('.mailbox-letter')].sort((a,b)=>Math.abs(a.getBoundingClientRect().top+a.offsetHeight/2-innerHeight/2)-Math.abs(b.getBoundingClientRect().top+b.offsetHeight/2-innerHeight/2))[0];
   markActive(nearest?.dataset.id,nearest);
   if(!reduced()){
    const moves=remaining.flatMap(entry=>{const oldTop=before.get(entry),box=entry.getBoundingClientRect(),shift=oldTop-box.top;if(Math.abs(shift)<.5||box.bottom<-100||box.top>innerHeight+100)return [];const motion=entry.animate([{transform:`translateY(${shift}px)`},{transform:'translateY(0)'}],{duration:620,easing:'cubic-bezier(.2,.76,.22,1)',fill:'both'});animations.add(motion);return [motion];});
    await Promise.allSettled(moves.map(motion=>motion.finished));
    moves.forEach(motion=>{motion.cancel();animations.delete(motion);});
   }
   if(!signal.aborted)root.querySelector('.mailbox-live').textContent='已删除这封信';
  }catch{if(!signal.aborted)root.querySelector('.mailbox-live').textContent='删除失败，请稍后再试';}
  finally{opening=false;}
 }
 function revealFresh(){
  const current=stack.querySelector('.mailbox-letter[aria-current="true"]')?.closest('.mailbox-entry');
  if(!current||reduced())return;
  opening=true;current.style.pointerEvents='none';
  const center=current.getBoundingClientRect(),middle=(center.top+center.bottom)/2,following=current.nextElementSibling;
  const matchedAnchor=following?.querySelector('.mailbox-letter')?.dataset.id===freshAnchorId;
  const gap=matchedAnchor?following.getBoundingClientRect().top-center.top:Math.min(center.height*.65,innerHeight*.34);
  const moving=[...stack.children].filter(entry=>entry!==current&&entry.getBoundingClientRect().bottom>-center.height&&entry.getBoundingClientRect().top<innerHeight+center.height);
  const slides=moving.flatMap(entry=>{const box=entry.getBoundingClientRect(),isBelow=(box.top+box.bottom)/2>middle;if(matchedAnchor&&!isBelow)return [];const shift=matchedAnchor?-gap:isBelow?-gap:gap,motion=entry.animate([{transform:`translateY(${shift}px)`},{transform:'translateY(0)'}],{duration:650,delay:80,easing:'cubic-bezier(.2,.76,.22,1)',fill:'both'});animations.add(motion);return [motion];});
  const reveal=[
   paint(current.querySelector('.mailbox-ink-frame'),{delay:760,duration:960}),
   paint(current.querySelector('.garden-botanical'),{delay:760,duration:960}),
   ...[...current.querySelectorAll('.mailbox-delete-char')].map((character,index)=>paint(character,{delay:1780+index*75,duration:330}))
  ];
  Promise.allSettled([...slides.map(motion=>motion.finished),...reveal]).then(()=>{
   slides.forEach(motion=>{motion.cancel();animations.delete(motion);});
   if(signal.aborted)return;
   current.style.pointerEvents='';opening=false;
  });
 }
 find.addEventListener('click',()=>searchOpen(!searchExpanded),{signal});root.querySelector('.mailbox-search-close').addEventListener('click',()=>searchOpen(false),{signal});
 root.querySelector('.mailbox-filter-done').addEventListener('click',()=>searchOpen(false),{signal});
 query.addEventListener('input',event=>{term=event.target.value.trim();load(false);},{signal});query.addEventListener('focus',()=>{if(!searchPanel.hidden)searchOpen(false,false);},{signal});
 root.addEventListener('click',async event=>{
  const deleteButton=event.target.closest('[data-delete-letter]');if(deleteButton){await deleteOwnLetter(deleteButton);return;}
  const p=event.target.closest('[data-mail-plant]');if(p){plantFilter=p.dataset.mailPlant;load(false);return;}
  const f=event.target.closest('[data-mail-filter]');if(f){statusFilter=f.dataset.mailFilter;load(false);return;}
  const o=event.target.closest('[data-mail-origin]');if(o){originFilter=o.dataset.mailOrigin;load(false);return;}
  const action=event.target.closest('[data-mail-action]')?.dataset.mailAction;
  if(action==='write'){if(!opening)onWrite(plantFilter||undefined);return;}
  if(action==='reset'){term='';plantFilter='';statusFilter='';originFilter='';query.value='';load(false);return;}
  const button=event.target.closest('.mailbox-letter');if(button&&!opening){if(searchExpanded){searchOpen(false);return;}open(button);}
 },{signal});
 well.addEventListener('scroll',recycle,{signal,passive:true});
 well.addEventListener('wheel',event=>{
  if(event.ctrlKey)return;if(opening||searchExpanded){event.preventDefault();return;}if(reduced())return;
  if(Math.abs(event.deltaY)<Math.abs(event.deltaX))return;event.preventDefault();drag=null;
  const delta=event.deltaY*(event.deltaMode===1?20:event.deltaMode===2?well.clientHeight:1);
  glideTo((scrollTarget??well.scrollTop)+delta);
 },{signal,passive:false});
 well.addEventListener('pointerdown',event=>{
  stopGlide();drag=null;if(event.target.closest('.mailbox-delete')||event.pointerType==='touch'||event.button!==0||opening||searchExpanded)return;
  drag={pointer:event.pointerId,y:event.clientY,scroll:well.scrollTop,lastY:event.clientY,time:performance.now(),velocity:0,moved:false};
 },{signal});
 well.addEventListener('pointerleave',()=>{if(drag&&!drag.moved)drag=null;},{signal});
 well.addEventListener('pointermove',event=>{
  if(!drag||drag.pointer!==event.pointerId)return;
  if(!drag.moved&&Math.abs(event.clientY-drag.y)<7)return;
  if(!drag.moved){drag.moved=true;well.setPointerCapture(event.pointerId);}
  event.preventDefault();const now=performance.now(),dt=Math.max(8,now-drag.time);
  drag.velocity=drag.velocity*.35+(drag.lastY-event.clientY)/dt*.65;drag.time=now;drag.lastY=event.clientY;
  well.scrollTop=limitScroll(drag.scroll+drag.y-event.clientY);recycle();
 },{signal});
 function releaseDrag(event){
  if(!drag||event.pointerId!==drag.pointer)return;const current=drag;drag=null;
  if(well.hasPointerCapture(event.pointerId))well.releasePointerCapture(event.pointerId);
  if(!current.moved)return;suppressClickUntil=performance.now()+300;
  if(event.type!=='pointercancel'&&!reduced()&&performance.now()-current.time<100)glideTo(well.scrollTop+Math.max(-2.5,Math.min(2.5,current.velocity))*190);
 }
 well.addEventListener('pointerup',releaseDrag,{signal});well.addEventListener('pointercancel',releaseDrag,{signal});
 well.addEventListener('click',event=>{if(performance.now()<suppressClickUntil){event.preventDefault();event.stopImmediatePropagation();}},{signal,capture:true});
 well.addEventListener('keydown',event=>{if(opening||!items.length||!['ArrowUp','ArrowDown','PageUp','PageDown','Home','End'].includes(event.key))return;stopGlide();event.preventDefault();const buttons=[...stack.querySelectorAll('.mailbox-letter')],current=Math.max(0,buttons.indexOf(document.activeElement)),index=event.key==='Home'?0:event.key==='End'?items.length-1:Math.max(0,Math.min(buttons.length-1,current+(['ArrowUp','PageUp'].includes(event.key)?-1:1))),b=buttons[index];markActive(b.dataset.id,b);b.focus({preventScroll:true});b.scrollIntoView({block:'center',behavior:reduced()?'instant':'smooth'});},{signal});
 root.addEventListener('keydown',event=>{if(event.key==='Escape'&&!searchPanel.hidden){event.preventDefault();event.stopPropagation();searchOpen(false);}},{signal});
 matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',()=>{stopGlide();animations.forEach(a=>a.cancel());animations.clear();panelVersion++;panelAnimation=null;searchPanel.hidden=!searchExpanded;},{signal});
 load(false);if(freshId)revealFresh();
 return {refresh(){if(opening)needsRefresh=true;else load();},dispose(){controller.abort();stopGlide();resizeObserver.disconnect();animations.forEach(a=>a.cancel());animations.clear();stage?.remove();}};
}
