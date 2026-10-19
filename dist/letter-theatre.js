const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const searchIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg>';

export function renderLetterTheatre(){
 return `<main class="page letters-page post-office letter-mailbox" aria-label="枝友来信"><h1 class="office-live">枝友来信</h1>
 <section class="mailbox-well" aria-label="上下浏览来信，点按抽出信纸"><div class="mailbox-stack" role="list"></div><div class="mailbox-empty" hidden><p>还没有找到这封信</p><button data-mail-action="reset">看看全部来信</button><button data-mail-action="write">寄出一封信 ↗</button></div></section>
 <div class="mailbox-toolbar" role="search"><label class="mailbox-query">${searchIcon}<input type="search" aria-label="搜索植物或来信" placeholder="找植物，找来信" autocomplete="off"></label><button class="mailbox-find" aria-label="筛选来信" aria-expanded="false" aria-controls="mailbox-search"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h4m4 0h8M4 17h9m4 0h3"/><circle cx="10" cy="7" r="2"/><circle cx="15" cy="17" r="2"/></svg><i aria-hidden="true"></i></button><button class="mailbox-write" data-mail-action="write" aria-label="寄出一封信"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 16 11-11 3 3-11 11-4 1 1-4ZM14 7l3 3"/></svg></button></div>
 <section class="mailbox-search" id="mailbox-search" aria-label="筛选来信" hidden><header><h2>找一封来信</h2><button class="mailbox-search-close" aria-label="收起筛选">×</button></header><div class="mailbox-filters"><fieldset><legend>关于哪一枝</legend><div class="mailbox-plants" role="group" aria-label="按植物筛选来信"></div></fieldset><fieldset><legend>回信状态</legend><div class="mailbox-status" role="group" aria-label="回信状态"><button data-mail-filter="" aria-pressed="true">全部</button><button data-mail-filter="answered" aria-pressed="false">有回信</button><button data-mail-filter="waiting" aria-pressed="false">待回信</button></div></fieldset></div><footer><button class="mailbox-reset" data-mail-action="reset">清除条件</button><button class="mailbox-filter-done">查看 <span></span> 封来信 ↗</button></footer></section><span class="office-live mailbox-live" role="status" aria-live="polite"></span></main>`;
}

