const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
// The press owns the whole paper cycle: feed, sign, retract, tear and collect.
export function mountClaimPress(page,entrance='feed'){
 const controller=new AbortController(),animations=new Set(),pending=new Set(),elements=new Set(),helpers=new Set();
 const sheet=page.querySelector('.dispatch-paper'),machine=page.querySelector('.claim-machine'),lip=page.querySelector('.claim-output-lip'),status=page.querySelector('.claim-machine-status'),feed=page.querySelector('.claim-paper-feed'),dispenser=page.querySelector('.claim-dispenser');
 let observer,ready=false,detached=false,leaving=false,exitPromise,scrollFrame=0,scrollReject=null,rollFrame=0,rollResolve=null;
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
 function finish(){if(controller.signal.aborted||leaving)return;ready=true;sheet.inert=false;page.classList.remove('is-printing','is-machine-entering','is-retracting');page.classList.add('is-issued');status.textContent='请取单';pending.forEach(el=>reveal(el));pending.clear();setState(detached?'detached':'ready');page.dispatchEvent(new Event('claim:printed'));}
 function scrollToMachine(){
  if(reduced()){window.scrollTo({top:0,behavior:'instant'});return Promise.resolve();}
  return new Promise((resolve,reject)=>{scrollReject=reject;const from=window.scrollY,start=performance.now();function tick(now){if(controller.signal.aborted){reject(new Error('Press closed'));return;}const t=Math.min(1,(now-start)/520),p=1-(1-t)**3;window.scrollTo({top:from*(1-p),behavior:'instant'});if(t<1)scrollFrame=requestAnimationFrame(tick);else{scrollFrame=0;scrollReject=null;resolve();}}scrollFrame=requestAnimationFrame(tick);});
 }
 async function detach(){
  setState('tear');page.classList.add('is-tearing');const padding=parseFloat(getComputedStyle(dispenser).paddingTop);sheet.inert=true;
  await move(sheet,[{translate:'0 0'},{translate:'0 16px'}],520,'cubic-bezier(.3,.1,.22,1)');if(leaving)return;
  const away=offscreen();await Promise.all([move(machine,[{translate:'0 0'},{translate:`0 ${away}px`}],860),move(lip,[{translate:'0 0'},{translate:`0 ${away}px`}],860),move(feed,[{translate:'0 0'},{translate:`0 ${-padding}px`}],860)]);if(leaving)return;
  machine.style.visibility='hidden';lip.style.visibility='hidden';page.classList.add('is-ticket-detached');page.classList.remove('is-tearing');feed.style.translate='0 0';detached=true;
  const close=page.querySelector('.claim-ticket-close');if(close)await move(close,[{opacity:0},{opacity:1}],240);finish();
 }
 async function redock(){
  if(!detached)return;ready=false;sheet.inert=true;setState('redock');const padding=parseFloat(getComputedStyle(dispenser).getPropertyValue('--feed-start'));
  dispenser.style.paddingTop=`${padding}px`;feed.style.translate=`0 ${-padding}px`;page.classList.remove('is-ticket-detached');
  const away=offscreen();machine.style.translate=`0 ${away}px`;lip.style.translate=`0 ${away}px`;machine.style.visibility='visible';lip.style.visibility='visible';
  await Promise.all([move(feed,[{translate:`0 ${-padding}px`},{translate:'0 0'}],860),move(sheet,[{translate:'0 16px'},{translate:'0 0'}],860),move(machine,[{translate:`0 ${away}px`},{translate:'0 0'}],860),move(lip,[{translate:`0 ${away}px`},{translate:'0 0'}],860)]);
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
 async function sign(label='已签单'){
  ready=false;sheet.inert=true;setState('sign');
  const button=page.querySelector('#claim-step-form button[type="submit"],[data-claim-pickup]'),seal=document.createElement('div');seal.className='claim-signature-seal';seal.textContent=label;const box=button.getBoundingClientRect(),paperBox=sheet.getBoundingClientRect();Object.assign(seal.style,{left:`${box.left-paperBox.left+box.width/2}px`,top:`${box.top-paperBox.top-42}px`});sheet.append(seal);
  await move(seal,[{transform:'translate(-50%,-30px) scale(1.4)',opacity:0},{transform:'translate(-50%,0) scale(1)',opacity:1}],460);
  await scrollToMachine();await redock();await retract();
 }
 async function collect(){
  setState('collect');await scrollToMachine();const box=sheet.getBoundingClientRect(),height=box.height,initial=Math.min(height,innerHeight-box.top-24),roll=document.createElement('div');roll.className='claim-collected-roll';roll.setAttribute('aria-hidden','true');roll.style.setProperty('--roll-paper',getComputedStyle(sheet).backgroundColor);Object.assign(roll.style,{left:`${box.left}px`,top:`${box.top+height-14}px`,width:`${box.width}px`});
  const print=page.querySelector('.claim-mailtitle').cloneNode(true);print.querySelectorAll('.claim-readable').forEach(el=>el.remove());roll.append(print);document.body.append(roll);helpers.add(roll);sheet.inert=true;
  if(!reduced())await new Promise(resolve=>{const start=performance.now();rollResolve=resolve;function frame(now){if(controller.signal.aborted){resolve();return;}const t=Math.min(1,(now-start)/1120),p=t<.15?t/.15*.08:.08+.92*(1-Math.pow(1-(t-.15)/.85,2)),remaining=t<.15?height-(height-initial)*t/.15:initial*(1-(p-.08)/.92);sheet.style.clipPath=`inset(0 0 ${Math.max(0,height-remaining)}px 0)`;roll.style.top=`${box.top+remaining-14}px`;roll.style.setProperty('--roll-radius',`${12+12*p}px`);if(t<1)rollFrame=requestAnimationFrame(frame);else{rollFrame=0;rollResolve=null;resolve();}}rollFrame=requestAnimationFrame(frame);});
  sheet.style.visibility='hidden';await move(roll,[{translate:'0 0',rotate:'0deg'},{translate:`${innerWidth-box.left+80}px -18px`,rotate:'-5deg'}],820,'cubic-bezier(.42,.04,.45,1)');roll.remove();helpers.delete(roll);
 }
 function leave(){
  if(exitPromise)return exitPromise;leaving=true;ready=false;sheet.inert=true;setState('close');
  // Keep the current physical pose when closing during feed or tearing.
  const poses=[sheet,machine,lip,feed].map(el=>[el,getComputedStyle(el).translate,getComputedStyle(el).clipPath]);animations.forEach(a=>a.cancel());animations.clear();poses.forEach(([el,translate,clip])=>Object.assign(el.style,{translate,clipPath:clip}));
  exitPromise=(async()=>{if(detached){await collect();return;}await scrollToMachine();await retract();const away=offscreen();await Promise.all([move(machine,[{translate:getComputedStyle(machine).translate},{translate:`0 ${away}px`}],820),move(lip,[{translate:getComputedStyle(lip).translate},{translate:`0 ${away}px`}],820)]);})();return exitPromise;
 }
 matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',event=>{if(!event.matches)return;observer?.disconnect();elements.forEach(el=>reveal(el,true));animations.forEach(a=>{try{a.finish();}catch{a.cancel();}});},{signal:controller.signal});
 return {refresh,sign,redock,leave,dispose(){controller.abort();observer?.disconnect();animations.forEach(a=>a.cancel());animations.clear();cancelAnimationFrame(scrollFrame);scrollReject?.(new Error('Press closed'));cancelAnimationFrame(rollFrame);rollResolve?.();helpers.forEach(el=>el.remove());pending.clear();elements.clear();}};
}
