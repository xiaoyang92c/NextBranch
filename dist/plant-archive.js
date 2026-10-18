const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const ease='cubic-bezier(.25,.08,.2,1)';
let dispose=()=>{},arrival=null,sketchId=0;
const quickCare={
 'golden-privet':[['慢慢增加日照','新枝先避开强晒，长稳后再慢慢见光'],['摸过表土再补水','介质保持微湿，让多余的水排出去'],['让叶节进入介质','清理下部叶片，保留少量上叶，轻轻固定']],
 hibiscus:[['先用晨光过渡','明亮处安放，新枝先避开正午暴晒'],['湿润，也要透气','保持介质微湿，补水后让余水排出'],['留下健壮枝段','保留少量上叶，具体剪取方式在驿站学习']],
 'small-privet':[['明亮，也留出风','先在明亮通风的位置安放，少搬动'],['不必每天灌水','先检查表层湿度，再决定是否补水'],['新芽不等于新根','浅插固定，先观察，不急着拔动或换盆']],
 crape:[['长稳后再见足光','扦插初期先缓苗，避开强烈直晒'],['水进得去，也出得来','用透气介质，留意底部排水'],['新芽之后，仍要等根','保留少量上叶，固定好枝段，不反复拔动']],
 serissa:[['给它柔和的光','用明亮散射光或柔和晨光，安放后少搬动'],['别干透，也别泡着','表层将干时补水，保持稳定湿度'],['细枝也要固定好','适当减少下叶，让叶节进入疏松介质']],
 'cotton-rose':[['新枝先避强晒','等它稳定生长后，再增加日照'],['先看土，再看环境','大叶没精神时，先检查湿度与日晒'],['给大叶减负','在驿站指导下处理下叶，插后轻轻固定']],
 osmanthus:[['新枝先住在柔光里','用明亮散射光，长稳后再逐渐适应日照'],['湿度稳定更重要','介质微湿、透气，不忽干忽湿'],['多给根一点时间','留下少量叶片，安放后不反复拔出检查']],
 'flowering-quince':[['先适应，再迎阳光','新枝避开强晒，长稳后再去向阳处'],['让水经过，不停留','使用透气介质，保持排水畅通'],['先留意枝上的刺','请在驿站指导下处理枝段，再固定扦插']]
};
const leafForms={
 'golden-privet':'M0 0C-7-15-21-25-31-27C-28-10-15-1 0 0Z',
 hibiscus:'M0 0L-16-3L-14-11L-28-16L-20-23L-10-22L-6-31L0-21Q5-10 0 0Z',
 'small-privet':'M0 0Q-20-25-25-15Q-24-3 0 0Z',
 crape:'M0 0C-8-20-27-24-29-15C-28-5-12 0 0 0Z',
 serissa:'M0 0Q-15-23-24-20Q-24-5 0 0Z',
 'cotton-rose':'M0 0L-20-3L-17-12L-31-23L-16-25L-11-36L-2-26L5-29L4-14Z',
 osmanthus:'M0 0C-8-20-29-30-34-26C-32-9-14 0 0 0Z',
 'flowering-quince':'M0 0Q-9-28-29-22Q-33-6 0 0Z'
};
function archiveDiagram(plant,topic){
 const paired=['golden-privet','small-privet','crape','serissa','osmanthus'].includes(plant.id);
 const blade=(x,y,right=false)=>`<g transform="translate(${x} ${y}) scale(${right?-.72:.72} .72)"><path d="${leafForms[plant.id]}"/><path d="M0 0Q-10-8-20-16" class="archive-fine-line"/></g>`;
 const node=(x,y,index)=>`${paired||index===0?blade(x,y):''}${paired||index===1?blade(x,y,true):''}`;
 const plantAt=(x,base,top=30)=>`<path d="M${x} ${base}V${top}"/>${node(x,top+25,0)}${node(x,top+51,1)}`;

 const shade=plant.id==='hibiscus'||plant.id==='flowering-quince'||plant.id==='cotton-rose';
 const light=`<circle cx="26" cy="32" r="12"/><path d="M26 11V5M26 59V53M5 32H0M52 32H47M11 17L7 13M41 47L45 51M11 47L7 51M41 17L45 13"/>${shade?'<path class="archive-mesh" d="M65 12V91M71 12V91M65 22H71M65 34H71M65 46H71M65 58H71M65 70H71M65 82H71"/>':'<path d="M62 12H75V92H62ZM68 12V92" class="archive-window"/>'}${plantAt(132,117,31)}<path d="M42 32H57M82 33L117 45M82 61L${paired?117:146} 73" class="archive-light-ray"/><path d="M112 41L117 45L111 47M${paired?112:141} 69L${paired?117:146} 73L${paired?111:140} 75"/>`;
 const water=`<path d="M26 80H157M26 80V116H79M102 116H157V80" class="archive-section-wall"/><path d="M33 91h4m9 13h4m12-13h4m49 14h4m14-14h4m10 13h4" class="archive-soil-grains"/><path d="M40 14C37 23 31 28 31 34A9 9 0 0 0 49 34C49 28 43 23 40 14Z" class="archive-water-drop"/>${plantAt(126,109,28)}<path d="M40 49V76M40 84C40 100 75 99 90 113M90 119V127" class="archive-water-route"/><path d="M36 70L40 76L44 70M86 122L90 128L94 122"/>`;
 const thorn=plant.id==='flowering-quince';
 const cutting=`${plantAt(43,111,26)}<path d="M68 66H92M86 61L92 66L86 71" class="archive-prep-arrow"/><path d="M108 87H167M108 119H167" class="archive-soil"/>${plantAt(137,114,29)}<circle cx="137" cy="101" r="3" fill="currentColor" stroke="none"/><path d="M137 96V106M132 101H142" class="archive-node-mark"/>${thorn?'<path d="M43 86L54 78"/><path d="M62 84L56 79M60 74L56 79" class="archive-point-guide"/>':'<path d="M163 101H147M152 97L147 101L152 105" class="archive-point-guide"/>'}`;
 return `<svg class="archive-care-diagram" viewBox="0 0 180 134" role="img" aria-label="${plant.name}：${['柔光经过遮挡后落向叶面','从表土补水，多余水从底部排出',thorn?'枝刺位置与枝段固定':'保留上部叶片，裸露叶节进入介质'][topic]}"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${[light,water,cutting][topic]}</g></svg>`;
}
function journeyIcon(kind){
 const paths={
 cut:'M9 9V34M9 18Q-1 16 2 8Q10 9 9 18M9 27Q21 25 20 17Q9 18 9 27M25 32L38 13M25 32L44 20M25 32L19 41M25 32L34 42M9 30L35 20',
 post:'M5 38H43V46H5ZM9 38V32H39V38M24 32V7M24 17Q11 16 13 7Q24 8 24 17M24 27Q37 25 35 17Q24 18 24 27',
 home:'M4 24L24 6L44 24M10 23V47H38V23M24 47V25M24 34Q12 32 14 25Q24 26 24 34M24 41Q36 39 34 32Q24 33 24 41'};
 return `<svg viewBox="0 0 48 54" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[kind]}"/>${kind==='cut'?'<circle cx="16" cy="45" r="5"/><circle cx="37" cy="46" r="5"/><circle cx="25" cy="32" r="1.7"/>':''}</g></svg>`;
}
export function renderArchive(plant,origin,stories=[]){
 const serial=plant.value,notes=quickCare[plant.id],records=stories.filter(record=>!record.demo).slice(-2);
 return `<main class="page archive-page" data-plant="${plant.id}" aria-label="${plant.name}枝条档案" style="--archive-tint:${plant.bg};--archive-paper:${plant.bg};--archive-ink:${plant.sceneInk||plant.ink};--archive-muted:${plant.sceneFine||plant.ink}">
 <article class="archive-paper">
  <div class="archive-topline"><button class="archive-back" data-nav="${origin==='album'?'album':'home'}">← 返回${origin==='album'?'枝条放映室':'邮票馆'}</button><span>${plant.no}</span></div>
  <header class="archive-masthead"><span class="archive-local">农科村</span><h2>农科枝报</h2><span class="archive-edition">第 ${serial} 号</span></header>
  <div class="archive-dateline"><span>修剪之后，继续生长</span><span>田野植物志</span></div>
  <section class="archive-hero">
   <div class="archive-lead"><h1 data-archive-reveal>${plant.name}</h1><p class="archive-latin" data-archive-reveal>${plant.latin}</p><p class="archive-intro" data-archive-reveal>${plant.intro}</p></div>
   <figure class="archive-specimen"><div class="archive-plate"><img class="archive-branch" src="./assets/${plant.art}" alt="${plant.name}植物图版" draggable="false"><span class="archive-plate-seal" aria-hidden="true">一枝<br>新生</span></div><figcaption><span>植物图版</span><span>${plant.no}</span></figcaption></figure>
  </section>
  <section class="archive-briefs" aria-label="枝条资料"><div><span>枝条来处</span><p data-archive-reveal>${plant.source.replace(' · 演示','')}</p></div><div><span>照料提示</span><p data-archive-reveal>${plant.level}</p></div></section>
  <section class="archive-cultivation"><header class="archive-section-title"><span>栽植札记</span><h2 data-archive-reveal>安家，先做好这三件事</h2></header><div class="archive-care-columns">${notes.map(([title,copy],i)=>`<article class="archive-care-note"><figure>${archiveDiagram(plant,i)}<figcaption>${['光照','浇水','扦插'][i]}</figcaption></figure><div><h3 data-archive-reveal>${title}</h3><p data-archive-reveal>${copy}</p></div></article>`).join('')}</div></section>
  <section class="archive-story"><header class="archive-section-title"><span>枝条的下一站</span><h2 data-archive-reveal>从村里，到新的窗边</h2></header><ol class="archive-journey"><li>${journeyIcon('cut')}<span>村里修剪</span></li><li>${journeyIcon('post')}<span>驿站整理</span></li><li>${journeyIcon('home')}<span>新家养护</span></li></ol><aside class="archive-news"><h3>生长手记</h3>${records.length?records.map(record=>`<article><time>${escape(record.date)}</time><h4 data-archive-reveal>${escape(record.title)}</h4>${record.photo?`<img class="archive-news-photo" src="${escape(record.photo)}" alt="${plant.name}的生长近况" loading="lazy">`:''}<p data-archive-reveal>${escape(record.text)}</p></article>`).join(''):'<p data-archive-reveal>新的近况，从你接过这一枝开始。安家后，在放映室留下一张生长明信片。</p>'}</aside></section>
  <section class="archive-receive"><div class="archive-receive-heading"><span class="archive-receive-mark" aria-hidden="true">${journeyIcon('post')}</span><div><span class="archive-section-label">下一站 · 新家</span><h2 class="archive-closing" data-archive-reveal>把这一枝，带回日常</h2></div></div><div class="archive-pickup"><p><span>领取地点</span><strong>农科村枝条再生驿站</strong></p><p><span>领取方式</span><strong>线下自取 · 现场学习养护</strong></p></div><button class="archive-accept" data-claim="${plant.id}"><span class="archive-accept-label">接收这一枝</span><span class="archive-accept-arrow" aria-hidden="true">→</span>${acceptVines()}</button><p class="archive-receive-foot" data-archive-reveal>接过枝条，也给生长留一点时间</p></section>
 </article></main>`;
}

