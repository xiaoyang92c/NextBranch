import {plants} from './plants.js';
const active=new Set(),ornaments=new Set(),inkWriters=new Set();
let inkId=0;
let retainCompleted=false,generation=0,enteringPage=null,signalCarry=null,foldedPage=null;
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
const reducedMotion=()=>motionPreference.matches;
const ease='cubic-bezier(.22,.75,.2,1)';
const signalBlank='#9eaf9e';

export function stopChapterMotion(){
 generation++;active.forEach(animation=>animation.cancel());active.clear();retainCompleted=false;
 inkWriters.forEach(finish=>finish());inkWriters.clear();
 ornaments.forEach(element=>element.remove());ornaments.clear();
 if(foldedPage?.page.isConnected)foldedPage.page.style.visibility=foldedPage.visibility;
 foldedPage=null;
 enteringPage?.classList.remove('is-chapter-entering','is-screen-ready','is-background-arriving','is-film-arriving');enteringPage=null;
}
function tween(element,frames,duration,delay=0,easing=ease){
 if(!element)return;
 const animation=element.animate(frames,{duration,delay,easing,fill:'both'}),retain=retainCompleted;
 active.add(animation);
 animation.finished.finally(()=>{if(!retain){active.delete(animation);animation.cancel();}}).catch(()=>{});
 return animation;
}
function beam(opening){
 const line=document.createElement('div');line.className='chapter-power-line';line.setAttribute('aria-hidden','true');document.body.append(line);ornaments.add(line);
 tween(line,opening?[
  {transform:'scaleX(.015)',opacity:0},
  {transform:'scaleX(.38)',opacity:.55,offset:.19},
  {transform:'scaleX(.88)',opacity:.45,offset:.32},
  {transform:'scaleX(.98)',opacity:0,offset:.57},
  {transform:'scaleX(1)',opacity:0}
 ]:[
  {transform:'scaleX(1)',opacity:0},
  {transform:'scaleX(.96)',opacity:0,offset:.42},
  {transform:'scaleX(.88)',opacity:.5,offset:.69},
  {transform:'scaleX(.15)',opacity:.45,offset:.9},
  {transform:'scaleX(.015)',opacity:0}
 ],opening?1140:720,0,'cubic-bezier(.4,0,.3,1)');
}
function powerOff(page){
 // Crop the raster in place: neither its typography nor its paper is squashed.
 const box=page.getBoundingClientRect(),cy=innerHeight/2-box.top;
 const aperture=(height,width=0,radius=12)=>`inset(${cy-height/2}px ${width}% ${box.height-cy-height/2}px ${width}% round ${radius}px)`;
 tween(page,[
  {clipPath:aperture(innerHeight,0,0),filter:'brightness(1) saturate(1)'},
  {clipPath:aperture(innerHeight,0,0),filter:'brightness(1) saturate(1)',offset:.2},
  {clipPath:aperture(6,2),filter:'brightness(.99) saturate(.98)',offset:.7},
  {clipPath:aperture(2,30),filter:'brightness(.98) saturate(.96)',offset:.89},
  {clipPath:aperture(0,50),filter:'brightness(.98) saturate(.96)'}
 ],720,0,'cubic-bezier(.5,0,.3,1)');
 beam(false);
}
function writeHomeGlyph(glyph,duration,delay,reverse=false){
 const box=glyph.getBoundingClientRect();if(!box.width||!box.height)return;
 const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),mask=document.createElementNS(ns,'mask'),brush=document.createElementNS(ns,'path'),defs=document.createElementNS(ns,'defs'),paper=document.createElementNS(ns,'foreignObject');
 const id=`home-writing-${++inkId}`,style=getComputedStyle(glyph),content=document.createElement('div');
 svg.classList.add('scene-writing-ink');svg.setAttribute('viewBox',`0 0 ${box.width} ${box.height}`);svg.setAttribute('aria-hidden','true');
 mask.id=id;mask.setAttribute('maskUnits','userSpaceOnUse');mask.setAttribute('x','0');mask.setAttribute('y','0');mask.setAttribute('width',box.width);mask.setAttribute('height',box.height);
 const left=-box.width*.2,right=box.width*1.2;
 brush.setAttribute('d',Array.from({length:5},(_,i)=>`${i?'L':'M'}${left} ${box.height*(.08+i*.21)}L${right} ${box.height*(.08+i*.21)}`).join(''));
 for(const [key,value] of Object.entries({fill:'none',stroke:'white','stroke-width':box.height*.25,'stroke-linejoin':'round','stroke-linecap':'butt',pathLength:'1','stroke-dasharray':'1 1','stroke-dashoffset':reverse?'0':'1'}))brush.setAttribute(key,value);
 mask.append(brush);defs.append(mask);svg.append(defs);
 paper.setAttribute('width','100%');paper.setAttribute('height','100%');paper.setAttribute('mask',`url(#${id})`);
 Object.assign(content.style,{font:style.font,letterSpacing:style.letterSpacing,color:style.color,whiteSpace:'pre',width:'100%',height:'100%',textAlign:'center'});
 content.innerHTML=glyph.innerHTML;content.querySelectorAll('*').forEach(el=>el.style.animation='none');paper.append(content);svg.append(paper);
 const original=[...glyph.childNodes];original.forEach(node=>{if(node.nodeType===Node.ELEMENT_NODE)node.style.visibility='hidden';});
 // Plain Chinese subtitle glyphs get a hidden original span with unchanged width.
 if(!glyph.children.length){const base=document.createElement('span');base.className='scene-writing-original';base.style.visibility='hidden';base.append(...original);glyph.append(base);}
 glyph.append(svg);
 let erased=false;const previousVisibility=glyph.style.visibility;
 const finish=()=>{svg.remove();glyph.querySelectorAll('.scene-writing-original').forEach(el=>el.replaceWith(...el.childNodes));original.forEach(node=>{if(node.nodeType===Node.ELEMENT_NODE)node.style.visibility='';});glyph.style.visibility=erased?'hidden':previousVisibility;inkWriters.delete(finish);};
 inkWriters.add(finish);
 tween(brush,[{strokeDashoffset:reverse?0:1},{strokeDashoffset:reverse?1:0}],duration,delay,'linear').finished.then(()=>{erased=reverse;finish();}).catch(()=>{});
}
function paintStroke(element,{opening=true,delay=0,duration=1200,holder=element.closest('main')}={}){
 if(!element||!holder)return;
 const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),defs=document.createElementNS(ns,'defs'),mask=document.createElementNS(ns,'mask'),brush=document.createElementNS(ns,'path'),id=`chapter-paint-${++inkId}`;
 svg.classList.add('scene-paint-defs');svg.setAttribute('width','0');svg.setAttribute('height','0');svg.setAttribute('aria-hidden','true');
 for(const [name,value] of Object.entries({id,maskUnits:'objectBoundingBox',maskContentUnits:'objectBoundingBox',x:'-.3',y:'-.2',width:'1.7',height:'1.6'}))mask.setAttribute(name,value);
 const rows=Array.from({length:10},(_,i)=>{const y=-.08+i*.15,left=-.25,right=1.4;return `${i?'L':'M'}${i%2?right:left} ${y}L${i%2?left:right} ${y+.012}`;});
 for(const [name,value] of Object.entries({d:rows.join(''),fill:'none',stroke:'white','stroke-width':'.18','stroke-linecap':'round','stroke-linejoin':'round',pathLength:'1','stroke-dasharray':'1 1','stroke-dashoffset':opening?'1':'0'}))brush.setAttribute(name,value);
 mask.append(brush);defs.append(mask);svg.append(defs);holder.append(svg);
 const previousMask=element.style.maskImage,previousVisibility=element.style.visibility;
 element.style.maskImage=`url("#${id}")`;
 let erased=false;
 const cleanup=()=>{element.style.maskImage=previousMask;element.style.visibility=erased?'hidden':previousVisibility;svg.remove();inkWriters.delete(cleanup);};
 inkWriters.add(cleanup);
 tween(brush,[{strokeDashoffset:opening?1:0},{strokeDashoffset:opening?0:1}],duration,delay,'linear').finished.then(()=>{
  if(opening)cleanup();
  else{erased=true;element.style.visibility='hidden';element.style.maskImage=previousMask;svg.remove();inkWriters.delete(cleanup);}
 }).catch(()=>{});
}
function paintHomeStamp(card,delay=80){
 if(!card)return;
 const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),defs=document.createElementNS(ns,'defs'),mask=document.createElementNS(ns,'mask'),brush=document.createElementNS(ns,'path'),id=`home-paint-${++inkId}`;
 svg.classList.add('scene-paint-defs');svg.setAttribute('width','0');svg.setAttribute('height','0');svg.setAttribute('aria-hidden','true');
 for(const [name,value] of Object.entries({id,maskUnits:'objectBoundingBox',maskContentUnits:'objectBoundingBox',x:'-.3',y:'-.2',width:'1.7',height:'1.6'}))mask.setAttribute(name,value);
 // Overlapping, alternating brush passes reveal the live print and its shadow.
 // The actual stamp never moves or dissolves, and keeps its paper animation.
 const rows=Array.from({length:10},(_,i)=>{const y=-.08+i*.15,left=-.25,right=1.4;return `${i?'L':'M'}${i%2?right:left} ${y}L${i%2?left:right} ${y+.012}`;});
 for(const [name,value] of Object.entries({d:rows.join(''),fill:'none',stroke:'white','stroke-width':'.18','stroke-linecap':'round','stroke-linejoin':'round',pathLength:'1','stroke-dasharray':'1 1','stroke-dashoffset':'1'}))brush.setAttribute(name,value);
 mask.append(brush);defs.append(mask);svg.append(defs);card.closest('.home-scene').append(svg);
 const print=card.querySelector(':scope>.stamp'),shadow=card.querySelector(':scope>.stamp-shadow');
 print.style.maskImage=`url("#${id}")`;
 // Reveal the filtered shadow independently. Masking its parent can leave a
 // rectangular filter surface visible in Chromium before the paper is painted.
 tween(shadow,[{opacity:0,transform:'translate3d(3px,5px,0)'},{opacity:.27,transform:getComputedStyle(shadow).transform}],600,delay+1080);
 const finish=()=>{print.style.maskImage='';svg.remove();inkWriters.delete(finish);};inkWriters.add(finish);
 tween(brush,[{strokeDashoffset:1},{strokeDashoffset:0}],1440,delay,'linear').finished.then(finish).catch(()=>{});
}
function homeLetters(page,initial,reverse=false){
 page.querySelectorAll('.scene-heading .scene-copy,.scene-end .scene-copy').forEach((line,lineIndex)=>{
  const large=lineIndex===0||lineIndex===2,text=line.textContent;
  if(!reverse)line.setAttribute('aria-hidden','true');
  const existing=[...line.children],keepExisting=lineIndex===0||reverse&&existing.length>0&&existing.every(glyph=>glyph.classList.contains('scene-ink-letter'));
  const glyphs=keepExisting?existing:Array.from(text,letter=>{const glyph=document.createElement('span');glyph.textContent=letter===' '?'\u00a0':letter;return glyph;});
  if(!keepExisting)line.replaceChildren(...glyphs);
  line.classList.add('is-chapter-reveal');
  glyphs.forEach((glyph,index)=>{
   glyph.classList.add('scene-ink-letter');
   const start=reverse?(lineIndex===0?240:lineIndex===2?110:0):(initial?780:740)+(lineIndex===2?110:lineIndex%2?240:0);
   if(large&&lineIndex===2)paintStroke(glyph,{opening:!reverse,duration:reverse?460:560,delay:start+(reverse?glyphs.length-1-index:index)*(reverse?70:120),holder:page});
   else if(large)writeHomeGlyph(glyph,reverse?460:560,start+(reverse?glyphs.length-1-index:index)*(reverse?70:120),reverse);
   else tween(glyph,reverse?[{clipPath:'inset(0%)',opacity:1},{clipPath:'inset(0% 100% 0% 0%)',opacity:0}]:[{clipPath:'inset(0% 100% 0% 0%)',opacity:0},{clipPath:'inset(0%)',opacity:1}],reverse?250:200,start+(reverse?glyphs.length-1-index:index)*17,'cubic-bezier(.3,.15,.35,1)');
  });
 });
}
const archivePositions=new Map();
export function archiveReturnPosition(id){
 if(archivePositions.has(id))return archivePositions.get(id);
 try{return Math.max(0,Number(sessionStorage.getItem(`next-branch-archive-position:${id}`))||0);}catch{return 0;}
}
export function rememberArchivePosition(page){
 const id=page.dataset.plant,y=window.scrollY;archivePositions.set(id,y);
 try{sessionStorage.setItem(`next-branch-archive-position:${id}`,String(y));}catch{}
}
function newspaperReverse(page,half){
 const plant=plants.find(plant=>plant.id===page.dataset.plant),reverse=document.createElement('article');reverse.className='news-fold-reverse';reverse.style.setProperty('--reverse-height',`${half}px`);
 reverse.innerHTML=`<header class="news-reverse-masthead"><strong>农科枝报</strong><span>枝条档案 · ${plant.no}</span></header><div class="news-reverse-specimen"><figure><img src="./assets/${plant.art}" alt=""><figcaption>植物图版 · ${plant.value}</figcaption></figure><div><span class="news-reverse-kicker">THE NEXT BRANCH / FIELD NOTE</span><h2>${plant.name}</h2><p>${plant.latin}</p></div></div><div class="news-reverse-notes">${['光照','浇水','安家'].map((label,index)=>`<section><b>0${index+1}</b><p>${label}<br>${quickReverse(plant,index)}</p></section>`).join('')}</div><footer><span>修剪之后，继续生长</span><span>下一枝 · 枝条再生驿站</span></footer>`;
 return reverse;
}
function quickReverse(plant,index){
 const care={podocarpus:['柔和见光','见干补水','先稳根系'],osmanthus:['柔光缓苗','保持微湿','耐心等根'],camellia:['避开暴晒','排水通畅','固定枝段']};
 return (care[plant.id]||['循序见光','留意排水','安放新枝'])[index];
}
function newspaperModel(page){
 // Fold the complete camera frame, including the paper behind the transparent
 // navigation. A nav-height crop cut through the visible newspaper on both trips.
 const top=0,width=innerWidth,height=innerHeight,half=height/2,box=page.getBoundingClientRect(),style=getComputedStyle(page);
 const root=document.createElement('div');root.className='chapter-news-fold';root.setAttribute('aria-hidden','true');root.inert=true;
 for(const name of ['--archive-paper','--archive-ink','--archive-muted','--archive-tint','--archive-rule'])root.style.setProperty(name,style.getPropertyValue(name));
 root.style.backgroundColor=style.backgroundColor;
 const pack=document.createElement('div');pack.className='news-fold-pack';Object.assign(pack.style,{left:'0',top:`${top}px`,width:`${width}px`,height:`${height}px`});root.append(pack);
 const original=page.cloneNode(true),sources=[...page.querySelectorAll('.archive-glyph')],copies=[...original.querySelectorAll('.archive-glyph')];
 copies.forEach((el,i)=>{const state=getComputedStyle(sources[i]);Object.assign(el.style,{opacity:state.opacity,filter:state.filter,transform:state.transform,transition:'none',animation:'none'});});
 original.querySelectorAll('*').forEach(el=>{el.style.animation='none';el.style.transition='none';});
 function face(y,back=false){
  const element=document.createElement('div');element.className=`news-fold-face${back?' is-back':''}`;
  if(back){element.append(newspaperReverse(page,half));return element;}
  const print=document.createElement('div');print.className='news-fold-print';Object.assign(print.style,{width:`${width}px`,left:'0',top:`${box.top-top-y}px`});
  const clone=original.cloneNode(true);Object.assign(clone.style,{width:`${width}px`,maxWidth:'none',margin:'0'});
  print.append(clone);element.append(print);return element;
 }
 function panel(y){const panel=document.createElement('div');panel.className='news-fold-panel';Object.assign(panel.style,{left:'0',top:`${y}px`,width:`${width}px`,height:`${half}px`});panel.append(face(y),face(0,true));return panel;}
 const upper=panel(0),lower=panel(half);lower.style.transformOrigin='50% 0';lower.style.zIndex='2';pack.append(upper,lower);
 document.body.append(root);ornaments.add(root);foldedPage={page,visibility:page.style.visibility};page.style.visibility='hidden';page.inert=true;
 return {root,pack,lower,top,half,background:style.backgroundColor};
}
async function foldNewspaper(page,nextBackground){
 if(!page.querySelector('.archive-paper'))return;rememberArchivePosition(page);
 const version=generation,{root,pack,lower,top,half,background}=newspaperModel(page);
 root.dataset.foldStage='fold';
 try{
  // One full-width horizontal hinge; no miniature sheet or scale change.
  await tween(lower,[{transform:'rotateX(0deg)'},{transform:'rotateX(180deg)'}],1120,0,'cubic-bezier(.34,.05,.24,1)').finished;
  if(version!==generation||!root.isConnected||reducedMotion())return;
  root.dataset.foldStage='exit';
  tween(root,[{backgroundColor:background},{backgroundColor:nextBackground||background}],760);
  await tween(pack,[{transform:'translateY(0)'},{transform:`translateY(${-top-half-32}px)`}],760,0,'cubic-bezier(.4,.05,.3,1)').finished;
 }catch{}
}
export async function unfoldNewspaper(page,outgoing){
 if(!page){outgoing?.remove();return;}
 const y=archiveReturnPosition(page.dataset.plant);window.scrollTo({top:y,behavior:'instant'});
 // This article was read before opening the printer. Settle every layer,
 // including below-the-fold glyphs, rules and masked line drawings.
 page.classList.add('is-archive-awake');
 page.classList.remove('is-archive-staged','is-archive-dispersing','is-branch-arriving');
 page.querySelectorAll('.archive-ink-ready,.archive-draw-rule,.archive-draw-graphic').forEach(el=>el.classList.add('is-ink-visible'));
 page.querySelectorAll('.archive-glyph').forEach(g=>Object.assign(g.style,{opacity:'1',filter:'none',transform:'none',transition:'none'}));
 page.querySelectorAll('.archive-care-diagram,.archive-journey svg').forEach(svg=>svg.querySelectorAll('[mask]').forEach(g=>g.removeAttribute('mask')));
 page.inert=true;
 if(reducedMotion()){outgoing?.remove();page.inert=false;return;}
 const {root,pack,lower,half}=newspaperModel(page);
 root.dataset.foldStage='return';
 pack.style.transform=`translateY(${-half-32}px)`;
 lower.style.transform='rotateX(180deg)';
 outgoing?.remove();
 try{
  await pack.animate([{transform:`translateY(${-half-32}px)`},{transform:'translateY(0)'}],{duration:780,easing:'cubic-bezier(.28,.72,.24,1)',fill:'both'}).finished;
  pack.style.transform='translateY(0)';
  await lower.animate([{transform:'rotateX(180deg)'},{transform:'rotateX(0deg)'}],{duration:1050,easing:'cubic-bezier(.34,.05,.24,1)',fill:'both'}).finished;
 }catch{}finally{
  root.remove();ornaments.delete(root);page.style.visibility=foldedPage?.visibility??'';foldedPage=null;page.inert=false;window.scrollTo({top:y,behavior:'instant'});
 }
}

