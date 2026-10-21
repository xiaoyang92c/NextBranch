import {hydrateRecordVideos,releaseRecordVideos} from './record-media.js';
import {careLessons,careScene} from './tv-care.js?v=20261021-4';
const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
let chosenId=null,channel='care',film=0,dispose=()=>{};
export const albumBackground=()=>({care:'#cbd8b9',growth:'#b8cfc4',archive:'#d8d6b5'}[channel]);
export function cleanupAlbumDesk(){dispose();dispose=()=>{};}
const claimFor=(data,id)=>[...data.claims].reverse().find(claim=>claim.plantId===id&&claim.status==='claimed');
const topicLabels=plant=>['光照','浇水',['podocarpus','citron','five-lobed-maple','ginkgo'].includes(plant.id)?'安苗':'扦插'];
const modes={care:'养护放映',growth:'生长回放',archive:'植物档案'};
export function renderAlbumDesk(plants,stamp,data){
 if(!plants.some(plant=>plant.id===chosenId))chosenId=data.claims.find(claim=>claim.status==='claimed')?.plantId||plants[0].id;
 return `<main class="page album-page album-desk" aria-label="枝条放映室"><svg width="0" height="0" class="tv-optical-defs" aria-hidden="true"><defs><filter id="tv-signal-warp" x="-5%" y="-8%" width="110%" height="116%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".006 .035" numOctaves="1" seed="5" result="signal-noise"/><feDisplacementMap class="tv-warp-map" in="SourceGraphic" in2="signal-noise" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter></defs></svg><section class="album-tv"><div class="tv-glass" role="region" aria-label="植物放映内容"><div class="tv-screen-content">
 <header class="tv-remote"><div class="tv-program-keys" role="tablist" aria-label="放映节目">${Object.entries(modes).map(([id,label],index)=>`<button role="tab" data-tv-mode="${id}" aria-selected="${channel===id}" aria-controls="tv-plant-panel"><span class="tv-key-label">${['养护','近况','档案'][index]}</span></button>`).join('')}</div><span class="tv-channel-code" data-type></span></header>
 <div class="tv-program-shell"><div class="tv-program" id="tv-plant-panel" role="tabpanel"></div></div>
 <footer class="tv-frequency" aria-label="循环植物刻度"><div class="tv-dial-pointer" aria-hidden="true"><i></i></div><div class="tv-dial-window" role="tablist" aria-label="植物调台刻度"><div class="tv-stations"></div></div></footer>
 </div><span class="tv-reflection" aria-hidden="true"></span><span class="tv-scanlines" aria-hidden="true"></span><span class="tv-interference" aria-hidden="true"></span><span class="tv-static" aria-hidden="true"></span></div></section><span class="album-live" role="status" aria-live="polite"></span></main>`;
}
export function mountAlbumDesk({plants,getData,onClaim,onSaveGrowth,onDeleteGrowth,onArchive}){
 const root=document.querySelector('.album-desk');if(!root)return;
 const compact=matchMedia('(max-width:799px), (pointer:coarse)');
 const controller=new AbortController(),signal=controller.signal,animations=new Set(),reveals=new Set(),program=root.querySelector('.tv-program'),shell=root.querySelector('.tv-program-shell'),dial=root.querySelector('.tv-dial-window'),track=root.querySelector('.tv-stations');
 let warpFrame=0;let operation=0,content=null,renderKey='',swipe=null,dialDrag=null,ignoreClick=0,tunerAnimation=null,recordDialog=null,recordPreviewUrl='',recordFocus=null,bodyOverflow='',fittedScene=null,fittedSize='';
 const wrap=value=>(value%plants.length+plants.length)%plants.length;
 const selected=()=>plants.find(plant=>plant.id===chosenId)||plants[0];
 const selectedIndex=()=>plants.findIndex(plant=>plant.id===chosenId);
 const animate=(element,frames,options)=>{
  const {hold=false,...settings}=options;
  // Step each segment, not the whole effect: a one-step effect easing would
  // freeze at the first frame and skip every intermediate signal dropout.
  if(settings.easing==='steps(1,end)'){frames=frames.map(frame=>({...frame,easing:'steps(1,end)'}));settings.easing='linear';}
  const animation=element.animate(frames,{fill:'both',...settings});animations.add(animation);animation.finished.finally(()=>{if(!hold){animations.delete(animation);animation.cancel();}}).catch(()=>{});return animation;
 };
 function fitSceneArt(){
  const svg=program.querySelector('.care-lesson-scene'),composition=svg?.querySelector('.care-scene-composition');if(!composition)return;
  const size=`${svg.clientWidth}x${svg.clientHeight}`;
  if(!svg.clientWidth||!svg.clientHeight||svg===fittedScene&&size===fittedSize)return;
  fittedScene=svg;fittedSize=size;
  const width=480,height=320,art=composition.querySelector('.care-scene-art'),artBox=art.getBBox();
  const labelY=Math.max(12,Math.min(38,artBox.y-28));
  svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
  // Keep every plant on the same canvas and the annotation type at one optical size.
  const scale=Math.min(svg.clientWidth/width,svg.clientHeight/height);
  if(scale>0)svg.style.setProperty('--care-svg-type-size',`${12.5/scale}px`);
  const leaves=[...art.querySelectorAll('.care-leaf')];
  svg.querySelectorAll('.scene-callout').forEach((callout,index)=>{
   const leader=callout.querySelector('.care-leader'),text=callout.querySelector('text'),labelX=index===0?120:360,target=leader.dataset.target.split(',').map(Number),via=leader.dataset.via?leader.dataset.via.split(' ').map(pair=>pair.split(',').map(Number)):[];
   text.setAttribute('x',labelX);text.setAttribute('y',labelY);
   const stemY=Math.min(labelY+22,Math.max(labelY+14,target[1]-12));
   const points=[[labelX,labelY+10],[labelX,stemY],...via],last=points.at(-1),distance=Math.hypot(target[0]-last[0],target[1]-last[1]),gap=Math.min(11,distance*.35);
   if(distance)points.push([target[0]+(last[0]-target[0])*gap/distance,target[1]+(last[1]-target[1])*gap/distance]);
   leader.setAttribute('d',points.map(([px,py],index)=>`${index?'L':'M'}${px} ${py}`).join(''));
   // Stop the dotted annotation before the first leaf it meets, including
   // labels whose nominal target lies inside a full leaf silhouette.
   const matrix=leader.getScreenCTM(),length=leader.getTotalLength();
   const leafTransforms=matrix?leaves.map(leaf=>{
    const leafMatrix=leaf.getScreenCTM();
    return leafMatrix?{leaf,transform:leafMatrix.inverse().multiply(matrix)}:null;
   }).filter(Boolean):[];
   if(leafTransforms.length&&length){
    let stop=length;
    for(let at=0;at<=length;at+=2){
     const point=leader.getPointAtLength(at);
     if(leafTransforms.some(({leaf,transform})=>leaf.isPointInFill(point.matrixTransform(transform)))){stop=at;break;}
    }
    if(stop<length){
     const safe=Math.max(0,stop-12),clipped=[points[0]];let walked=0;
     for(let part=1;part<points.length;part++){
      const from=points[part-1],to=points[part],span=Math.hypot(to[0]-from[0],to[1]-from[1]);
      if(walked+span>=safe){const ratio=span?Math.max(0,(safe-walked)/span):0;clipped.push([from[0]+(to[0]-from[0])*ratio,from[1]+(to[1]-from[1])*ratio]);break;}
      clipped.push(to);walked+=span;
     }
     leader.setAttribute('d',clipped.map(([px,py],part)=>`${part?'L':'M'}${px} ${py}`).join(''));
    }
   }
  });
  composition.removeAttribute('transform');
  const box=composition.getBBox();
  if(box.width&&box.height)composition.setAttribute('transform',`translate(${width/2-box.x-box.width/2} ${height/2-box.y-box.height/2})`);
 }
 const sceneSizer=new ResizeObserver(fitSceneArt);sceneSizer.observe(program);
 function typeText(scope){
  if(reduced())return;
  scope.querySelectorAll('.tv-story-action').forEach(button=>{
   if(button.querySelector('.tv-story-label'))return;
   const label=button.firstChild;
   if(label?.nodeType!==Node.TEXT_NODE||!label.textContent.trim())return;
   const span=document.createElement('span');span.className='tv-story-label';span.setAttribute('data-type','');span.textContent=label.textContent.trim();label.replaceWith(span);
  });
  scope.querySelectorAll('.growth-count,.growth-rec,.growth-awaiting>span,.growth-image-caption,.growth-viewfinder-date,.growth-date,.growth-adjust-action,.growth-pages button,.tv-dossier>header>span,.tv-dossier-body dt,.tv-dossier-body dd').forEach(element=>element.setAttribute('data-type',''));
  let order=0;const actionRevealEnds=new WeakMap();
  scope.querySelectorAll('[data-type]').forEach(element=>{
   if(element.dataset.typed==='true')return;element.dataset.typed='true';
   const baseDelay=Number(element.dataset.typeDelay||0)+order++*85;
   const value=element.textContent,svg=element.namespaceURI==='http://www.w3.org/2000/svg';
   element.dataset.typeText=value;
   const letters=[...value].map(letter=>{
    const glyph=svg?document.createElementNS('http://www.w3.org/2000/svg','tspan'):document.createElement('span');
    glyph.classList.add('tv-typed-glyph');glyph.setAttribute('aria-hidden','true');glyph.textContent=letter;
    return glyph;
   });
   if(svg){element.setAttribute('aria-label',value);element.replaceChildren(...letters);}
   else{const accessible=document.createElement('span');accessible.className='tv-accessible';accessible.textContent=value;element.replaceChildren(accessible,...letters);}
   const step=channel==='care'?32:Math.min(32,1600/Math.max(letters.length,1));
   const action=element.closest('.tv-story-action'),previousEnd=action?actionRevealEnds.get(action):undefined;
   const delay=previousEnd===undefined?baseDelay:Math.max(baseDelay,previousEnd+55);
   if(action)actionRevealEnds.set(action,delay+Math.max(0,letters.length-1)*step);
   letters.forEach((glyph,index)=>{
    animate(glyph,[{opacity:0},{opacity:1}],{duration:1,delay:70+delay+index*step,fill:'backwards',easing:'steps(1,end)'});
   });
  });
 }
 function drawScene(){
  const svg=program.querySelector('.broadcast-diagram');if(!svg||reduced())return;
  const showPreparedScene=()=>requestAnimationFrame(()=>{if(svg.isConnected)svg.classList.remove('is-drawing-pending');});
  const animateMarker=(shape,style,delay,duration)=>{
   if(!shape.hasAttribute('marker-end'))return ()=>{};
   const previous=shape.style.markerEnd;shape.style.markerEnd='none';
   const length=shape.getTotalLength(),tip=shape.getPointAtLength(length),before=shape.getPointAtLength(Math.max(0,length-8));
   const angle=Math.atan2(tip.y-before.y,tip.x-before.x),ux=Math.cos(angle),uy=Math.sin(angle);
   // Match the SVG marker's 10-unit viewBox, 4-unit size and 1.6-unit stroke.
   const markerScale=(Number.parseFloat(style.strokeWidth)||2)*.4,wing=4*markerScale,back=7*markerScale;
   const left=[tip.x-ux*back-uy*wing,tip.y-uy*back+ux*wing],right=[tip.x-ux*back+uy*wing,tip.y-uy*back-ux*wing];
   const head=document.createElementNS('http://www.w3.org/2000/svg','path');
   head.setAttribute('d',`M${left[0]} ${left[1]}L${tip.x} ${tip.y}L${right[0]} ${right[1]}`);
   head.setAttribute('fill','none');head.setAttribute('stroke',style.stroke);head.setAttribute('stroke-width',String(1.6*markerScale));
   head.setAttribute('stroke-linecap','round');head.setAttribute('stroke-linejoin','round');
   shape.before(head);
   const arrowLength=head.getTotalLength();head.style.strokeDasharray=`${arrowLength} ${arrowLength}`;head.style.strokeDashoffset=String(arrowLength);
   const drawing=animate(head,[{strokeDashoffset:arrowLength},{strokeDashoffset:0}],{duration:220,delay:delay+duration-240,easing:'ease-out',hold:true});
   return ()=>{shape.style.markerEnd=previous;head.remove();animations.delete(drawing);drawing.cancel();};
  };
  // Draw solid contours directly and mask only dashed paths. This keeps the
  // original path reveal while avoiding a mask layer for every desktop shape.
  {
   const strokeDuration=compact.matches?960:1050;
   // Measure the scene before inserting masks and animated fills, so those
   // writes cannot force a fresh style/layout pass for every following path.
   const shapes=[...svg.querySelectorAll('path,circle,rect,ellipse,line,polyline')]
    .filter(shape=>!shape.closest('defs')&&!shape.matches('.care-anchor'))
    .map((shape,index)=>{
     const computed=getComputedStyle(shape);
     return {shape,index,style:{stroke:computed.stroke,strokeWidth:computed.strokeWidth,strokeDasharray:computed.strokeDasharray,fill:computed.fill,fillOpacity:computed.fillOpacity},length:shape.getTotalLength?.()||0};
    });
   const ns='http://www.w3.org/2000/svg',defs=document.createElementNS(ns,'defs');svg.prepend(defs);
   shapes.forEach(({shape,index,style,length})=>{
    const delay=shape.matches('.care-leader')?190:60+Math.min(index,18)*30;
    const dashed=style.stroke!=='none'&&style.strokeDasharray!=='none';
    if(shape.matches('.broadcast-soil,.broadcast-soil-dots circle,.scene-root-tips circle')){
     animate(shape,[{opacity:0},{opacity:1}],{duration:650,delay:delay+400,easing:'ease-out'});return;
    }
    if(style.fill!=='none'&&Number(style.fillOpacity)>0){
     if(dashed){
      const wash=shape.cloneNode(false);wash.removeAttribute('id');wash.classList.add('care-entry-fill');
      Object.assign(wash.style,{stroke:'none',fill:style.fill,fillOpacity:style.fillOpacity,pointerEvents:'none'});
      shape.before(wash);shape.style.fill='none';
      animate(wash,[{opacity:0},{opacity:1}],{duration:820,delay:delay+180,easing:'cubic-bezier(.2,.65,.3,1)'});
     }else animate(shape,[{fillOpacity:0},{fillOpacity:style.fillOpacity}],{duration:820,delay:delay+180,easing:'cubic-bezier(.2,.65,.3,1)'});
    }
    if(style.stroke==='none'||!length)return;
    const restoreMarker=animateMarker(shape,style,delay,strokeDuration);
    if(dashed){
     const mask=document.createElementNS(ns,'mask'),ink=shape.cloneNode(false),holder=document.createElementNS(ns,'g');
     const id=`scene-dashes-${operation}-${index}`;mask.id=id;
     for(const [key,value] of Object.entries({maskUnits:'userSpaceOnUse',x:'-500',y:'-500',width:'1500',height:'1500'}))mask.setAttribute(key,value);
     ink.removeAttribute('class');ink.removeAttribute('style');ink.removeAttribute('pathLength');ink.removeAttribute('marker-end');ink.removeAttribute('marker-start');ink.removeAttribute('marker-mid');
     // Use the path's real units. Normalized pathLength is ignored in some SVG
     // mask implementations and exposed tiny bits of every dotted leader.
     for(const [key,value] of Object.entries({fill:'none',stroke:'white','stroke-width':'7','stroke-linecap':'butt','stroke-linejoin':'round','stroke-dasharray':`${length} ${length}`,'stroke-dashoffset':String(length)}))ink.setAttribute(key,value);
     mask.append(ink);defs.append(mask);shape.before(holder);holder.append(shape);holder.setAttribute('mask',`url(#${id})`);
     const drawing=animate(ink,[{strokeDashoffset:length},{strokeDashoffset:0}],{duration:strokeDuration,delay,easing:'cubic-bezier(.3,0,.25,1)',hold:true});
     const finish=()=>{holder.removeAttribute('mask');restoreMarker();mask.remove();reveals.delete(finish);animations.delete(drawing);drawing.cancel();};
     reveals.add(finish);drawing.finished.then(finish).catch(()=>{});
     return;
    }
    const oldDash=shape.style.strokeDasharray,oldOffset=shape.style.strokeDashoffset;
    shape.style.strokeDasharray=`${length} ${length}`;
    shape.style.strokeDashoffset=String(length);
    const drawing=animate(shape,[{strokeDashoffset:length},{strokeDashoffset:0}],{duration:strokeDuration,delay,easing:'cubic-bezier(.3,0,.25,1)',hold:true});
    const finish=()=>{
     shape.style.strokeDasharray=oldDash;shape.style.strokeDashoffset=oldOffset;
     restoreMarker();
     reveals.delete(finish);animations.delete(drawing);drawing.cancel();
    };
    reveals.add(finish);drawing.finished.then(finish).catch(()=>{});
   });
   showPreparedScene();return;
  }
 }
 function frames(){
  const plant=selected(),data=getData(),claim=claimFor(data,plant.id),records=data.postcards.filter(record=>record.plantId===plant.id);
  if(channel==='care')return careLessons[plant.id].map(([title,text,aside],index)=>({title,text,aside,topic:['light','water','roots'][index]}));
  if(channel==='growth'){
   if(claim&&records.length)return records.map((record,index)=>({title:record.status,text:record.text,date:record.date,photo:record.photo,videoId:record.videoId,record:index+1,total:records.length,recordId:record.id,editable:!record.demo,claimDate:claim.date,action:'record',actionLabel:'再记一段'}));
   if(claim)return [{title:'第一段近况，等你记录',text:'这一枝已经安家。写下今天的观察，也可以加上照片或视频。',date:claim.date,empty:true,claimed:true,action:'record',actionLabel:'记录近况'}];
   const reserved=data.claims.some(item=>item.plantId===plant.id);
   return [{title:reserved?'等这一枝到家':'这段生长，还没开始',text:reserved?'线下领取后，就能在这里记录它的变化。':'接过一枝植物，再留下它的第一段影像。',empty:true,action:'claim',actionLabel:reserved?'查看领取邮单':'接收这一枝'}];
  }
  return [{title:plant.name,text:plant.intro,action:'archive',actionLabel:'打开完整档案'}];
 }
 const copyMarkup=()=>`<span class="care-subtitle-index" data-type>${topicLabels(selected())[film]}</span><h2 data-type>${escape(content.title)}</h2><p data-type>${escape(content.text)}</p>`;
 function careMarkup(plant){return `<section class="care-program"><header class="care-heading"><div><h1 data-type>${plant.name}</h1><i data-type>${plant.latin}</i></div><div class="care-difficulty"><strong>养护难度</strong><span data-type>${plant.level}</span></div></header><div class="care-stage">${careScene(plant,film)}</div><div class="care-bottom"><div class="care-copy">${copyMarkup()}</div><div class="care-topics" role="group" aria-label="选择养护场景">${topicLabels(plant).map((label,index)=>`<button data-care-frame="${index}" aria-pressed="${film===index}"><span class="tv-key-label">${label}</span></button>`).join('')}</div></div></section>`;}
 function growthMarkup(plant,frame=content){
  const content=frame;
  const photo=content.photo?escape(content.photo):`./assets/${plant.art}`;
 return `<section class="growth-program"><header class="growth-program-head"><h1 data-type>${plant.name}的近况</h1><span class="growth-count">${content.record?`TAPE ${String(content.record).padStart(2,'0')} / ${String(content.total).padStart(2,'0')}`:'NO TAPE'}</span></header><div class="growth-layout"><div class="growth-viewfinder"><span class="growth-rec">${content.photo||content.videoId?'● REC':'▷ PLAY'}</span><i class="viewfinder-corner"></i><i class="viewfinder-corner"></i><i class="viewfinder-corner"></i><i class="viewfinder-corner"></i>${content.empty?`<div class="growth-awaiting"><svg class="growth-test-card" viewBox="0 0 180 126" aria-hidden="true"><rect x="12" y="8" width="156" height="110"/><path d="M12 35H168M12 91H168M38 8V35M64 8V35M90 8V35M116 8V35M142 8V35M12 104H168M12 111H168"/><path class="test-card-band" d="M12 8H38V35H12ZM64 8H90V35H64ZM116 8H142V35H116Z"/><circle cx="90" cy="63" r="24"/><path d="M54 63H126M90 37V89"/></svg><span>等待第一段生长影像</span></div>`:`${content.videoId?`<video class="growth-picture is-photo" data-record-video="${escape(content.videoId)}" controls playsinline preload="metadata" aria-label="${plant.name}的近况视频"></video>`:`<img class="growth-picture ${content.photo?'is-photo':''}" src="${photo}" alt="${content.photo?'植物近况照片':plant.name+'的图鉴画面'}">`}<span class="growth-image-caption">${content.videoId?'生长视频':content.photo?'生长照片':'图鉴画面'}</span>`}<span class="growth-viewfinder-date">${escape(content.date||plant.no)}</span></div><article class="growth-observation"><div class="growth-observation-meta"><span class="growth-date">${escape(content.date||'尚未录入')}</span>${content.editable?'<button class="growth-adjust-action" data-tv-action="edit-record" aria-label="调整这段近况">调整记录 ↗</button>':''}</div><h2 data-type>${escape(content.title)}</h2><p data-type>${escape(content.text)}</p><div class="growth-action-row"><div class="growth-record-actions"><button class="tv-story-action" data-tv-action="${content.action}"><span class="tv-story-caret" data-type aria-hidden="true">▷</span><span class="tv-story-label" data-type>${content.actionLabel}</span><span class="tv-story-arrow" data-type aria-hidden="true">↗</span></button></div>${content.total>1?'<nav class="growth-pages" aria-label="翻阅近况"><button data-tv-action="previous" aria-label="上一段近况">上一段</button><button data-tv-action="next" aria-label="下一段近况">下一段</button></nav>':''}</div></article></div></section>`;
 }
 function archiveMarkup(plant){return `<section class="tv-dossier"><header><span>FIELD FILE / ${plant.no}</span><span>农科村植物资料</span></header><div class="tv-dossier-body"><figure class="tv-dossier-plate"><div class="tv-dossier-art"><img src="./assets/${plant.art}" alt="${plant.name}植物插画"></div><figcaption class="tv-dossier-name"><h1 data-type>${plant.name}</h1><i data-type>${plant.latin}</i></figcaption></figure><article><p data-type>${plant.intro}</p><dl><div><dt>光照</dt><dd data-type>${plant.light}</dd></div><div><dt>难度</dt><dd>${plant.level}</dd></div><div><dt>来源</dt><dd>${plant.source.replace(' · 演示','')}</dd></div></dl><button class="tv-story-action" data-tv-action="archive"><span class="tv-story-caret" data-type aria-hidden="true">▷</span><span class="tv-story-label" data-type>打开完整档案</span><span class="tv-story-arrow" data-type aria-hidden="true">↗</span></button></article></div></section>`;}
 const programFields={
  growth:[
   {selector:'.growth-program-head h1',kind:'text'},
   {selector:'.growth-count',kind:'text'},
   {selector:'.growth-rec',kind:'text'},
   {selector:'.growth-awaiting, .growth-picture',kind:'node',parent:'.growth-viewfinder',before:'.growth-image-caption, .growth-viewfinder-date'},
   {selector:'.growth-image-caption',kind:'text',parent:'.growth-viewfinder',before:'.growth-viewfinder-date'},
   {selector:'.growth-viewfinder-date',kind:'text'},
   {selector:'.growth-date',kind:'text'},
   {selector:'.growth-adjust-action',kind:'text',parent:'.growth-observation-meta'},
   {selector:'.growth-observation h2',kind:'text'},
   {selector:'.growth-observation p',kind:'text'},
   {selector:'.growth-record-actions .tv-story-action',kind:'node'},
   {selector:'.growth-pages',kind:'node',parent:'.growth-action-row'}
  ],
  archive:[
   {selector:'.tv-dossier>header>span:first-child',kind:'text'},
   {selector:'.tv-dossier>header>span:last-child',kind:'text'},
   {selector:'.tv-dossier-art img',kind:'node'},
   {selector:'.tv-dossier-name h1',kind:'text'},
   {selector:'.tv-dossier-name i',kind:'text'},
   {selector:'.tv-dossier-body article>p',kind:'text'},
   {selector:'.tv-dossier-body dl>div:nth-child(1) dt',kind:'text'},
   {selector:'.tv-dossier-body dl>div:nth-child(1) dd',kind:'text'},
   {selector:'.tv-dossier-body dl>div:nth-child(2) dt',kind:'text'},
   {selector:'.tv-dossier-body dl>div:nth-child(2) dd',kind:'text'},
   {selector:'.tv-dossier-body dl>div:nth-child(3) dt',kind:'text'},
   {selector:'.tv-dossier-body dl>div:nth-child(3) dd',kind:'text'},
   {selector:'.tv-dossier .tv-story-action',kind:'node'}
  ]
 };
 const visibleText=element=>element?.dataset.typeText??element?.textContent??'';
 function programPlan(){
  const items=frames(),nextIndex=((film%items.length)+items.length)%items.length,nextFrame=items[nextIndex],plant=selected();
  const preview=document.createElement('div');preview.innerHTML=channel==='growth'?growthMarkup(plant,nextFrame):archiveMarkup(plant);
  const nextSection=preview.firstElementChild;
  const entries=programFields[channel].map(field=>{
   const old=program.querySelector(field.selector),next=nextSection.querySelector(field.selector);
   let same=old===null&&next===null;
   if(old&&next){
    if(field.kind==='text')same=visibleText(old)===next.textContent;
    else if(old.matches('.growth-awaiting')&&next.matches('.growth-awaiting'))same=visibleText(old.querySelector('span'))===next.querySelector('span')?.textContent;
    else if(old.matches('video')&&next.matches('video'))same=old.dataset.recordVideo===next.dataset.recordVideo;
    else if(old.matches('img')&&next.matches('img'))same=old.getAttribute('src')===next.getAttribute('src')&&old.getAttribute('alt')===next.getAttribute('alt');
    else if(old.matches('.growth-pages')&&next.matches('.growth-pages'))same=[...old.querySelectorAll('button')].map(button=>`${button.dataset.tvAction}:${visibleText(button)}`).join('|')===[...next.querySelectorAll('button')].map(button=>`${button.dataset.tvAction}:${button.textContent}`).join('|');
    else if(old.matches('button')&&next.matches('button'))same=old.dataset.tvAction===next.dataset.tvAction&&visibleText(old.querySelector('.tv-story-label')||old)===(next.querySelector('.tv-story-label')?.textContent??next.firstChild?.textContent?.trim());
    else same=old.outerHTML===next.outerHTML;
   }
   return {...field,old,next,changed:!same};
  });
  return {nextIndex,nextFrame,entries};
 }
 function paintProgramPlan(plan){
  if(plan.entries.some(entry=>entry.changed&&entry.selector==='.growth-awaiting, .growth-picture'))releaseRecordVideos();
  film=plan.nextIndex;content=plan.nextFrame;
  const incoming=[],stable=[];
  plan.entries.forEach(entry=>{
   const {old,next,kind}=entry;
   if(!entry.changed){if(old)stable.push(old);return;}
   if(kind==='text'&&old&&next&&old.tagName===next.tagName){
    old.textContent=next.textContent;old.setAttribute('data-type','');delete old.dataset.typed;delete old.dataset.typeText;incoming.push(old);return;
   }
   const replacement=next?.cloneNode(true)||null;
   if(replacement&&kind==='text')replacement.setAttribute('data-type','');
   if(old)old.replaceWith(...(replacement?[replacement]:[]));
   else if(replacement){
    const parent=program.querySelector(entry.parent);
    parent?.insertBefore(replacement,entry.before?parent.querySelector(entry.before):null);
   }
   if(replacement)incoming.push(replacement);
  });
  renderKey=`${channel}:${chosenId}`;updateControls();hydrateRecordVideos(program);
  return {incoming,stable};
 }
 function programPieces(){
  const section=program.firstElementChild;if(!section)return [];
  const selectors=section.matches('.care-program')
   ?['.care-heading','.care-stage','.care-copy','.care-topics']
   :section.matches('.growth-program')
    ?['.growth-program-head h1','.growth-count','.growth-rec','.viewfinder-corner','.growth-test-card','.growth-awaiting>span','.growth-picture','.growth-image-caption','.growth-viewfinder-date','.growth-date','.growth-adjust-action','.growth-observation h2','.growth-observation p','.growth-record-actions .tv-story-action','.growth-pages button']
    :[':scope>header>span','.tv-dossier-art img','.tv-dossier-name h1','.tv-dossier-name i','.tv-dossier-body article>p','.tv-dossier-body dt','.tv-dossier-body dd','.tv-dossier .tv-story-action'];
  return selectors.flatMap(selector=>[...section.querySelectorAll(selector)]);
 }
 function revealNewPieces(elements){
  const pieces=elements.flatMap(element=>{
   if(element.matches('.growth-awaiting'))return [...element.querySelectorAll('svg')];
   if(element.matches('.growth-pages'))return [...element.querySelectorAll('button')];
   if(element.matches('.tv-story-action'))return [...element.querySelectorAll(':scope>span:not(.tv-story-label)')];
   return [element];
  }).filter(element=>!element.hasAttribute('data-type')&&!element.querySelector('[data-type]'));
  pieces.forEach((element,index)=>{
   animate(element,[{clipPath:'inset(0 100% 0 0)',transform:'translateX(4px)'},{clipPath:'inset(0 0% 0 0)',transform:'translateX(0)'}],{duration:460,delay:65+index*95,easing:'cubic-bezier(.18,.7,.2,1)'});
  });
 }
 function updateControls(){
  root.dataset.channel=channel;root.dataset.topic=content.topic||'';program.setAttribute('aria-label',`${selected().name} · ${modes[channel]}`);
  root.querySelectorAll('[data-tv-mode]').forEach(button=>button.setAttribute('aria-selected',String(button.dataset.tvMode===channel)));
  const code=root.querySelector('.tv-channel-code'),value=`CH ${String(selectedIndex()+1).padStart(2,'0')}`;
  if(code.dataset.value!==value){code.dataset.value=value;delete code.dataset.typed;code.textContent=value;}
  root.querySelectorAll('[data-care-frame]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.careFrame)===film)));
  root.querySelector('.album-live').textContent=`${selected().name}，${modes[channel]}${channel==='care'?'，'+topicLabels(selected())[film]:''}`;
 }
 function paint(careUpdate=false){
  releaseRecordVideos();
  const items=frames();film=((film%items.length)+items.length)%items.length;content=items[film];const plant=selected();
  if(careUpdate&&program.querySelector('.care-program')){
   const setChanged=(element,value,force=false)=>{
    if(element&&(force||(element.dataset.typeText??element.textContent)!==value)){element.textContent=value;delete element.dataset.typed;delete element.dataset.typeText;}
   };
   setChanged(program.querySelector('.care-heading h1'),plant.name);
   setChanged(program.querySelector('.care-heading i'),plant.latin);
   setChanged(program.querySelector('.care-difficulty span'),plant.level);
   setChanged(program.querySelector('.care-subtitle-index'),topicLabels(plant)[film],true);
   setChanged(program.querySelector('.care-copy h2'),content.title);
   setChanged(program.querySelector('.care-copy p'),content.text);
   program.querySelectorAll('.care-topics .tv-key-label').forEach((label,index)=>{
    const value=topicLabels(plant)[index];
    if((label.dataset.typeText??label.textContent)!==value)label.setAttribute('data-type','');
    setChanged(label,value);
   });
   program.querySelector('.care-stage').innerHTML=careScene(plant,film);
  }
  else program.innerHTML=channel==='care'?careMarkup(plant):channel==='growth'?growthMarkup(plant):archiveMarkup(plant);
  if(channel==='care'&&!reduced())program.querySelector('.broadcast-diagram')?.classList.add('is-drawing-pending');
  renderKey=`${channel}:${chosenId}`;updateControls();fitSceneArt();hydrateRecordVideos(program);
 }
 function closeRecordEditor(immediate=false){
  if(!recordDialog)return;
  const dialog=recordDialog,sheet=dialog.querySelector('.growth-editor'),focus=recordFocus,previousOverflow=bodyOverflow;
  recordDialog=null;recordFocus=null;document.body.style.overflow=previousOverflow;
  if(recordPreviewUrl){URL.revokeObjectURL(recordPreviewUrl);recordPreviewUrl='';}
  if(immediate||reduced()){dialog.remove();focus?.focus({preventScroll:true});return;}
  const curtain=dialog.animate([{backgroundColor:'rgba(21,46,39,.76)'},{backgroundColor:'rgba(21,46,39,0)'}],{duration:460,easing:'ease-in',fill:'forwards'});
  const departure=sheet.animate([{transform:'translateY(0)'},{transform:'translateY(105%)'}],{duration:460,easing:'cubic-bezier(.55,0,.85,.55)',fill:'forwards'});
  Promise.allSettled([curtain.finished,departure.finished]).then(()=>{dialog.remove();focus?.focus({preventScroll:true})});
 }
 function openRecordEditor(edit=false){
  if(recordDialog)return;
  const plant=selected(),existing=edit&&content.editable?getData().postcards.find(item=>item.id===content.recordId&&!item.demo):null;
  recordFocus=document.activeElement;bodyOverflow=document.body.style.overflow;
  recordDialog=document.createElement('div');recordDialog.className='growth-editor-overlay';
  recordDialog.innerHTML=`<section class="growth-editor" role="dialog" aria-modal="true" aria-labelledby="growth-editor-title"><header class="growth-editor-topline"><span>FIELD RECORDER</span><button type="button" data-editor-close aria-label="关闭记录"></button></header><div class="growth-editor-heading"><span>${existing?'REVISIT / 调整记录':'NEW TAPE / 记录近况'}</span><h2 id="growth-editor-title">${escape(plant.name)}的近况</h2><p>${existing?'沿着这枝的生长轨迹，补上新的观察':'把今天看到的变化，留在这枝的生长手记里'}</p></div><form><div class="growth-editor-field"><label id="growth-status-label"><span class="growth-editor-index">01 /</span><span>生长状态</span></label><input id="growth-edit-status" name="status" type="hidden" value="${escape(existing?.status||'抽出新芽')}"><button class="growth-status-trigger" type="button" aria-labelledby="growth-status-label growth-status-value" aria-controls="growth-status-options" aria-expanded="false"><span id="growth-status-value">${escape(existing?.status||'抽出新芽')}</span><span class="growth-status-indicator" aria-hidden="true"></span></button><div class="growth-status-options" id="growth-status-options" role="group" aria-label="选择生长状态" aria-hidden="true" inert><div class="growth-status-options-inner">${['抽出新芽','正在生根','成功生根','暂未生根','枯萎了','其他变化'].map((label,index)=>`<button type="button" class="growth-status-option" data-status="${label}" aria-pressed="${(existing?.status||'抽出新芽')===label}"><span class="growth-status-option-index">0${index+1}</span><span class="growth-status-option-label">${label}</span></button>`).join('')}</div></div></div><div class="growth-editor-field growth-editor-writing"><label for="growth-edit-text"><span class="growth-editor-index">02 /</span><span>今天的观察</span><small>最多 180 字</small></label><textarea id="growth-edit-text" name="text" maxlength="180" placeholder="这一枝，今天有了什么变化？" required></textarea></div><div class="growth-editor-media-row"><span class="growth-editor-field-label"><span class="growth-editor-index">03 /</span><span>照片或视频</span><small>可选</small></span><label class="growth-editor-upload" for="growth-edit-media"><span>＋ ${existing?'更换影像':'添加影像'}</span><input id="growth-edit-media" type="file" accept="image/*,video/*"></label></div><div class="growth-editor-preview" hidden></div><p class="growth-editor-error" role="alert" hidden></p><div class="growth-editor-footer">${existing?'<button class="growth-editor-delete" type="button" data-editor-delete>删除这段</button>':'<span class="growth-editor-hint">留下一段生长</span>'}<button class="growth-editor-submit" type="submit">${existing?'保存修改':'保存近况'} <span>↗</span></button></div></form></section>`;
  document.body.append(recordDialog);document.body.style.overflow='hidden';
  const form=recordDialog.querySelector('form'),input=form.querySelector('input[type="file"]'),preview=form.querySelector('.growth-editor-preview'),error=form.querySelector('.growth-editor-error'),submit=form.querySelector('.growth-editor-submit');
  let removeMedia=false,confirmDelete=false;
  if(existing)form.elements.text.value=existing.text;
  const statusTrigger=form.querySelector('.growth-status-trigger'),statusOptions=form.querySelector('.growth-status-options');
  const setStatusOpen=open=>{statusOptions.classList.toggle('is-open',open);statusOptions.inert=!open;statusOptions.setAttribute('aria-hidden',String(!open));statusTrigger.setAttribute('aria-expanded',String(open));};
  const closeStatus=()=>setStatusOpen(false);
  statusTrigger.addEventListener('click',()=>setStatusOpen(!statusOptions.classList.contains('is-open')));
  statusOptions.addEventListener('click',event=>{const option=event.target.closest('[data-status]');if(!option)return;form.elements.status.value=option.dataset.status;form.querySelector('#growth-status-value').textContent=option.dataset.status;statusOptions.querySelectorAll('[data-status]').forEach(button=>button.setAttribute('aria-pressed',String(button===option)));closeStatus();statusTrigger.focus({preventScroll:true});});
  recordDialog.addEventListener('keydown',event=>{if(event.key==='Escape'&&statusOptions.classList.contains('is-open')){event.stopPropagation();closeStatus();statusTrigger.focus({preventScroll:true});}});
  const showPreview=(file)=>{preview.replaceChildren();preview.hidden=true;if(!file&&!existing)return;if(file){recordPreviewUrl=URL.createObjectURL(file);const media=document.createElement(file.type.startsWith('video/')?'video':'img');media.src=recordPreviewUrl;media.className='growth-editor-media';if(media.tagName==='VIDEO'){media.controls=true;media.playsInline=true;media.preload='metadata';}preview.append(media);const name=document.createElement('span');name.textContent=file.name;preview.append(name);}else if(!removeMedia&&(existing.photo||existing.videoId)){if(existing.photo){const image=document.createElement('img');image.className='growth-editor-media';image.src=existing.photo;image.alt='已保存的照片';preview.append(image);}const name=document.createElement('span');name.textContent=existing.videoId?'已保存的视频':'已保存的照片';preview.append(name);}if(preview.childNodes.length){preview.hidden=false;const remove=document.createElement('button');remove.type='button';remove.className='growth-editor-remove-media';remove.textContent='移除影像';remove.addEventListener('click',()=>{removeMedia=true;input.value='';if(recordPreviewUrl){URL.revokeObjectURL(recordPreviewUrl);recordPreviewUrl='';}preview.replaceChildren();preview.hidden=true;});preview.append(remove);}};
  showPreview();
  recordDialog.addEventListener('click',event=>{if(event.target===recordDialog||event.target.closest('[data-editor-close]'))closeRecordEditor()});
  input.addEventListener('change',()=>{if(recordPreviewUrl){URL.revokeObjectURL(recordPreviewUrl);recordPreviewUrl='';}const file=input.files?.[0];if(!file){showPreview();return;}if(!file.type.startsWith('image/')&&!file.type.startsWith('video/')){error.textContent='请选择照片或视频文件。';error.hidden=false;input.value='';showPreview();return;}removeMedia=false;error.hidden=true;showPreview(file);});
  form.querySelector('[data-editor-delete]')?.addEventListener('click',async event=>{const button=event.currentTarget;if(!confirmDelete){confirmDelete=true;button.textContent='确认删除这段';button.classList.add('is-confirming');return;}button.disabled=true;try{await onDeleteGrowth({plantId:plant.id,recordId:existing.id});film=Math.max(0,film-1);closeRecordEditor();paint();typeText(root);root.querySelector('.album-live').textContent=`已删除${plant.name}的这段近况`;}catch(cause){error.textContent=cause?.message||'删除失败，请稍后再试。';error.hidden=false;button.disabled=false;}});
  form.addEventListener('submit',async event=>{event.preventDefault();const text=form.elements.text.value.trim();if(!text){error.textContent='请写下一句观察。';error.hidden=false;form.elements.text.focus();return;}submit.disabled=true;error.hidden=true;try{const saved=await onSaveGrowth({plantId:plant.id,recordId:existing?.id,status:form.elements.status.value,text,input,removeMedia});const items=getData().postcards.filter(record=>record.plantId===plant.id);film=Math.max(0,items.findIndex(record=>record.id===saved.id));closeRecordEditor();paint();typeText(root);root.querySelector('.album-live').textContent=`已保存${plant.name}的近况`;}catch(cause){error.textContent=cause?.message||'保存失败，请稍后再试。';error.hidden=false;submit.disabled=false;}});
  if(!reduced()){recordDialog.animate([{backgroundColor:'rgba(21,46,39,0)'},{backgroundColor:'rgba(21,46,39,.76)'}],{duration:520,easing:'ease-out',fill:'forwards'});recordDialog.querySelector('.growth-editor').animate([{transform:'translateY(105%)'},{transform:'translateY(0)'}],{duration:620,easing:'cubic-bezier(.18,.82,.21,1)',fill:'forwards'});}
  form.elements.text.focus({preventScroll:true});
 }
 const clearMotion=()=>{reveals.forEach(finish=>finish());reveals.clear();animations.forEach(animation=>animation.cancel());animations.clear();};
 function stopWarp(){cancelAnimationFrame(warpFrame);warpFrame=0;root.querySelector('.tv-warp-map').setAttribute('scale','0');root.querySelectorAll('.is-signal-bending').forEach(element=>element.classList.remove('is-signal-bending'));}
 async function bendOut(targets){
  targets=targets.filter(Boolean);
  // Keep the picture in place. Short signal jitter and uneven ink loss make
  // it disappear without squeezing the image or clipping its top and bottom.
  await Promise.all(targets.map(target=>animate(target,[
   {opacity:1,transform:'translateX(0)'},
   {opacity:.9,transform:'translateX(2px)',offset:.23},
   {opacity:.96,transform:'translateX(-3px)',offset:.38},
   {opacity:.55,transform:'translateX(1px)',offset:.66},
   {opacity:.7,transform:'translateX(-1px)',offset:.78},
   {opacity:0,transform:'translateX(0)'}
  ],{duration:310,easing:'linear',hold:true}).finished));
 }
 async function switchProgram(){
  const version=++operation,careUpdate=channel==='care'&&renderKey.startsWith('care:'),code=root.querySelector('.tv-channel-code');
  const otherUpdate=!careUpdate&&channel!=='care'&&renderKey.startsWith(`${channel}:`),plan=otherUpdate?programPlan():null;
  const stableRects=plan?new Map(plan.entries.filter(entry=>!entry.changed&&entry.old).map(entry=>[entry.old,entry.old.getBoundingClientRect()])):null;
  const codeChanges=code.dataset.value!==`CH ${String(selectedIndex()+1).padStart(2,'0')}`;
  const changedCare=careUpdate?(()=>{
   const next=frames()[film],plant=selected(),labels=topicLabels(plant);
   return [
    [program.querySelector('.care-heading h1'),plant.name],
    [program.querySelector('.care-heading i'),plant.latin],
    [program.querySelector('.care-difficulty span'),plant.level],
    [program.querySelector('.care-subtitle-index'),labels[film]],
    [program.querySelector('.care-copy h2'),next.title],
    [program.querySelector('.care-copy p'),next.text],
    ...[...program.querySelectorAll('.care-topics .tv-key-label')].map((element,index)=>[element,labels[index]])
   ].filter(([element,value])=>element&&(element.matches('.care-subtitle-index')||(element.dataset.typeText??element.textContent)!==value)).map(([element])=>element);
  })():[];
  const outgoing=careUpdate?[program.querySelector('.care-stage'),...changedCare]:plan?plan.entries.filter(entry=>entry.changed).map(entry=>entry.old):programPieces();
  if(codeChanges)outgoing.push(code);
  stopWarp();clearMotion();root.classList.toggle('is-tuning',!careUpdate&&!plan);
  if(reduced()){if(plan)paintProgramPlan(plan);else paint(careUpdate);root.classList.remove('is-tuning');return;}
  try{
   await bendOut(outgoing);
   if(version!==operation||signal.aborted)return;stopWarp();clearMotion();
   const change=plan?paintProgramPlan(plan):null;
   if(!plan)paint(careUpdate);
   drawScene();
   if(codeChanges)delete code.dataset.typed;
   typeText(root);
   if(change){
    revealNewPieces(change.incoming);
    change.stable.forEach(element=>{
     const before=stableRects.get(element),after=element.getBoundingClientRect();
     const dx=before.left-after.left,dy=before.top-after.top;
     if(Math.abs(dx)>1||Math.abs(dy)>1)animate(element,[{transform:`translate(${dx}px,${dy}px)`},{transform:'translate(0,0)'}],{duration:360,easing:'cubic-bezier(.22,.7,.25,1)'});
    });
   }
   else if(!careUpdate)revealNewPieces(programPieces());
  }catch{}finally{if(version===operation&&!signal.aborted)root.classList.remove('is-tuning');}
 }
 let drawnDialBase=null;
 function drawDial(base=selectedIndex(),shift=0,force=false){
  if(force||base!==drawnDialBase){
   track.innerHTML=Array.from({length:11},(_,i)=>{const offset=i-5,p=plants[wrap(base+offset)],active=offset===0;return `<button role="tab" ${active?`id="station-${p.id}"`:''} data-plant="${p.id}" data-offset="${offset}" aria-label="放映${p.name}" aria-controls="tv-plant-panel" aria-selected="${active}" tabindex="${active?0:-1}" ${Math.abs(offset)>4?'aria-hidden="true"':''} style="--station-offset:${offset}"><span class="station-number">${p.value}</span><span class="station-name">${p.name}</span></button>`;}).join('');
   drawnDialBase=base;
  }
  track.style.translate=`${shift}px 0`;
 }
 const dialStep=()=>track.querySelector('button')?.getBoundingClientRect().width||90;
 function selectPlant(id,focus=false,fromShift=0,steps=null){
  const next=plants.findIndex(plant=>plant.id===id);if(next<0)return;
  const previous=selectedIndex();let delta=steps??next-previous;if(steps===null){const half=plants.length/2;if(delta>half)delta-=plants.length;if(delta<-half)delta+=plants.length;}
  chosenId=id;film=0;tunerAnimation?.cancel();drawDial(selectedIndex(),0,true);
  if(!reduced()&&delta!==0)tunerAnimation=track.animate([{translate:`${fromShift+delta*dialStep()}px 0`},{translate:'0px 0'}],{duration:460,easing:'cubic-bezier(.16,.8,.2,1)'});
  if(focus)track.querySelector('[aria-selected="true"]')?.focus({preventScroll:true});switchProgram();
 }
 root.addEventListener('click',event=>{
  const mode=event.target.closest('[data-tv-mode]');if(mode){if(channel!==mode.dataset.tvMode){channel=mode.dataset.tvMode;film=0;root.querySelectorAll('[data-tv-mode]').forEach(button=>button.setAttribute('aria-selected',String(button===mode)));switchProgram();}return;}
  const station=event.target.closest('[data-plant]');if(station){if(Date.now()<ignoreClick)return;if(station.dataset.plant!==chosenId)selectPlant(station.dataset.plant,false,0,Number(station.dataset.offset));return;}
  const topic=event.target.closest('[data-care-frame]');if(topic){if(film===Number(topic.dataset.careFrame))return;film=Number(topic.dataset.careFrame);switchProgram();return;}
  const action=event.target.closest('[data-tv-action]')?.dataset.tvAction;
  if(action==='next'||action==='previous'){film+=action==='next'?1:-1;switchProgram();return;}
  if(root.classList.contains('is-tuning'))return;
  if(action==='record')openRecordEditor();if(action==='edit-record')openRecordEditor(true);if(action==='claim')onClaim(chosenId);if(action==='archive')onArchive(chosenId);
 },{signal});
 root.querySelector('.tv-program-keys').addEventListener('keydown',event=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();
  const keys=[...root.querySelectorAll('[data-tv-mode]')],at=keys.indexOf(document.activeElement),next=event.key==='Home'?0:event.key==='End'?2:(at+(event.key==='ArrowRight'?1:2))%3;
  keys[next].focus();keys[next].click();
 },{signal});
 dial.addEventListener('keydown',event=>{let next;const index=selectedIndex();if(event.key==='ArrowRight')next=wrap(index+1);if(event.key==='ArrowLeft')next=wrap(index-1);if(event.key==='Home')next=0;if(event.key==='End')next=plants.length-1;if(next===undefined)return;event.preventDefault();selectPlant(plants[next].id,true);},{signal});
 dial.addEventListener('pointerdown',event=>{if(event.button!==0)return;tunerAnimation?.cancel();const button=event.target.closest('[data-plant]');dialDrag={id:event.pointerId,x:event.clientX,last:event.clientX,time:performance.now(),velocity:0,dx:0,base:selectedIndex(),clickedId:button?.dataset.plant,clickedOffset:Number(button?.dataset.offset||0)};dial.setPointerCapture(event.pointerId);},{signal});
 dial.addEventListener('pointermove',event=>{if(!dialDrag||event.pointerId!==dialDrag.id)return;const now=performance.now(),dt=now-dialDrag.time;dialDrag.velocity=dt>0?(event.clientX-dialDrag.last)/dt:0;dialDrag.last=event.clientX;dialDrag.time=now;dialDrag.dx=event.clientX-dialDrag.x;const offset=Math.round(-dialDrag.dx/dialStep());drawDial(wrap(dialDrag.base+offset),dialDrag.dx+offset*dialStep());},{signal});
 const endDial=event=>{if(!dialDrag||event.pointerId!==dialDrag.id)return;const drag=dialDrag;dialDrag=null;ignoreClick=Date.now()+400;if(Math.abs(drag.dx)<6){if(drag.clickedId&&drag.clickedId!==chosenId)selectPlant(drag.clickedId,false,0,drag.clickedOffset);else drawDial();return;}const velocity=performance.now()-drag.time<100?drag.velocity:0,steps=Math.round(-(drag.dx+Math.max(-2*dialStep(),Math.min(2*dialStep(),velocity*120)))/dialStep());selectPlant(plants[wrap(drag.base+steps)].id,false,drag.dx,steps);};
 dial.addEventListener('pointerup',endDial,{signal});dial.addEventListener('pointercancel',()=>{dialDrag=null;drawDial();},{signal});
 let wheelAt=0;dial.addEventListener('wheel',event=>{event.preventDefault();if(performance.now()-wheelAt<180)return;wheelAt=performance.now();const d=Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY;if(Math.abs(d)>5)selectPlant(plants[wrap(selectedIndex()+(d>0?1:-1))].id);},{signal,passive:false});
 shell.addEventListener('pointerdown',event=>{if(event.button===0&&!event.target.closest('button,select'))swipe={id:event.pointerId,x:event.clientX,y:event.clientY};},{signal});
 window.addEventListener('pointerup',event=>{if(!swipe||event.pointerId!==swipe.id)return;const dx=event.clientX-swipe.x,dy=event.clientY-swipe.y;swipe=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3)selectPlant(plants[wrap(selectedIndex()+(dx<0?1:-1))].id);},{signal});
 window.addEventListener('pointercancel',()=>swipe=null,{signal});
 window.addEventListener('keydown',event=>{if(recordDialog&&event.key==='Escape')closeRecordEditor()},{signal});
 matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',()=>{operation++;stopWarp();clearMotion();tunerAnimation?.cancel();paint();drawDial();root.classList.remove('is-tuning');},{signal});
 paint();drawDial();
 root.addEventListener('chapter:revealed',()=>{typeText(root);drawScene();},{signal,once:true});
 dispose=()=>{closeRecordEditor(true);controller.abort();sceneSizer.disconnect();operation++;stopWarp();clearMotion();tunerAnimation?.cancel();};
}