export function mountLetterTheatre({plants,getLetters,onOpen,onWrite,filter,freshId,onReader}){
 const root=document.querySelector('.letter-mailbox');if(!root)return;
 const controller=new AbortController(),signal=controller.signal,P=Object.fromEntries(plants.map(p=>[p.id,p]));
 const well=root.querySelector('.mailbox-well'),stack=root.querySelector('.mailbox-stack'),searchPanel=root.querySelector('.mailbox-search'),find=root.querySelector('.mailbox-find'),query=root.querySelector('.mailbox-query input');
 const animations=new Set();let stage=null,items=[],plantFilter=filter||'',statusFilter='',term='',opening=false,activeId=freshId||null,needsRefresh=false,period=0,looping=true;
 let scrollFrame=0,scrollTarget=null,scrollPosition=0,lastFrame=0,drag=null,suppressClickUntil=0,searchExpanded=false,panelAnimation=null,panelVersion=0;
 const limitScroll=value=>Math.max(0,Math.min(well.scrollHeight-well.clientHeight,value));
 function stopGlide(){cancelAnimationFrame(scrollFrame);scrollFrame=0;scrollTarget=null;lastFrame=0;}
 function recycle(){
  if(opening||!period)return;
  let shift=0,position=well.scrollTop;
  while(position<period*1.25){position+=period;shift+=period;}
  while(position>period*3.75){position-=period;shift-=period;}
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
  return `<span class="garden-letter"><img class="garden-botanical" src="./assets/${plant.art}" alt="" aria-hidden="true" draggable="false"><span class="garden-envelope-back" aria-hidden="true"></span><span class="garden-envelope-flap" aria-hidden="true"></span><span class="garden-letter-paper"><span class="garden-letter-topic">${plant.name} · ${esc(letter.category)}</span><span class="garden-salutation">亲爱的枝友：</span><strong class="garden-letter-subject">${esc(letter.title)}</strong></span><span class="garden-envelope-pocket" aria-hidden="true"><img src="./assets/letter-pocket-paper.png" alt="" draggable="false"></span><span class="garden-envelope-address">致，每一位枝友<span>${letter.replies?.length?`${letter.replies.length} 封回信`:'等一封回信'}</span></span></span>`;
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
  items=getLetters().filter(l=>P[l.plantId]&&(!plantFilter||l.plantId===plantFilter)&&(statusFilter==='waiting'?!l.replies?.length:statusFilter==='answered'?Boolean(l.replies?.length):true)&&(!term||`${P[l.plantId].name} ${l.title} ${l.text}`.toLocaleLowerCase().includes(term.toLocaleLowerCase())));
  looping=!plantFilter&&!statusFilter&&!term;
  // The complete archive repeats; a chosen plant, state, or search result is finite.
  const nodes=Array.from({length:looping?5:1},()=>items.map((letter,index)=>{const item=document.createElement('article');item.className=`mailbox-entry${plants.findIndex(p=>p.id===letter.plantId)%2?' is-flower-right':''}`;item.setAttribute('role','listitem');item.setAttribute('aria-posinset',index+1);item.setAttribute('aria-setsize',items.length);const button=document.createElement('button');button.type='button';button.className='mailbox-letter';button.dataset.id=letter.id;button.setAttribute('aria-label',`抽出查看：${letter.title}`);button.innerHTML=markup(letter);const frame=document.createElement('div');frame.className='mailbox-ink-frame';frame.append(button);item.append(frame);return item;})).flat();stack.replaceChildren(...nodes);
  if(looping){period=measurePeriod();well.scrollTop=period*2+phase;}else{period=0;stack.style.gap='';stack.style.paddingTop='';well.scrollTop=keep&&!wasLooping?previousTop:0;}
  root.classList.toggle('is-filtered',!looping);markActive(items.some(l=>l.id===activeId)?activeId:items[0]?.id);root.querySelector('.mailbox-empty').hidden=Boolean(items.length);
  root.querySelectorAll('[data-mail-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mailFilter===statusFilter)));
  root.querySelectorAll('[data-mail-plant]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mailPlant===plantFilter)));
  root.querySelector('.mailbox-filter-done span').textContent=items.length;
  find.classList.toggle('has-filter',Boolean(plantFilter||statusFilter));root.querySelector('.mailbox-live').textContent=`${items.length} 封来信`;
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
 async function open(button){
  if(opening||!items.length)return;stopGlide();drag=null;opening=true;markActive(button.dataset.id,button);root.classList.add('is-reading');
  const rect=button.getBoundingClientRect(),id=button.dataset.id;
  const reset=()=>{stage?.remove();stage=null;if(signal.aborted)return;opening=false;animations.forEach(a=>a.cancel());animations.clear();root.classList.remove('is-reading');button.style.visibility='';if(needsRefresh){needsRefresh=false;load();}stack.querySelector('[aria-current="true"]')?.focus({preventScroll:true});};
  const move=async(el,frames,duration)=>{if(reduced())return;const a=el.animate(frames,{duration,easing:'cubic-bezier(.22,.76,.24,1)',fill:'both'});animations.add(a);await a.finished;};
  try{
   stage=document.createElement('div');stage.className='mail-opening-stage';stage.setAttribute('aria-hidden','true');stage.innerHTML=button.innerHTML;
   const flowerStyle=getComputedStyle(button.querySelector('.garden-botanical')),flower=stage.querySelector('.garden-botanical');
   for(const property of ['left','right','top','width','height'])flower.style[property]=flowerStyle[property];
   const w=button.offsetWidth,h=button.offsetHeight,x=rect.x,y=rect.y;
   Object.assign(stage.style,{width:`${w}px`,height:`${h}px`,left:`${x}px`,top:`${y}px`});document.body.append(stage);button.style.visibility='hidden';
   const slip=stage.querySelector('.garden-letter-paper');
   const tuckedPaper=slip.getBoundingClientRect();
   const grow=Math.min(1.2,rect.width/slip.getBoundingClientRect().width);
   const extractedTransform=`translateY(-65%) scale(${grow})`;
   await move(slip,[{transform:'translateY(0) scale(1)'},{transform:extractedTransform}],760);slip.style.transform=extractedTransform;
   const paper=slip.getBoundingClientRect();
   onReader({kind:'mailbox',paper,paperElement:slip,tuckedPaper,envelope:rect,paperMarkup:slip.innerHTML,pocketMarkup:stage.querySelector('.garden-envelope-pocket').outerHTML,extracted:()=>{slip.style.visibility='hidden';},revealPaper:()=>{slip.style.visibility='';},returnPaper:async()=>{
    await move(slip,[{transform:extractedTransform},{transform:'translateY(0) scale(1)'}],680);slip.style.transform='';
   }},reset);
   if(!signal.aborted)onOpen(id);
  }catch{if(!signal.aborted&&stage){onReader({kind:'mailbox'},reset);onOpen(id);}else reset();}
 }
 root.querySelector('.mailbox-plants').innerHTML=`<button data-mail-plant="" aria-pressed="true">全部植物</button>${plants.map(p=>`<button data-mail-plant="${p.id}" aria-pressed="false" style="--filter-color:${p.bg};--filter-ink:${p.ink}">${p.name}</button>`).join('')}`;
 find.addEventListener('click',()=>searchOpen(!searchExpanded),{signal});root.querySelector('.mailbox-search-close').addEventListener('click',()=>searchOpen(false),{signal});
 root.querySelector('.mailbox-filter-done').addEventListener('click',()=>searchOpen(false),{signal});
 query.addEventListener('input',event=>{term=event.target.value.trim();load(false);},{signal});query.addEventListener('focus',()=>{if(!searchPanel.hidden)searchOpen(false,false);},{signal});
 root.addEventListener('click',event=>{
  const p=event.target.closest('[data-mail-plant]');if(p){plantFilter=p.dataset.mailPlant;load(false);return;}
  const f=event.target.closest('[data-mail-filter]');if(f){statusFilter=f.dataset.mailFilter;load(false);return;}
  const action=event.target.closest('[data-mail-action]')?.dataset.mailAction;
  if(action==='write'){if(!opening)onWrite(plantFilter||undefined);return;}
  if(action==='reset'){term='';plantFilter='';statusFilter='';query.value='';load(false);return;}
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
  stopGlide();drag=null;if(event.pointerType==='touch'||event.button!==0||opening||searchExpanded)return;
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
 load(false);if(freshId)requestAnimationFrame(()=>{if(!signal.aborted)stack.querySelector('[aria-current="true"]')?.scrollIntoView({block:'center',behavior:'instant'});});
 return {refresh(){if(opening)needsRefresh=true;else load();},dispose(){controller.abort();stopGlide();resizeObserver.disconnect();animations.forEach(a=>a.cancel());animations.clear();stage?.remove();}};
}
