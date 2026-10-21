const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
// The press owns the feed, sign, retract and tear sequence.
export function mountClaimPress(page,entrance='feed'){
 const controller=new AbortController(),animations=new Set(),pending=new Set(),elements=new Set();
 const sheet=page.querySelector('.dispatch-paper'),machine=page.querySelector('.claim-machine'),lip=page.querySelector('.claim-output-lip'),status=page.querySelector('.claim-machine-status'),feed=page.querySelector('.claim-paper-feed'),dispenser=page.querySelector('.claim-dispenser');
 let observer,ready=false,detached=false,leaving=false,scanning=false,exitPromise,scrollFrame=0,scrollReject=null;
 const setState=value=>page.dataset.pressState=value;
 const animate=(target,frames,duration,easing='cubic-bezier(.28,.08,.24,1)',delay=0)=>{const a=target.animate(frames,{duration,easing,delay,fill:'both'});animations.add(a);a.finished.catch(()=>{});return a;};
 async function move(target,frames,duration,easing,delay=0){
  if(reduced()){Object.assign(target.style,Object.fromEntries(Object.entries(frames.at(-1)).filter(([k])=>!['offset','easing'].includes(k))));return;}
  const a=animate(target,frames,duration,easing,delay);await a.finished;if(controller.signal.aborted)throw new Error('Press closed');
  Object.assign(target.style,Object.fromEntries(Object.entries(frames.at(-1)).filter(([k])=>!['offset','easing'].includes(k))));a.cancel();animations.delete(a);
 }
 const reveal=(element,instant=false)=>{if(instant)element.classList.add('claim-static-ink');element.classList.add('is-printed');observer?.unobserve(element);};
 function prepare(element){
  if(element.matches('.claim-ink-ready,.claim-static-ink'))return;
  const rect=element.getBoundingClientRect(),top=rect.top+(['feed','receipt'].includes(entrance)?window.scrollY:0);
  // Anything already inside the first camera frame is printed on the stock.
  // The margin includes the short feed travel and the later tear clearance.
  if(reduced()||top<innerHeight+150){element.classList.add('claim-static-ink');return;}
  const text=element.textContent,readable=document.createElement('span'),ink=document.createElement('span');readable.className='claim-readable';readable.textContent=text;ink.className='claim-ink';ink.setAttribute('aria-hidden','true');
  const units=text.match(/[A-Za-zÀ-ž×\d—-]+|\s+|[^\s]/gu)||[];for(let i=units.length-1;i>0;i--)if(/^[，。！？；：、）》」』”’]/u.test(units[i])){units[i-1]+=units[i];units.splice(i,1);}
  let index=0;units.forEach(unit=>{if(/^\s+$/u.test(unit)){ink.append(document.createTextNode(unit));return;}const word=document.createElement('span');word.className='claim-word';Array.from(unit).forEach(char=>{const glyph=document.createElement('span');glyph.className='claim-glyph';glyph.textContent=char;glyph.style.setProperty('--print-delay',`${Math.min(index++*14,500)}ms`);word.append(glyph);});ink.append(word);});
  element.replaceChildren(readable,ink);element.classList.add('claim-ink-ready');elements.add(element);observer?.observe(element);
 }
 if(!reduced())observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;if(ready)reveal(entry.target);else pending.add(entry.target);}),{threshold:.12,rootMargin:'0px 0px -3% 0px'});
 const refresh=(scope=page)=>scope.querySelectorAll('[data-claim-ink]').forEach(prepare);
 const offscreen=()=>-(dispenser.getBoundingClientRect().top+window.scrollY+machine.offsetHeight+35);
 function finish(){if(controller.signal.aborted||leaving)return;ready=true;sheet.inert=false;page.classList.remove('is-printing','is-machine-entering','is-retracting');page.classList.add('is-issued');status.textContent='请取小票';pending.forEach(el=>reveal(el));pending.clear();setState(detached?'detached':'ready');page.dispatchEvent(new Event('claim:printed'));}
 function scrollToMachine(){
  if(reduced()){window.scrollTo({top:0,behavior:'instant'});return Promise.resolve();}
  if(window.scrollY<3)return Promise.resolve();
  return new Promise((resolve,reject)=>{scrollReject=reject;const from=window.scrollY,start=performance.now(),duration=Math.min(1150,Math.max(650,from*.48));function tick(now){if(controller.signal.aborted){reject(new Error('Press closed'));return;}const t=Math.min(1,(now-start)/duration),p=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;window.scrollTo({top:from*(1-p),behavior:'instant'});if(t<1)scrollFrame=requestAnimationFrame(tick);else{scrollFrame=0;scrollReject=null;resolve();}}scrollFrame=requestAnimationFrame(tick);});
 }
 async function detach(){
  setState('tear');page.classList.add('is-tearing');const padding=parseFloat(getComputedStyle(dispenser).paddingTop),restingPadding=0;sheet.inert=true;
  // Cut the actual paper edge before it leaves the printer. No scene-coloured
  // overlay is needed, so the machine remains visible through the teeth.
  const teeth=Array.from({length:41},(_,i)=>`${i*2.5}% ${i%2?8:0}px`).join(',');
  const lowerTeeth=Array.from({length:41},(_,i)=>`${100-i*2.5}% calc(100% - ${i%2?6:0}px)`).join(',');
  // Keep both torn edges inside the sheet's own clipping path. A separate
  // pseudo-element below the sheet is clipped away once the ticket detaches.
  sheet.style.clipPath=`polygon(${teeth},${lowerTeeth})`;
  // Shrink the feed gap while the press leaves. The paper itself follows one
  // continuous path to its resting place, clear of the chapter navigation.
  const away=offscreen();await Promise.all([move(machine,[{translate:'0 0'},{translate:`0 ${away}px`}],900),move(lip,[{translate:'0 0'},{translate:`0 ${away}px`}],900),move(dispenser,[{paddingTop:`${padding}px`},{paddingTop:`${restingPadding}px`}],900)]);if(leaving)return;
  machine.style.visibility='hidden';lip.style.visibility='hidden';page.classList.add('is-ticket-detached');page.classList.remove('is-tearing');dispenser.style.paddingTop='';detached=true;
  finish();
 }
 async function redock(){
  if(!detached)return;ready=false;sheet.inert=true;setState('redock');const restingPadding=parseFloat(getComputedStyle(dispenser).paddingTop);
  page.classList.remove('is-ticket-detached');const padding=parseFloat(getComputedStyle(dispenser).paddingTop);dispenser.style.paddingTop=`${restingPadding}px`;
  const away=offscreen();machine.style.translate=`0 ${away}px`;lip.style.translate=`0 ${away}px`;machine.style.visibility='visible';lip.style.visibility='visible';
  await Promise.all([move(dispenser,[{paddingTop:`${restingPadding}px`},{paddingTop:`${padding}px`}],860),move(machine,[{translate:`0 ${away}px`},{translate:'0 0'}],860),move(lip,[{translate:`0 ${away}px`},{translate:'0 0'}],860)]);
  dispenser.style.paddingTop='';detached=false;
 }
 refresh();
 async function enter(){
  try{
   if(!['feed','receipt'].includes(entrance)){setState('step');finish();return;}
   ready=false;sheet.inert=true;page.classList.add('is-printing');sheet.style.clipPath='inset(0 0 100% 0)';sheet.style.translate='0 -44px';
   if(entrance==='feed'){
    setState('enter');page.classList.add('is-machine-entering');const away=offscreen();await Promise.all([move(machine,[{translate:`0 ${away}px`},{translate:'0 0'}],900),move(lip,[{translate:`0 ${away}px`},{translate:'0 0'}],900)]);if(leaving)return;page.classList.remove('is-machine-entering');
   }
   setState('feed');status.textContent='出纸中';
   // Reveal the leading edge and move the already printed sheet down. Do not
   // send a whole translated page backwards through the slit, footer first.
   await move(sheet,[{translate:'0 -44px',clipPath:'inset(0 0 100% 0)'},{translate:'0 0',clipPath:'inset(0 0 0% 0)'}],1900,'cubic-bezier(.28,.15,.3,1)');if(leaving)return;
   sheet.style.clipPath='none';page.classList.remove('is-printing');
   if(page.classList.contains('claim-receipt'))await detach();else finish();
  }catch{}
 }
 enter();
 async function retract(){
  setState('retract');page.classList.add('is-retracting');status.textContent='回收中';const distance=sheet.getBoundingClientRect().height+40;
  await move(sheet,[{translate:getComputedStyle(sheet).translate},{translate:`0 ${-distance}px`}],Math.min(1400,900+distance*.12),'cubic-bezier(.4,.04,.3,1)');
 }
 async function sign(label='登记完成'){
  ready=false;sheet.inert=true;setState('sign');
  const seal=document.createElement('div'),actions=page.querySelector('.claim-step-actions,.ticket-actions');
  seal.className='claim-signature-seal';seal.setAttribute('role','status');
  seal.innerHTML=`<span>下一枝 · 枝条驿站</span><strong>${label==='已领取'?'领取确认':label}</strong><small>BRANCH POST · VERIFIED</small>`;
  if(actions)actions.before(seal);else sheet.append(seal);
  await move(seal,[{transform:'translateY(-18px) rotate(-12deg) scale(1.25)',opacity:0},{transform:'translateY(0) rotate(-6deg) scale(1)',opacity:1}],540,'cubic-bezier(.18,.76,.22,1)');
  await scrollToMachine();await redock();await retract();
 }
 async function scan(changes=[]){
  if(scanning||leaving||!ready||!detached)return;
  scanning=true;ready=false;sheet.inert=true;setState('scan');
  const field=document.createElement('div'),beam=document.createElement('div'),readout=document.createElement('span'),progress=document.createElement('span'),complete=document.createElement('span');
  field.className='claim-scan-field';beam.className='claim-scan-beam';readout.className='claim-scan-readout';progress.className='claim-scan-progress';complete.className='claim-scan-complete';
  field.setAttribute('aria-hidden','true');beam.setAttribute('aria-hidden','true');progress.textContent='VERIFY 00%';complete.textContent='VERIFIED';readout.append(progress,complete);beam.append(readout);sheet.append(field);beam.style.top='-48px';document.body.append(beam);
  const applyThrough=y=>{for(const change of changes){if(change.done)continue;const rect=change.element.getBoundingClientRect(),paper=sheet.getBoundingClientRect();if(y>=rect.top-paper.top+rect.height/2){change.done=true;change.apply();}}};
  const followBeam=y=>{
   const rect=sheet.getBoundingClientRect(),paperTop=rect.top+window.scrollY;
   window.scrollTo({top:Math.max(0,paperTop+y-innerHeight*.58),behavior:'instant'});
   beam.style.left=`${rect.left}px`;beam.style.width=`${rect.width}px`;
   beam.style.top=`${paperTop+y-window.scrollY}px`;
  };
  try{
   if(reduced()){changes.forEach(change=>{change.done=true;change.apply();});return;}
   await scrollToMachine();
   const initialTravel=Math.max(1,sheet.scrollHeight-12),duration=Math.max(1800,Math.min(3000,initialTravel*1.8));
   const ease=p=>.5-.5*Math.cos(Math.PI*p);
   const entryTop=sheet.getBoundingClientRect().top+window.scrollY,entryStart=-entryTop-48;
   const entryDuration=Math.max(240,Math.min(700,-entryStart*duration/initialTravel));
   let travel=initialTravel;
   await new Promise((resolve,reject)=>{let start;function frame(now){if(controller.signal.aborted||leaving){reject(new Error('Press closed'));return;}start??=now;const elapsed=now-start;if(elapsed<entryDuration){const p=elapsed/entryDuration;followBeam(entryStart*(1-Math.pow(p,1.2)));}else{travel=Math.max(1,sheet.scrollHeight-12);const p=Math.min(1,(elapsed-entryDuration)/duration),curve=1.2*p+.6*p*p-.8*p*p*p,y=travel*curve;followBeam(y);progress.textContent=`VERIFY ${String(Math.min(99,Math.floor(p*100))).padStart(2,'0')}%`;applyThrough(y);}if(elapsed<entryDuration+duration)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame);});
   changes.forEach(change=>{if(!change.done){change.done=true;change.apply();}});
   await new Promise(resolve=>setTimeout(resolve,140));
   const readoutWidth=readout.getBoundingClientRect().width,completeWidth=complete.scrollWidth+10;
   readout.style.width=`${readoutWidth}px`;
   void readout.offsetWidth;
   readout.classList.add('is-complete');readout.style.width=`${completeWidth}px`;
   await new Promise(resolve=>setTimeout(resolve,520));
   if(controller.signal.aborted||leaving)throw new Error('Press closed');
   beam.classList.add('is-returning');
   travel=Math.max(1,sheet.scrollHeight-12);
   const paperTop=sheet.getBoundingClientRect().top+window.scrollY,end=-paperTop-48,returnDuration=duration*(travel-end)/travel;
   await new Promise((resolve,reject)=>{let start;function frame(now){if(controller.signal.aborted||leaving){reject(new Error('Press closed'));return;}start??=now;const p=Math.min(1,(now-start)/returnDuration),y=travel+(end-travel)*ease(p);followBeam(y);if(p<1)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame);});
  }finally{scanning=false;field.remove();beam.remove();if(!controller.signal.aborted&&!leaving){sheet.inert=false;ready=true;setState(detached?'detached':'ready');}}
 }
 function leave(){
  if(exitPromise)return exitPromise;
  const mode=detached?'ticket':'retract';
  leaving=true;ready=false;sheet.inert=true;page.dataset.exitPressMode=mode;setState('close');
  // The route transition carries the complete printer scene straight down.
  // Freeze the current feed pose so closing during printing stays coherent.
  const poses=[sheet,machine,lip,feed].map(el=>[el,getComputedStyle(el).translate,getComputedStyle(el).clipPath]);animations.forEach(a=>a.cancel());animations.clear();poses.forEach(([el,translate,clip])=>Object.assign(el.style,{translate,clipPath:clip}));
  exitPromise=Promise.resolve(mode);return exitPromise;
 }
 matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',event=>{if(!event.matches)return;observer?.disconnect();elements.forEach(el=>reveal(el,true));animations.forEach(a=>{try{a.finish();}catch{a.cancel();}});},{signal:controller.signal});
 return {refresh,sign,scan,redock,leave,dispose(){controller.abort();observer?.disconnect();animations.forEach(a=>a.cancel());animations.clear();cancelAnimationFrame(scrollFrame);scrollReject?.(new Error('Press closed'));pending.clear();elements.clear();}};
}