export function cleanupArchive(){dispose();dispose=()=>{};}
function makeGlyphs(element){
 const copy=element.cloneNode(true);copy.querySelectorAll('br').forEach(br=>br.replaceWith('\n'));
 const text=copy.textContent,accessible=document.createElement('span'),ink=document.createElement('span');
 accessible.className='archive-readable';accessible.textContent=text;ink.className='archive-ink';ink.setAttribute('aria-hidden','true');
 const units=text.match(/[A-Za-zÀ-ž×\d—-]+|\s+|[^\s]/gu)||[];
 for(let i=units.length-1;i>0;i--)if(/^[，。！？；：、）》」』”’]/u.test(units[i])){units[i-1]+=units[i];units.splice(i,1);}
 let index=0;
 units.forEach(unit=>{
  if(/^\s+$/u.test(unit)){ink.append(document.createTextNode(unit));return;}
  const group=document.createElement('span');group.className='archive-word';
  Array.from(unit).forEach(char=>{const glyph=document.createElement('span');glyph.className='archive-glyph';glyph.textContent=char;glyph.style.setProperty('--ink-delay',`${Math.min(index++*(element.tagName==='H1'?65:13),650)}ms`);group.append(glyph);});ink.append(group);
 });
 element.replaceChildren(accessible,ink);element.classList.add('archive-ink-ready');
}
export function mountArchive(){
 const root=document.querySelector('.archive-page');if(!root)return;
  const controller=new AbortController(),animations=new Set(),timers=new Set(),elements=[...root.querySelectorAll('[data-archive-reveal]')];let observer;
 const button=root.querySelector('.archive-accept'),vines=button.querySelector('.archive-accept-vines');
 const vineSize=new ResizeObserver(()=>{const w=button.offsetWidth,h=button.offsetHeight;vines.setAttribute('viewBox',`0 0 ${w} ${h}`);vines.innerHTML=vineDrawing(w,h);});vineSize.observe(button);
 const media=matchMedia('(prefers-reduced-motion: reduce)');
 const sketches=new Map();
 const finishSketch=svg=>{const item=sketches.get(svg);if(!item)return;item.group.removeAttribute('mask');item.defs.remove();sketches.delete(svg);};
 let sketchObserver;
 if(!media.matches){
  root.querySelectorAll('.archive-care-diagram,.archive-journey svg').forEach(svg=>{
   const group=svg.querySelector('g'),id=`archive-sketch-${++sketchId}`,defs=document.createElementNS('http://www.w3.org/2000/svg','defs'),mask=document.createElementNS(svg.namespaceURI,'mask');mask.id=id;mask.setAttribute('maskUnits','userSpaceOnUse');mask.setAttribute('x','-10');mask.setAttribute('y','-10');mask.setAttribute('width','210');mask.setAttribute('height','165');
   const tracing=group.cloneNode(true);tracing.setAttribute('stroke','white');tracing.setAttribute('stroke-width','4');tracing.querySelectorAll('*').forEach(el=>{el.removeAttribute('class');el.removeAttribute('style');el.setAttribute('fill','none');el.setAttribute('stroke','white');});
   const lines=[...tracing.querySelectorAll('path,circle')],originals=[...group.querySelectorAll('path,circle')];lines.forEach((el,i)=>{const length=originals[i].getTotalLength();el.style.strokeDasharray=`${length} ${length}`;el.style.strokeDashoffset=String(length);});mask.append(tracing);defs.append(mask);svg.prepend(defs);group.setAttribute('mask',`url(#${id})`);sketches.set(svg,{group,defs,lines});
  });
  sketchObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;sketchObserver.unobserve(entry.target);const item=sketches.get(entry.target);if(!item)return;const batch=item.lines.map((el,i)=>{const a=el.animate([{strokeDashoffset:el.style.strokeDashoffset},{strokeDashoffset:'0'}],{duration:1100,delay:i*38,easing:'cubic-bezier(.25,.1,.25,1)',fill:'both'});animations.add(a);return a;});Promise.allSettled(batch.map(a=>a.finished)).then(()=>{finishSketch(entry.target);batch.forEach(a=>{a.cancel();animations.delete(a);});});}),{threshold:.4});
  sketches.forEach((_,svg)=>sketchObserver.observe(svg));
 }
   const reveal=element=>{element.classList.add('is-ink-visible');observer?.unobserve(element);};
 if(!reduced()){
   root.classList.add('is-archive-staged');
   elements.forEach(makeGlyphs);
   const opening=new Set(elements.filter(element=>element.getBoundingClientRect().top<innerHeight+80));
   const wake=()=>{
    if(root.classList.contains('is-archive-awake'))return;
    root.classList.remove('is-branch-arriving');root.classList.add('is-archive-awake');
    [...opening].forEach((element,index)=>{const timer=setTimeout(()=>{timers.delete(timer);reveal(element);},120+index*125);timers.add(timer);});
   };
  observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
   if(!entry.isIntersecting)return;
    reveal(entry.target);
  }),{threshold:.12,rootMargin:'0px 0px -4% 0px'});
  if(arrival?.plantId===root.dataset.plant)root.classList.add('is-branch-arriving');
   elements.filter(element=>!opening.has(element)).forEach(element=>observer.observe(element));
   root.addEventListener('archive:landed',wake,{signal:controller.signal});
   if(!root.classList.contains('is-branch-arriving'))requestAnimationFrame(wake);
 }
 media.addEventListener('change',()=>{if(media.matches){observer?.disconnect();sketchObserver?.disconnect();[...sketches.keys()].forEach(finishSketch);elements.forEach(reveal);animations.forEach(animation=>animation.cancel());cancelArchiveEntry();}},{signal:controller.signal});
  dispose=()=>{controller.abort();observer?.disconnect();sketchObserver?.disconnect();[...sketches.keys()].forEach(finishSketch);vineSize.disconnect();timers.forEach(clearTimeout);animations.forEach(animation=>animation.cancel());};
}
export function cancelArchiveEntry(keepId=null){
 if(!arrival||(!arrival.returning&&arrival.plantId===keepId))return;
 const state=arrival;arrival=null;state.cancelled=true;state.stopLiquid?.();state.animations.forEach(animation=>animation.cancel());state.overlay.remove();
  if(state.source?.isConnected){state.source.style.visibility=state.visibility;state.source.classList.remove('is-portal-source','is-portal-print-hidden');if(state.original){state.original.style.transition=state.sourceTransition;state.original.classList.remove('is-portal-flat-print');}}
 if(state.sourcePage?.isConnected)state.sourcePage.inert=false;
 if(state.source?.isConnected)state.pausedFloat?.forEach(a=>{if(a.playState==='paused')a.play();});
 if(state.original?.isConnected)state.original.dispatchEvent(new Event('stamp:layout'));
 state.restore?.();
 document.querySelector('.archive-page')?.dispatchEvent(new Event('archive:landed'));
}
function vineDrawing(width,height){
 // Leaf origins and petiole endpoints share the same coordinates. The main
 // stem lies on the button's actual border, rather than drawing a second frame.
 const leaf=(nx,ny,bx,by,angle,delay)=>`<g class="accept-vine-node" style="--vine-delay:${delay}s"><path class="accept-vine-petiole" pathLength="1" d="M${nx} ${ny}L${bx} ${by}"/><g transform="translate(${bx} ${by}) rotate(${angle})"><path class="accept-vine-leaf" pathLength="1" d="M0 0C-5-3-7-12-2-18C4-15 6-5 0 0Z"/><path class="accept-leaf-vein" pathLength="1" d="M0 0Q0-7-2-14"/></g></g>`;
 const art=`<path class="accept-vine-stem" pathLength="1" d="M.5 ${height*.88}C.5 ${height*.74} 8 ${height*.7} 8 ${height*.57}S-3 ${height*.4} .5 ${height*.31}Q2 14 18 .5C${width*.15} -5 ${width*.2} 6 ${width*.28} .5Q${width*.38} -3 ${width*.46} .5"/>${leaf(8,height*.57,12,height*.57-3,35,.25)}${leaf(18,.5,14,-4,60,.5)}${leaf(width*.28,.5,width*.28+3,6,155,.75)}`;
 return `<g fill="none" stroke="currentColor" stroke-linecap="butt" stroke-linejoin="round">${art}<g transform="translate(${width} ${height}) rotate(180)">${art}</g></g>`;
}
function acceptVines(){return `<svg class="archive-accept-vines" viewBox="0 0 440 116" aria-hidden="true">${vineDrawing(440,116)}</svg>`;}
function fittedImage(image,natural=image){
 const box=image.getBoundingClientRect(),ratio=Math.min(box.width/natural.naturalWidth,box.height/natural.naturalHeight),width=natural.naturalWidth*ratio,height=natural.naturalHeight*ratio;
 return {left:box.left+(box.width-width)/2,top:box.top+(box.height-height)/2,width,height,cx:box.left+box.width/2,cy:box.top+box.height/2};
}
function flightFrames(from,to,base){
 return [{transform:`translate3d(${from.cx-base.cx}px,${from.cy-base.cy}px,0) scale(${from.scale})`},{transform:`translate3d(${to.cx-base.cx}px,${to.cy-base.cy}px,0) scale(${to.scale})`}];
}

