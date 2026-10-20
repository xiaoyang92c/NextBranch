const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const ease='cubic-bezier(.25,.08,.2,1)';
let dispose=()=>{},arrival=null,sketchId=0;
const quickCare={
 podocarpus:[['明亮而少搬动','让小苗先适应明亮通风的位置，再逐渐调整光照'],['表土稍干再补水','浇透后让余水排走，不让根长期泡在水中'],['先养根，再造型','领取根系完整的小苗，长稳后再学习修剪']],
 citron:[['给它温暖的光','小苗循序适应日照，冷凉时留意温度'],['浇后排走余水','检查介质湿度，避免盆中长时间积水'],['选择完整小苗','安放根系时留意枝刺，不把修剪枝当作容易生根的材料']],
 'five-lobed-maple':[['顺着季节见光','小苗在明亮处长稳，叶色会随季节变化'],['适度湿润而透气','根系需要排水好的介质和舒展空间'],['先给根留位置','领取已生根的小苗，乔木长大需要空间']],
 crape:[['长稳后再见足光','扦插初期先缓苗，避开强烈直晒'],['水进得去，也出得来','用透气介质，留意底部排水'],['新芽之后，仍要等根','保留少量上叶，固定好枝段，不反复拔动']],
 serissa:[['给它柔和的光','用明亮散射光或柔和晨光，安放后少搬动'],['别干透，也别泡着','表层将干时补水，保持稳定湿度'],['细枝也要固定好','适当减少下叶，让叶节进入疏松介质']],
 camellia:[['明亮但别暴晒','柔和晨光或明亮散射光更适合安放茶花'],['留意介质微酸','保持排水通畅，花芽期别长期缺水'],['稳稳固定枝段','在合适季节向驿站学习半木质化枝扦插']],
 ginkgo:[['让小苗慢慢见光','幼苗先适应明亮位置，再逐渐增加日照'],['排水比积水好','补水后让余水排走，留出根系生长空间'],['从小苗开始','优先领取已生根的小苗，不把剪下枝段当作即插即活']],
 bougainvillea:[['长稳后多见阳光','温暖季节逐渐增加日照，初期避开强晒'],['先检查再补水','排水通畅，冷凉时不要让介质湿冷'],['避开枝上的小刺','健康枝段在指导下处理，再放进透气介质']],
 osmanthus:[['新枝先住在柔光里','用明亮散射光，长稳后再逐渐适应日照'],['湿度稳定更重要','介质微湿、透气，不忽干忽湿'],['多给根一点时间','留下少量叶片，安放后不反复拔出检查']],
 pomegranate:[['长稳后向着阳光','新枝先缓苗，稳定生长后再增加日照'],['浇水后让余水排走','透气介质与通风一起照顾'],['枝段固定好','在指导下处理成熟健康枝段，等待新根']]
};
const leafForms={
 podocarpus:'M0 0Q-9-23-10-35Q-2-27 0 0Z',
 citron:'M0 0Q-13-27-31-28Q-29-10 0 0Z',
 'five-lobed-maple':'M0 0L-13-8L-22-17L-15-18L-16-30L-5-23L0-36L5-23L16-30L15-18L22-17L13-8Z',
 crape:'M0 0C-8-20-27-24-29-15C-28-5-12 0 0 0Z',
 serissa:'M0 0Q-15-23-24-20Q-24-5 0 0Z',
 camellia:'M0 0C-8-23-27-31-34-28C-32-11-13 0 0 0Z',
 ginkgo:'M0 0Q-14-9-29-28Q-21-39-10-31Q0-41 9-30Q18-37 27-26Q11-11 0 0Z',
 bougainvillea:'M0 0Q-9-23-28-20Q-25-5 0 0Z',
 osmanthus:'M0 0C-8-20-29-30-34-26C-32-9-14 0 0 0Z',
 pomegranate:'M0 0Q-10-23-25-18Q-24-5 0 0Z'
};
function archiveDiagram(plant,topic){
 const paired=['podocarpus','citron','crape','serissa','osmanthus','camellia','pomegranate'].includes(plant.id);
 const seedlingOnly=['podocarpus','citron','five-lobed-maple','ginkgo'].includes(plant.id);
 const blade=(x,y,right=false)=>`<g transform="translate(${x} ${y}) scale(${right?-.72:.72} .72)"><path d="${leafForms[plant.id]}"/><path d="M0 0Q-10-8-20-16" class="archive-fine-line"/></g>`;
 const node=(x,y,index)=>`${paired||index===0?blade(x,y):''}${paired||index===1?blade(x,y,true):''}`;
 const plantAt=(x,base,top=30)=>`<path d="M${x} ${base}V${top}"/>${node(x,top+25,0)}${node(x,top+51,1)}`;

 const shade=['camellia','serissa','osmanthus','podocarpus'].includes(plant.id);
 const light=`<circle cx="26" cy="32" r="12"/><path d="M26 11V5M26 59V53M5 32H0M52 32H47M11 17L7 13M41 47L45 51M11 47L7 51M41 17L45 13"/>${shade?'<path class="archive-mesh" d="M65 12V91M71 12V91M65 22H71M65 34H71M65 46H71M65 58H71M65 70H71M65 82H71"/>':'<path d="M62 12H75V92H62ZM68 12V92" class="archive-window"/>'}${plantAt(132,117,31)}<path d="M42 32H57M82 33L117 45M82 61L${paired?117:146} 73" class="archive-light-ray"/><path d="M112 41L117 45L111 47M${paired?112:141} 69L${paired?117:146} 73L${paired?111:140} 75"/>`;
 const water=`<path d="M26 80H157M26 80V116H79M102 116H157V80" class="archive-section-wall"/><path d="M33 91h4m9 13h4m12-13h4m49 14h4m14-14h4m10 13h4" class="archive-soil-grains"/><path d="M40 14C37 23 31 28 31 34A9 9 0 0 0 49 34C49 28 43 23 40 14Z" class="archive-water-drop"/>${plantAt(126,109,28)}<path d="M40 49V76M40 84C40 100 75 99 90 113M90 119V127" class="archive-water-route"/><path d="M36 70L40 76L44 70M86 122L90 128L94 122"/>`;
 const thorn=['citron','bougainvillea'].includes(plant.id);
 const cutting=seedlingOnly?`<path d="M25 92H155M25 116H155" class="archive-soil"/>${plantAt(90,93,24)}<path d="M90 93Q83 103 75 109M90 93Q96 101 105 108M90 99V113" class="archive-root"/><path d="M49 107H62M118 107H133" class="archive-point-guide"/>`:`${plantAt(43,111,26)}<path d="M68 66H92M86 61L92 66L86 71" class="archive-prep-arrow"/><path d="M108 87H167M108 119H167" class="archive-soil"/>${plantAt(137,114,29)}<circle cx="137" cy="101" r="3" fill="currentColor" stroke="none"/><path d="M137 96V106M132 101H142" class="archive-node-mark"/>${thorn?'<path d="M43 86L54 78"/><path d="M62 84L56 79M60 74L56 79" class="archive-point-guide"/>':'<path d="M163 101H147M152 97L147 101L152 105" class="archive-point-guide"/>'}`;
 return `<svg class="archive-care-diagram" viewBox="0 0 180 134" role="img" aria-label="${plant.name}：${['柔光经过遮挡后落向叶面','从表土补水，多余水从底部排出',seedlingOnly?'将小苗安放在透气介质中':thorn?'留意枝刺并固定枝段':'保留上部叶片，裸露叶节进入介质'][topic]}"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${[light,water,cutting][topic]}</g></svg>`;
}
function journeyIcon(kind){
 const paths={
 cut:'M9 9V34M9 18Q-1 16 2 8Q10 9 9 18M9 27Q21 25 20 17Q9 18 9 27M25 32L38 13M25 32L44 20M25 32L19 41M25 32L34 42M9 30L35 20',
 post:'M5 38H43V46H5ZM9 38V32H39V38M24 32V7M24 17Q11 16 13 7Q24 8 24 17M24 27Q37 25 35 17Q24 18 24 27',
 home:'M4 24L24 6L44 24M10 23V47H38V23M24 47V25M24 34Q12 32 14 25Q24 26 24 34M24 41Q36 39 34 32Q24 33 24 41'};
 return `<svg viewBox="0 0 48 54" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[kind]}"/>${kind==='cut'?'<circle cx="16" cy="45" r="5"/><circle cx="37" cy="46" r="5"/><circle cx="25" cy="32" r="1.7"/>':''}</g></svg>`;
}
export function renderArchive(plant,origin,stories=[]){
 const serial=plant.value,notes=quickCare[plant.id],records=stories.filter(record=>!record.demo).slice(-2),seedlingOnly=['podocarpus','citron','five-lobed-maple','ginkgo'].includes(plant.id);
 return `<main class="page archive-page" data-plant="${plant.id}" aria-label="${plant.name}枝条档案" style="--archive-tint:${plant.bg};--archive-paper:${plant.bg};--archive-ink:${plant.sceneInk||plant.ink};--archive-muted:${plant.sceneFine||plant.ink}">
 <article class="archive-paper">
  <div class="archive-topline"><button class="archive-back" data-nav="${origin==='album'?'album':'home'}">← 返回${origin==='album'?'枝条放映室':'邮票馆'}</button><span>第 ${serial} 号</span></div>
  <header class="archive-masthead"><h2>农科枝报</h2><span class="archive-local">观察录</span></header>
  <div class="archive-dateline"><span>修剪之后，继续生长</span><span>田野植物志</span></div>
  <section class="archive-hero">
   <div class="archive-lead"><h1 data-archive-reveal>${plant.name}</h1><p class="archive-latin" data-archive-reveal>${plant.latin}</p><p class="archive-intro" data-archive-reveal>${plant.intro}</p></div>
   <figure class="archive-specimen"><div class="archive-plate"><img class="archive-branch" src="./assets/${plant.art}" alt="${plant.name}植物图版" draggable="false"><span class="archive-plate-seal" aria-hidden="true">一枝<br>新生</span></div><figcaption><span>植物图版</span><span>${plant.no}</span></figcaption></figure>
  </section>
  <section class="archive-briefs" aria-label="枝条资料"><div><span>枝条来处</span><p data-archive-reveal>${plant.source.replace(' · 演示','')}</p></div><div><span>照料提示</span><p data-archive-reveal>${plant.level}</p></div></section>
  <section class="archive-cultivation"><header class="archive-section-title"><span>栽植札记</span><h2 data-archive-reveal>安家，先做好这三件事</h2></header><div class="archive-care-columns">${notes.map(([title,copy],i)=>`<article class="archive-care-note"><figure>${archiveDiagram(plant,i)}<figcaption>${['光照','浇水',seedlingOnly?'安苗':'扦插'][i]}</figcaption></figure><div><h3 data-archive-reveal>${title}</h3><p data-archive-reveal>${copy}</p></div></article>`).join('')}</div></section>
  <section class="archive-story"><header class="archive-section-title"><span>枝条的下一站</span><h2 data-archive-reveal>从村里，到新的窗边</h2></header><ol class="archive-journey"><li>${journeyIcon(seedlingOnly?'post':'cut')}<span>${seedlingOnly?'村里育苗':'村里修剪'}</span></li><li>${journeyIcon('post')}<span>驿站整理</span></li><li>${journeyIcon('home')}<span>新家养护</span></li></ol><aside class="archive-news"><h3>生长手记</h3>${records.length?records.map(record=>`<article><time>${escape(record.date)}</time><h4 data-archive-reveal>${escape(record.title)}</h4>${record.photo?`<img class="archive-news-photo" src="${escape(record.photo)}" alt="${plant.name}的生长近况" loading="lazy">`:''}<p data-archive-reveal>${escape(record.text)}</p></article>`).join(''):'<p data-archive-reveal>新的近况，从你接过这一枝开始。安家后，在放映室留下一张生长明信片。</p>'}</aside></section>
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
  Array.from(unit).forEach(char=>{const glyph=document.createElement('span');glyph.className='archive-glyph';glyph.textContent=char;glyph.style.setProperty('--ink-delay',`${Math.min(index*(element.tagName==='H1'?65:13),650)}ms`);glyph.style.setProperty('--exit-delay',`${Math.min(index++*5,170)}ms`);group.append(glyph);});ink.append(group);
 });
 element.replaceChildren(accessible,ink);element.classList.add('archive-ink-ready');
}
export function mountArchive(){
 const root=document.querySelector('#app .archive-page');if(!root)return;
  const controller=new AbortController(),animations=new Set(),timers=new Set();let observer;
  const textSelectors='[data-archive-reveal],.archive-back,.archive-topline>span,.archive-masthead>span,.archive-masthead>h2,.archive-dateline>span,.archive-specimen figcaption>span,.archive-plate-seal,.archive-briefs span,.archive-section-title>span,.archive-care-note figcaption,.archive-journey li>span,.archive-news>h3,.archive-news time,.archive-receive .archive-section-label,.archive-pickup span,.archive-pickup strong,.archive-accept-label,.archive-accept-arrow';
  const textElements=[...root.querySelectorAll(textSelectors)];
  const ruleElements=[...root.querySelectorAll('.archive-masthead,.archive-dateline,.archive-briefs,.archive-care-columns,.archive-journey,.archive-receive')];
  ruleElements.forEach(element=>element.classList.add('archive-draw-rule'));
  const graphics=[...root.querySelectorAll('.archive-plate-seal,.archive-receive-mark,.archive-news-photo')];
  graphics.forEach(element=>element.classList.add('archive-draw-graphic'));
  const elements=[...new Set([...textElements,...ruleElements,...graphics,root.querySelector('.archive-accept')])];
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
  sketchObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting||!root.classList.contains('is-archive-awake'))return;sketchObserver.unobserve(entry.target);const item=sketches.get(entry.target);if(!item)return;const batch=item.lines.map((el,i)=>{const a=el.animate([{strokeDashoffset:el.style.strokeDashoffset},{strokeDashoffset:'0'}],{duration:1100,delay:i*38,easing:'cubic-bezier(.25,.1,.25,1)',fill:'both'});animations.add(a);return a;});Promise.allSettled(batch.map(a=>a.finished)).then(()=>{finishSketch(entry.target);batch.forEach(a=>{a.cancel();animations.delete(a);});});}),{threshold:.4});
 }
   const reveal=element=>{element.classList.add('is-ink-visible');observer?.unobserve(element);};
 if(!reduced()){
   root.classList.add('is-archive-staged');
   textElements.forEach(makeGlyphs);
   const opening=new Set(elements.filter(element=>element.getBoundingClientRect().top<innerHeight+80));
   const wake=()=>{
    if(root.classList.contains('is-archive-awake'))return;
    root.classList.add('is-archive-awake');
    [...opening].forEach(element=>{const top=element.getBoundingClientRect().top,delay=Math.min(380,Math.max(0,top/innerHeight*280));const timer=setTimeout(()=>{timers.delete(timer);reveal(element);},delay);timers.add(timer);});
    sketches.forEach((_,svg)=>sketchObserver.observe(svg));
   };
  observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
   if(!entry.isIntersecting)return;
    reveal(entry.target);
  }),{threshold:.12,rootMargin:'0px 0px -4% 0px'});
  if(arrival?.plantId===root.dataset.plant)root.classList.add('is-branch-arriving');
   elements.filter(element=>!opening.has(element)).forEach(element=>observer.observe(element));
   root.addEventListener('archive:unveil',wake,{signal:controller.signal});
   root.addEventListener('archive:landed',()=>{root.classList.remove('is-branch-arriving');wake();},{signal:controller.signal});
   if(!root.classList.contains('is-branch-arriving'))requestAnimationFrame(wake);
 }
 media.addEventListener('change',()=>{if(media.matches){observer?.disconnect();sketchObserver?.disconnect();[...sketches.keys()].forEach(finishSketch);elements.forEach(reveal);animations.forEach(animation=>animation.cancel());cancelArchiveEntry();}},{signal:controller.signal});
  dispose=()=>{controller.abort();observer?.disconnect();sketchObserver?.disconnect();[...sketches.keys()].forEach(finishSketch);vineSize.disconnect();timers.forEach(clearTimeout);animations.forEach(animation=>animation.cancel());};
}
export function cancelArchiveEntry(keepId=null){
 if(!arrival||(!arrival.returning&&arrival.plantId===keepId))return;
 const state=arrival;arrival=null;state.cancelled=true;state.stopLiquid?.();state.stopLens?.();state.animations.forEach(animation=>animation.cancel());state.overlay.remove();state.flightOverlay?.remove();
  if(state.source?.isConnected){state.source.style.visibility=state.visibility;state.source.classList.remove('is-portal-source','is-portal-print-hidden');if(state.original){state.original.style.transition=state.sourceTransition;state.original.classList.remove('is-portal-flat-print');}}
 if(state.sourcePage?.isConnected)state.sourcePage.inert=false;
 if(state.source?.isConnected)state.pausedFloat?.forEach(a=>{if(a.playState==='paused')a.play();});
 if(state.original?.isConnected)state.original.dispatchEvent(new Event('stamp:resume'));
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
   original.dispatchEvent(new Event('stamp:hold'));
   original.classList.add('is-portal-flat-print');
   const preparations=[animate(original,[{transform:getComputedStyle(original).transform},{transform:'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)'}],200).finished];
  original.querySelectorAll('.paper-strip').forEach(strip=>preparations.push(animate(strip,[{transform:getComputedStyle(strip).transform},{transform:'translateZ(0) rotateY(0deg) scaleX(1)'}],200).finished));
  if(lens)preparations.push(new Promise(resolve=>{const start=performance.now();function frame(now){if(state.cancelled){resolve();return;}const t=Math.min(1,(now-start)/200);lens.setAttribute('scale',String(Number(lensScale)*(1-t*t*(3-2*t))));if(t<1)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame);}));
  await Promise.all(preparations);if(state.cancelled)return;
  original.style.transition='none';original.dispatchEvent(new Event('stamp:reset'));
  const probe=document.createElement('div');probe.setAttribute('aria-hidden','true');probe.inert=true;Object.assign(probe.style,{position:'fixed',left:'0',top:'0',width:'100%',height:'100svh',overflow:'hidden',visibility:'hidden',pointerEvents:'none'});probe.innerHTML=renderArchive(plant,'home');document.body.append(probe);
  const destination=fittedImage(probe.querySelector('.archive-branch'),originalImage);probe.remove();
  const bounds=original.getBoundingClientRect(),start=fittedImage(originalImage),zoom=printZoom(original,bounds),shell=printLayer(original,bounds),flight=document.createElement('img');flight.className='branch-flight-plant';flight.src=originalImage.currentSrc||originalImage.src;flight.alt='';
  Object.assign(flight.style,{left:`${start.cx-destination.width/2}px`,top:`${start.cy-destination.height/2}px`,width:`${destination.width}px`,height:`${destination.height}px`,transform:`scale(${start.width/destination.width})`,filter:getComputedStyle(originalImage).filter});
  overlay.append(shell,flight);overlay.style.visibility='visible';overlay.dataset.flightStage='grow';source.classList.add('is-portal-print-hidden');
   const camera=animate(shell,[{transform:'scale(1)'},{transform:`scale(${zoom})`}],1320),hold={cx:destination.cx,cy:destination.cy,scale:1},base={cx:start.cx,cy:start.cy};
   const growth=animate(flight,flightFrames({...start,scale:start.width/destination.width},hold,base),1320);
   await new Promise(resolve=>setTimeout(resolve,690));if(state.cancelled)return;
   // The new folio begins writing while the specimen is still growing.
   navigate();
  let target;for(let i=0;i<40;i++){await new Promise(resolve=>requestAnimationFrame(resolve));if(state.cancelled)return;target=document.querySelector(`#app .archive-page[data-plant="${plant.id}"]`);if(target)break;}if(!target)return;
  const image=target.querySelector('.archive-branch');if(!image.complete)await image.decode().catch(()=>{});if(state.cancelled)return;
  await Promise.all([camera.finished,growth.finished]);if(state.cancelled)return;
  shell.remove();
   overlay.dataset.flightStage='place';
   // The folio places its specimen at the enlarged print's centre, so there is
   // no second downward flight after the stamp has filled the screen.
   target.dispatchEvent(new Event('archive:landed'));
   await animate(flight,[{opacity:1},{opacity:0}],360).finished;
 }catch{}finally{
   if(arrival===state){arrival=null;state.animations.forEach(a=>a.cancel());overlay.remove();state.restore();if(source.isConnected){source.style.visibility=state.visibility;source.classList.remove('is-portal-source','is-portal-print-hidden');original.style.transition=sourceTransition;original.classList.remove('is-portal-flat-print');state.pausedFloat.forEach(a=>a.play());original.dispatchEvent(new Event('stamp:resume'));}if(sourcePage?.isConnected)sourcePage.inert=false;document.querySelector('#app .archive-page')?.dispatchEvent(new Event('archive:landed'));}
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
 const flightOverlay=document.createElement('div');flightOverlay.className='branch-flight stamp-return-plant';
 const flight=document.createElement('img');flight.className='branch-flight-plant';
 flight.src=image.currentSrc||image.src;flight.alt='';
 Object.assign(flight.style,{left:from.left+'px',top:from.top+'px',width:from.width+'px',height:from.height+'px',filter:fromFilter});
 flightOverlay.append(flight);document.body.append(overlay,flightOverlay);
 const state={plantId:plant.id,returning:true,overlay,flightOverlay,animations:new Set(),cancelled:false,sourcePage:page};
 arrival=state;page.inert=true;
 const originalVisibility=image.style.visibility;image.style.visibility='hidden';
 let rendered=false,destination,home,lens,lensScale,floats=[],restored=false;
 // These control points are the time reverse of the stamp's entrance curve.
 const reverseEase='cubic-bezier(.78,0,.7,.95)';
 const animate=(element,frames,duration,easing=reverseEase)=>{
  const motion=element.animate(frames,{duration,easing,fill:'both'});
  state.animations.add(motion);return motion;
 };
 state.restore=()=>{
  if(restored)return;restored=true;
  if(image.isConnected)image.style.visibility=originalVisibility;
  if(page.parentElement===document.body)page.remove();
  else if(page.isConnected){page.style.visibility='';page.inert=false;}
  if(destination?.isConnected){destination.classList.remove('is-return-target');destination.querySelector('.stamp')?.dispatchEvent(new Event('stamp:resume'));}
  floats.forEach(motion=>{if(motion.playState==='paused')motion.play();});
  if(lens?.isConnected)lens.setAttribute('scale',lensScale);
  if(home?.isConnected)home.inert=false;
  flightOverlay.remove();
 };
 try{
  // The large print sits behind the folio; its specimen stays above it.
  // The two layers can then follow their entrance paths in reverse.
  Object.assign(page.style,{position:'fixed',top:`${-window.scrollY}px`,left:'0',width:'100%',height:'100svh',boxSizing:'border-box',overflow:'hidden',zIndex:'70',pointerEvents:'none'});
  document.body.append(page);
  renderDestination();rendered=true;if(state.cancelled)return;
  home=document.querySelector('.home-scene');destination=home?.querySelector('.scene-stamp.current');
  const stamp=destination?.querySelector('.stamp'),stampImage=stamp?.querySelector('.stamp-art');
  if(!stampImage)throw new Error('Return stamp is missing');
  home.inert=true;destination.classList.add('is-return-target');stamp.dispatchEvent(new Event('stamp:hold'));floats=pauseFloat(stamp);
  lens=home.querySelector('.scene-lens-displacement');lensScale=lens?.getAttribute('scale');
  if(lens)lens.setAttribute('scale','0');
  if(!stampImage.complete)await stampImage.decode();if(state.cancelled)return;
  const to=fittedImage(stampImage,image),base={cx:from.cx,cy:from.cy},targetFilter=getComputedStyle(stampImage).filter;
  const frames=flightFrames({...from,scale:1},{cx:to.cx,cy:to.cy,scale:to.width/from.width},base);
  frames[0].filter=fromFilter;frames[1].filter=targetFilter;
  const bounds=stamp.getBoundingClientRect(),zoom=printZoom(stamp,bounds),shell=printLayer(stamp,bounds);
  shell.style.transform=`scale(${zoom})`;overlay.append(shell);
  // Lettering erases before the folio yields to the print underneath. The
  // frame and branch then recede together for the full 1320 ms journey.
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  if(state.cancelled)return;
  page.classList.add('is-archive-dispersing');
  const paperClear=animate(page,[{opacity:1,offset:0},{opacity:1,offset:.35},{opacity:0,offset:.55},{opacity:0,offset:1}],1320,'linear');
  const printReturn=animate(shell,[{transform:`scale(${zoom})`},{transform:'scale(1)'}],1320);
  const plantReturn=animate(flight,frames,1320);
  if(lens){
   let lensFrame=0,start;
   state.stopLens=()=>cancelAnimationFrame(lensFrame);
   const restoreLens=now=>{
    if(state.cancelled)return;
    start??=now;const t=Math.max(0,Math.min(1,(now-start-1080)/240));
    lens.setAttribute('scale',String(Number(lensScale)*t*t*(3-2*t)));
    if(t<1)lensFrame=requestAnimationFrame(restoreLens);
   };
   lensFrame=requestAnimationFrame(restoreLens);
  }
  await Promise.all([paperClear.finished,printReturn.finished,plantReturn.finished]);if(state.cancelled)return;
  // Exchange the drawn copy for the live stamp in one paint.
  destination.classList.remove('is-return-target');overlay.remove();flightOverlay.remove();
 }catch(error){
  if(!state.cancelled){console.error('报纸返回动画失败',error);if(!rendered)renderDestination();}
 }finally{
  state.stopLens?.();state.animations.forEach(motion=>motion.cancel());overlay.remove();flightOverlay.remove();state.restore();if(arrival===state)arrival=null;
 }
}