export function enterChapter(page,view,{initial=false,fromView=null}={}){
 const carry=signalCarry;signalCarry=null;
 stopChapterMotion();if(!page)return;
 const find=selector=>page.querySelector(selector),background=getComputedStyle(page).backgroundColor;
 if(reducedMotion()){page.inert=false;page.dispatchEvent(new Event('chapter:revealed'));return;}
 page.inert=true;enteringPage=page;
 if(view==='home'||view==='letters'){
  // The album closes onto the home palette. Keep its vignette and grain in
  // place from the first frame so the background cannot darken after opening.
  const arrivingClass=view==='home'&&fromView==='album'?null:view==='home'&&fromView==='letters'?'is-film-arriving':'is-background-arriving';
  if(arrivingClass){
   page.classList.add(arrivingClass);
   requestAnimationFrame(()=>requestAnimationFrame(()=>{
    if(enteringPage===page)page.classList.remove(arrivingClass);
   }));
  }
 }
 if(view==='home'){
  paintHomeStamp(find('.scene-stamp.current'));
  page.querySelectorAll('.scene-stamp:not(.current)').forEach(card=>{
   const p=Number(card.dataset.position);if(Math.abs(p)!==1)return;
   paintHomeStamp(card,240);
   const box=card.getBoundingClientRect(),outside=p<0?innerHeight-box.top+40:-box.bottom-40;
   tween(card,[{translate:`0 ${outside}px`,opacity:1},{translate:'0 0',opacity:1}],1320,180,'cubic-bezier(.25,.15,.24,1)');
  });
  homeLetters(page,initial);
 }else if(view==='album'){
  page.classList.add('is-chapter-entering');
  const blank=carry?.bridge||signalBlank;
  document.body.style.backgroundColor=blank;
  // The blank stays behind the aperture. Only the complete TV picture opens.
  tween(page,[{backgroundColor:blank},{backgroundColor:blank}],1140);
  const screen=find('.album-tv'),box=screen.getBoundingClientRect(),cy=innerHeight/2-box.top;
  const aperture=(height,width=0,radius=2)=>`inset(${cy-height/2}px ${width}% ${box.height-cy-height/2}px ${width}% round ${radius}px)`;
  tween(screen,[
   {clipPath:aperture(3,49.5),filter:'brightness(.96)'},
   {clipPath:aperture(5,16),filter:'brightness(.98)',offset:.25},
   {clipPath:aperture(innerHeight*.22,0,8),filter:'brightness(1)',offset:.43},
   {clipPath:'inset(0px 0% 0px 0% round 0px)',filter:'brightness(1)',offset:.88},
   {clipPath:'inset(0px 0% 0px 0% round 0px)',filter:'brightness(1)'}
  ],1140,0,'cubic-bezier(.4,.05,.22,1)');
  // Install ink and line drawing before exposing the raster, avoiding a flat
  // screen followed by a second content entrance or a full-copy flash.
  page.dispatchEvent(new Event('chapter:revealed'));
  page.classList.add('is-screen-ready');
  beam(true);
 }else if(view==='claim'){
  // The press owns body arrival followed by paper feed. A second chapter
  // animation would move the rollers after the paper has already started.
 }else if(view==='letters'){
  const well=find('.mailbox-well'),bounds=well.getBoundingClientRect();
  [...page.querySelectorAll('.mailbox-entry')].filter(entry=>{const box=entry.getBoundingClientRect();return box.bottom>bounds.top&&box.top<bounds.bottom;})
   .forEach((entry,index)=>{
    paintStroke(entry.querySelector('.mailbox-ink-frame'),{delay:index*150,duration:1210,holder:page});
    paintStroke(entry.querySelector('.garden-botanical'),{delay:index*150,duration:1210,holder:page});
   });
  paintStroke(find('.mailbox-toolbar'),{delay:260,duration:1050,holder:page});
 }else if(view==='write-letter'){
  tween(find('.office-writing-paper'),[{translate:`0 ${innerHeight+24}px`},{translate:'0 0'}],920,0,'cubic-bezier(.18,.76,.22,1)');
  const lines=page.querySelectorAll('.office-writing-kicker,.office-writing-intro strong,.office-writing-heading small,.office-writing-postage,.office-writing-selects,.office-writing-label,#office-letter-title,#office-letter-text,.office-writing-sign,.office-writing-bottom');
  lines.forEach((line,index)=>tween(line,[{opacity:0,translate:'0 12px',clipPath:'inset(0 0 100% 0)'},{opacity:1,translate:'0 0',clipPath:'inset(0 0 0% 0)'}],440,300+index*76,'cubic-bezier(.2,.7,.24,1)'));
 }else{
  tween(page,[{translate:'0 16px',opacity:.3},{translate:'0 0',opacity:1}],360);
 }
 const sequence=[...active],version=generation;
 Promise.allSettled(sequence.map(a=>a.finished)).then(()=>{
  if(version!==generation||!page.isConnected)return;
  // The TV prepares its text behind the aperture at the start of opening.
  if(view!=='album')page.dispatchEvent(new Event('chapter:revealed'));
  page.classList.remove('is-chapter-entering','is-screen-ready');enteringPage=null;page.inert=false;
  page.querySelectorAll('.is-chapter-reveal').forEach(line=>line.classList.remove('is-chapter-reveal'));
  ornaments.forEach(element=>element.remove());ornaments.clear();
  document.body.style.backgroundColor=background;
 });
}
export async function leaveChapter(page,view,{nextBackground,nextView}={}){
 stopChapterMotion();signalCarry=null;if(!page||reducedMotion())return;
 const version=generation;
 retainCompleted=true;const find=selector=>page.querySelector(selector);
 if(nextView==='album'||view==='album'){
  // Enter through a soft standby tone; close directly onto the next chapter.
  const backing=nextView==='album'?signalBlank:nextBackground||getComputedStyle(page).backgroundColor;
  if(nextView==='album')signalCarry={bridge:backing};
  document.body.style.backgroundColor=backing;
  powerOff(page);
 }else{
  if((view==='home'||view==='letters')&&(nextView==='home'||nextView==='letters'))page.classList.add('is-background-bridging');
  if(nextBackground&&!(view==='detail'&&nextView==='claim'))tween(page,[{backgroundColor:getComputedStyle(page).backgroundColor},{backgroundColor:nextBackground}],view==='home'||view==='letters'?1220:340,view==='home'&&nextView==='letters'?240:0,view==='home'||view==='letters'?'cubic-bezier(.42,0,.58,1)':ease);
  if(view==='home'){
   homeLetters(page,false,true);
   // Retire the continuously transformed paper strips before masking the stamp.
   // Otherwise mobile compositors can keep painting a stale strip after its card is hidden.
   page.querySelectorAll('.scene-stamp > .stamp').forEach(stamp=>stamp.dispatchEvent(new Event('stamp:reset')));
   page.querySelectorAll('.scene-stamp').forEach(card=>{
    const p=Number(card.dataset.position);if(Math.abs(p)>1)return;
    // Side cards travel offscreen as their ink clears. The center stays put,
    // so its brush pass must finish sooner to disappear in the same beat.
    paintStroke(card,{opening:false,duration:p===0?620:1240,holder:page});
    paintStroke(card.querySelector(':scope>.stamp-shadow'),{opening:false,duration:480,holder:page});
    if(p!==0){
     const box=card.getBoundingClientRect(),outside=p<0?innerHeight-box.top+40:-box.bottom-40;
     tween(card,[{translate:'0 0'},{translate:`0 ${outside}px`}],1240,0,'cubic-bezier(.45,0,.3,1)');
    }
   });
  }else if(view==='detail'&&nextView==='claim'){
   await foldNewspaper(page,nextBackground);
  }else if(view==='write-letter'&&nextView==='letters'){
   tween(find('.office-writing-paper'),[{translate:'0 0'},{translate:`0 ${innerHeight+24}px`}],650,0,'cubic-bezier(.45,0,.3,1)');
  }else if(view==='letters'){
   const well=find('.mailbox-well'),bounds=well.getBoundingClientRect(),top=Math.max(0,bounds.top),bottom=Math.min(innerHeight,bounds.bottom);
   let visibleIndex=0;
   page.querySelectorAll('.mailbox-entry').forEach(entry=>{
    const box=entry.getBoundingClientRect();
    if(box.bottom<=top||box.top>=bottom){entry.style.visibility='hidden';return;}
    const delay=visibleIndex++*100;
    paintStroke(entry.querySelector('.mailbox-ink-frame'),{opening:false,delay,duration:900,holder:page});
    // Clear the sprig before its paper edge, so no isolated leaves linger
    // after the envelope has been painted away.
    paintStroke(entry.querySelector('.garden-botanical'),{opening:false,delay,duration:610,holder:page});
   });
   paintStroke(find('.mailbox-toolbar'),{opening:false,duration:750,holder:page});
   const search=find('.mailbox-search');
   if(search&&!search.hidden)paintStroke(search,{opening:false,duration:750,holder:page});
  }else tween(page,[{translate:'0 0',opacity:1},{translate:'0 -12px',opacity:0}],180);
 }
 await Promise.allSettled([...active].map(animation=>animation.finished));
 if(version!==generation||!page.isConnected)return;
 if(view==='home'){
  // Retire the 3D paper layers while the erased page is still mounted.
  // Chromium can otherwise composite one stale strip over the new room.
  const previousVisibility=page.style.visibility;
  page.style.visibility='hidden';
  page.querySelectorAll('.scene-stamp > .stamp').forEach(stamp=>stamp.dispatchEvent(new Event('stamp:reset')));
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  if(version!==generation&&page.isConnected)page.style.visibility=previousVisibility;
 }
}
motionPreference.addEventListener('change',()=>{if(reducedMotion())active.forEach(animation=>{try{animation.finish();}catch{animation.cancel();}});});