// Magnify until the undecorated centre of the print covers every viewport edge.
// Perforations and type leave the camera by geometry, never by opacity.
function printZoom(stamp,box){
 const inner=stamp.querySelector('.stamp-inner').getBoundingClientRect(),top=stamp.querySelector('.stamp-top').getBoundingClientRect(),bottom=stamp.querySelector('.stamp-bottom').getBoundingClientRect(),cx=box.left+box.width/2,cy=box.top+box.height/2;
 const safe={left:inner.left+3,right:inner.right-3,top:top.bottom+10,bottom:bottom.top-10};
 return Math.max(cx/Math.max(8,cx-safe.left),(innerWidth-cx)/Math.max(8,safe.right-cx),cy/Math.max(8,cy-safe.top),(innerHeight-cy)/Math.max(8,safe.bottom-cy))*1.18;
}
function printLayer(stamp,box){
 const shell=document.createElement('div');shell.className='branch-portal-stamp';
 const print=stamp.cloneNode(true);print.className='stamp portal-print';print.removeAttribute('style');
 for(const name of ['--stamp-bg','--stamp-ink'])print.style.setProperty(name,getComputedStyle(stamp).getPropertyValue(name));
  print.querySelector('.stamp-paper-surface')?.remove();print.querySelector('.stamp-grain-overlay')?.remove();print.querySelector('.stamp-art')?.remove();print.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));shell.append(print);
 Object.assign(shell.style,{left:`${box.left}px`,top:`${box.top}px`,width:`${box.width}px`,height:`${box.height}px`});return shell;
}
function pauseFloat(stamp,reset=false){
 const floats=stamp.getAnimations().filter(a=>a.animationName==='scene-stamp-suspend');floats.forEach(a=>{a.pause();if(reset)a.currentTime=0;});return floats;
}
export async function enterArchive(plant,source,navigate){
 if(arrival)return;
 const original=source?.querySelector('.stamp'),originalImage=original?.querySelector('.stamp-art');
 if(reduced()||!originalImage?.naturalWidth){navigate();return;}
 const overlay=document.createElement('div');overlay.className='branch-flight stamp-portal';overlay.dataset.flightStage='prepare';overlay.style.visibility='hidden';document.body.append(overlay);
  const sourcePage=source.closest('main'),sourceTransition=original.style.transition,state={plantId:plant.id,overlay,source,sourcePage,visibility:source.style.visibility,original,sourceTransition,animations:new Set(),cancelled:false,pausedFloat:pauseFloat(original)};arrival=state;if(sourcePage){sourcePage.inert=true;sourcePage.classList.add('is-portal-departing');}
 const animate=(el,frames,duration,easing='cubic-bezier(.3,.05,.22,1)')=>{const a=el.animate(frames,{duration,easing,fill:'both'});state.animations.add(a);return a;};
 const lens=sourcePage?.querySelector('.scene-lens-displacement'),lensScale=lens?.getAttribute('scale');
  state.restore=()=>{if(sourcePage?.isConnected){sourcePage.classList.remove('is-portal-departing');if(lens)lens.setAttribute('scale',lensScale);}};
 try{
  // Settle the current paper bend and pointer tilt, instead of flattening a
  // moving sheet in one frame before making its independent plant layer.
   original.classList.add('is-portal-flat-print');
   const preparations=[animate(original,[{transform:getComputedStyle(original).transform},{transform:'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)'}],200).finished];
  original.querySelectorAll('.paper-strip').forEach(strip=>preparations.push(animate(strip,[{transform:getComputedStyle(strip).transform},{transform:'translateZ(0) rotateY(0deg) scaleX(1)'}],200).finished));
  if(lens)preparations.push(new Promise(resolve=>{const start=performance.now();function frame(now){if(state.cancelled){resolve();return;}const t=Math.min(1,(now-start)/200);lens.setAttribute('scale',String(Number(lensScale)*(1-t*t*(3-2*t))));if(t<1)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame);}));
  await Promise.all(preparations);if(state.cancelled)return;
  original.style.transition='none';original.dispatchEvent(new Event('stamp:reset'));
  const probe=document.createElement('div');probe.setAttribute('aria-hidden','true');probe.inert=true;Object.assign(probe.style,{position:'fixed',left:'0',top:'0',width:'100%',height:'100svh',overflow:'hidden',visibility:'hidden',pointerEvents:'none'});probe.innerHTML=renderArchive(plant,'home');document.body.append(probe);
  const destination=fittedImage(probe.querySelector('.archive-branch'),originalImage),endFilter=getComputedStyle(probe.querySelector('.archive-branch')).filter;probe.remove();
  const bounds=original.getBoundingClientRect(),start=fittedImage(originalImage),zoom=printZoom(original,bounds),shell=printLayer(original,bounds),flight=document.createElement('img');flight.className='branch-flight-plant';flight.src=originalImage.currentSrc||originalImage.src;flight.alt='';
  Object.assign(flight.style,{left:`${start.cx-destination.width/2}px`,top:`${start.cy-destination.height/2}px`,width:`${destination.width}px`,height:`${destination.height}px`,transform:`scale(${start.width/destination.width})`,filter:getComputedStyle(originalImage).filter});
  overlay.append(shell,flight);overlay.style.visibility='visible';overlay.dataset.flightStage='grow';source.classList.add('is-portal-print-hidden');
   const camera=animate(shell,[{transform:'scale(1)'},{transform:`scale(${zoom})`}],1320),hold={cx:destination.cx,cy:destination.cy,scale:1},base={cx:start.cx,cy:start.cy};
   const growth=flightFrames({...start,scale:start.width/destination.width},hold,base);growth[0].filter=getComputedStyle(originalImage).filter;growth[1].filter=endFilter;
  await Promise.all([camera.finished,animate(flight,growth,1320).finished]);if(state.cancelled)return;
   // Lettering and perforations have left the camera. The fine grain faded
   // during preparation, so the flat paper colour can carry the handoff.
  overlay.style.background=plant.bg;shell.remove();navigate();
  let target;for(let i=0;i<40;i++){await new Promise(resolve=>requestAnimationFrame(resolve));if(state.cancelled)return;target=document.querySelector(`#app .archive-page[data-plant="${plant.id}"]`);if(target)break;}if(!target)return;
  const image=target.querySelector('.archive-branch');if(!image.complete)await image.decode().catch(()=>{});if(state.cancelled)return;
   overlay.dataset.flightStage='place';
   // The folio places its specimen at the enlarged print's centre, so there is
   // no second downward flight after the stamp has filled the screen.
   overlay.style.background='transparent';flight.style.filter=endFilter;
   target.dispatchEvent(new Event('archive:landed'));
   await animate(flight,[{opacity:1},{opacity:0}],360).finished;
 }catch{}finally{
   if(arrival===state){arrival=null;state.animations.forEach(a=>a.cancel());overlay.remove();state.restore();if(source.isConnected){source.style.visibility=state.visibility;source.classList.remove('is-portal-source','is-portal-print-hidden');original.style.transition=sourceTransition;original.classList.remove('is-portal-flat-print');state.pausedFloat.forEach(a=>a.play());original.dispatchEvent(new Event('stamp:layout'));}if(sourcePage?.isConnected)sourcePage.inert=false;document.querySelector('#app .archive-page')?.dispatchEvent(new Event('archive:landed'));}
 }
}

export async function returnArchive(plant,renderDestination){
 const page=document.querySelector('#app .archive-page');
 if(!page||reduced()){renderDestination();return;}
 cancelArchiveEntry();
 const image=page.querySelector('.archive-branch');
 if(!image?.naturalWidth){renderDestination();return;}
 const from=fittedImage(image),fromFilter=getComputedStyle(image).filter;
 const overlay=document.createElement('div');overlay.className='branch-flight stamp-return';
 const flight=document.createElement('img');flight.className='branch-flight-plant';
 flight.src=image.currentSrc||image.src;flight.alt='';
 Object.assign(flight.style,{left:from.left+'px',top:from.top+'px',width:from.width+'px',height:from.height+'px',filter:fromFilter});
 overlay.append(flight);document.body.append(overlay);
 const state={plantId:plant.id,returning:true,overlay,animations:new Set(),cancelled:false,sourcePage:page};
 arrival=state;page.inert=true;
 const originalVisibility=image.style.visibility;image.style.visibility='hidden';
 let rendered=false,destination,home,lens,lensScale,floats=[],restored=false;
 const animate=(element,frames,duration,delay=0)=>{
  const motion=element.animate(frames,{duration,delay,easing:'cubic-bezier(.25,.7,.2,1)',fill:'both'});
  state.animations.add(motion);return motion;
 };
 state.restore=()=>{
  if(restored)return;restored=true;
  if(image.isConnected)image.style.visibility=originalVisibility;
  if(page.isConnected){page.style.visibility='';page.inert=false;}
  if(destination?.isConnected)destination.classList.remove('is-return-target');
  floats.forEach(motion=>{if(motion.playState==='paused')motion.play();});
  if(lens?.isConnected)lens.setAttribute('scale',lensScale);
  if(home?.isConnected)home.inert=false;
 };
 try{
  const selectors='.archive-topline,.archive-masthead,.archive-dateline,.archive-lead h1,.archive-latin,.archive-intro,.archive-specimen figcaption,.archive-plate-seal,.archive-briefs';
  const pieces=[...page.querySelectorAll(selectors)].filter(element=>{
   const box=element.getBoundingClientRect();return box.bottom>0&&box.top<innerHeight;
  });
  const ink=getComputedStyle(page).getPropertyValue('--archive-ink').trim()||getComputedStyle(page).color;
  const dispersal=pieces.map((element,index)=>{
   const dx=((index*7)%5-2)*13,dy=-16-((index*11)%4)*9;
   return animate(element,[{opacity:1,filter:'blur(0px)',transform:'translate3d(0,0,0)'},{opacity:0,filter:'blur(4px)',transform:'translate3d('+dx+'px,'+dy+'px,0)'}],560,index*28).finished;
  });
  for(let i=0;i<44;i++){
   const source=pieces[i%Math.max(1,pieces.length)];if(!source)break;
   const box=source.getBoundingClientRect(),x=box.left+box.width*((i*.61803398875)%1),y=box.top+box.height*((i*.41421356237)%1);
   const spark=document.createElement('span');spark.className='archive-dispel-spark';spark.style.setProperty('--spark-ink',ink);
   Object.assign(spark.style,{left:x+'px',top:y+'px'});overlay.append(spark);
   const angle=i*2.39996,distance=16+(i%7)*6,near='translate3d('+(Math.cos(angle)*distance*.4)+'px,'+(Math.sin(angle)*distance*.4)+'px,0) scale(1)',far='translate3d('+(Math.cos(angle)*distance)+'px,'+(Math.sin(angle)*distance)+'px,0) scale(.2)';
   dispersal.push(animate(spark,[{opacity:0,transform:'translate3d(0,0,0) scale(.4)'},{opacity:.9,transform:near,offset:.32},{opacity:0,transform:far}],620,(i%8)*31).finished);
  }
  await Promise.allSettled(dispersal);if(state.cancelled)return;
  page.style.visibility='hidden';renderDestination();rendered=true;if(state.cancelled)return;
  home=document.querySelector('.home-scene');destination=home?.querySelector('.scene-stamp.current');
  const stamp=destination?.querySelector('.stamp'),stampImage=stamp?.querySelector('.stamp-art');
  if(!stampImage)throw new Error('Return stamp is missing');
  home.inert=true;destination.classList.add('is-return-target');floats=pauseFloat(stamp);
  lens=home.querySelector('.scene-lens-displacement');lensScale=lens?.getAttribute('scale');
  if(lens)lens.setAttribute('scale','0');
  if(!stampImage.complete)await stampImage.decode();if(state.cancelled)return;
  const to=fittedImage(stampImage,image),base={cx:from.cx,cy:from.cy};
  const frames=flightFrames({...from,scale:1},{cx:to.cx,cy:to.cy,scale:to.width/from.width},base);
  frames[0].filter=fromFilter;frames[1].filter=getComputedStyle(stampImage).filter;
  const homeFade=animate(home,[{opacity:0},{opacity:1}],550);
  await Promise.all([animate(flight,frames,1240).finished,homeFade.finished]);if(state.cancelled)return;
  destination.classList.remove('is-return-target');
  await animate(flight,[{opacity:1},{opacity:0}],160).finished;
  if(lens){
   const target=Number(lensScale),begin=performance.now();
   await new Promise(resolve=>{
    let frame=0;state.stopLens=()=>{cancelAnimationFrame(frame);resolve();};
    const step=now=>{if(state.cancelled){resolve();return;}const t=Math.min(1,(now-begin)/320);lens.setAttribute('scale',String(target*(t*t*(3-2*t))));if(t<1)frame=requestAnimationFrame(step);else resolve();};
    frame=requestAnimationFrame(step);
   });
  }
 }catch(error){
  if(!state.cancelled){console.error('报纸返回动画失败',error);if(!rendered)renderDestination();}
 }finally{
  state.stopLens?.();state.animations.forEach(motion=>motion.cancel());overlay.remove();state.restore();if(arrival===state)arrival=null;
 }
}