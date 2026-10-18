let homeIndex=0,lastSwipe=0,cleanup=()=>{};
const reducedMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
export function cleanupScene(){cleanup();cleanup=()=>{};}
export function letterMarkup(text){return Array.from(text).map((letter,index)=>`<span class="letter-window" aria-hidden="true" style="--letter-i:${index}"><span class="letter-track"><span>${letter===' '?'&nbsp;':letter}</span><span>${letter===' '?'&nbsp;':letter}</span></span></span>`).join('');}
const copy=markup=>`<span class="scene-copy">${markup}</span>`;
const titleMarkup=text=>Array.from(text,(letter,index)=>`<span class="scene-title-letter" style="--glyph-i:${index}"><span class="scene-title-face">${letter}</span></span>`).join('');
export const homeBackground=plants=>plants[homeIndex].sceneBg;
export const selectHomePlant=(plants,id)=>{const index=plants.findIndex(p=>p.id===id);if(index>=0)homeIndex=index;};
let lensMap=null;
function getLensMap(){
  if(lensMap)return lensMap;
  const canvas=document.createElement('canvas');canvas.width=canvas.height=96;
  const context=canvas.getContext('2d'),map=context.createImageData(96,96);
  for(let y=0;y<96;y++)for(let x=0;x<96;x++){
    const nx=(x-47.5)/47.5,ny=(y-47.5)/47.5,radius=Math.min(1,nx*nx+ny*ny),pixel=(y*96+x)*4;
    map.data[pixel]=128+nx*radius*80;map.data[pixel+1]=128+ny*radius*80;map.data[pixel+2]=128;map.data[pixel+3]=255;
  }
  context.putImageData(map,0,0);
  const image=new Image();image.src=canvas.toDataURL();
  lensMap={url:image.src,ready:image.decode()};return lensMap;
}
export function renderHome(plants,stamp){
  const plant=plants[homeIndex];
  return `<main class="home-scene page" style="--scene-bg:${plant.sceneBg};--scene-accent:${plant.sceneInk||plant.ink};--scene-fine:${plant.sceneFine||plant.ink}" aria-label="植物邮票滑动展台"><svg class="scene-optical-defs" width="0" height="0" aria-hidden="true"><defs><filter id="home-fisheye" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feImage class="scene-lens-map" href="${getLensMap().url}" x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="lens-map"/><feDisplacementMap class="scene-lens-displacement" in="SourceGraphic" in2="lens-map" scale="20" xChannelSelector="R" yChannelSelector="G"/></filter></defs></svg><div class="scene-optics"><div class="scene-heading"><h1 class="scene-title" aria-label="${plant.name}">${copy(titleMarkup(plant.name))}</h1><p class="scene-english" aria-label="${plant.latin}">${copy(plant.latin)}</p></div><div class="scene-rail">${plants.map((p,i)=>`<button class="scene-stamp" data-scene-index="${i}" aria-label="${i===homeIndex?'打开档案：':'切换到'}${p.name}邮票">${stamp(p.id)}</button>`).join('')}</div><div class="scene-end"><div class="scene-name"><strong class="scene-chinese" aria-label="${plant.heading}">${copy(plant.heading)}</strong><span class="scene-latin" aria-label="${plant.homeNote}">${copy(plant.homeNote)}</span></div></div></div></main>`;
}
export function mountHome(plants,onOpen){
  const scene=document.querySelector('.home-scene');if(!scene)return;
  const controller=new AbortController(),signal=controller.signal,cards=[...scene.querySelectorAll('.scene-stamp')],animations=new Set();
  let busy=false,down=null,dragOffset=0;
  const duration=1120,ease='cubic-bezier(.38,.02,.22,1)';
  const play=(element,frames,options)=>{const animation=element.animate(frames,options);animations.add(animation);animation.finished.finally(()=>animations.delete(animation)).catch(()=>{});return animation;};
  const offsets=index=>cards.map((_,i)=>{let p=i-index;if(p>plants.length/2)p-=plants.length;if(p<-plants.length/2)p+=plants.length;return p;});
  const step=()=>innerWidth/2+cards[0].offsetWidth*.38;
  const transform=(p,gap,depth=1)=>`translate(calc(-50% + ${p*gap}px),calc(-50% + ${p*Math.min(gap*.62,scene.clientHeight*.24)}px)) scale(${(1-Math.min(Math.abs(p),2)*.025)*depth})`;
  async function slideCopy(element,markup,direction,label){
    element.setAttribute('aria-label',label);
    if(reducedMotion()){element.innerHTML=copy(markup);return;}
    const outgoing=element.firstElementChild,incoming=document.createElement('span');
    incoming.className='scene-copy scene-incoming';incoming.innerHTML=markup;
    element.append(incoming);
    const distance=innerWidth+80;
    // Easing changes speed only: every line stays on its horizontal baseline.
    const horizontal=(from,to)=>[{transform:`translateX(${from}px)`},{transform:`translateX(${to}px)`}];
    const departure=play(outgoing,horizontal(0,direction*distance),{duration,easing:ease,fill:'forwards'});
    const arrival=play(incoming,horizontal(-direction*distance,0),{duration,easing:ease,fill:'forwards'});
    await Promise.all([departure.finished,arrival.finished]);
    if(signal.aborted)return;
    element.replaceChildren(incoming);incoming.classList.remove('scene-incoming');departure.cancel();arrival.cancel();
  }
  function colors(){
    const plant=plants[homeIndex];
    scene.style.setProperty('--scene-bg',plant.sceneBg);
    scene.style.setProperty('--scene-accent',plant.sceneInk||plant.ink);
    scene.style.setProperty('--scene-fine',plant.sceneFine||plant.ink);
    document.body.style.setProperty('--scene-accent',plant.sceneInk||plant.ink);
  }
  function resetStamp(card){
    const stamp=card.querySelector('.stamp');
    stamp.dispatchEvent(new Event('stamp:reset'));
    for(const [name,value] of [['--tilt-x','0deg'],['--tilt-y','0deg'],['--hover-scale','1'],['--stamp-glow','0']])stamp.style.setProperty(name,value);
  }
  function layout(animate=false){
    const gap=step(),positions=offsets(homeIndex),movements=[];
    cards.forEach((card,i)=>{
      const previous=Number(card.dataset.position??positions[i]),p=positions[i],near=Math.abs(p),start=card.style.transform||transform(previous,gap);
      card.getAnimations().forEach(animation=>animation.cancel());resetStamp(card);
      card.style.transform=transform(p,gap);card.style.opacity=near>2?'0':'1';card.style.visibility=near>2?'hidden':'visible';card.style.zIndex=String(10-near);card.tabIndex=near<=1?0:-1;card.classList.toggle('current',p===0);card.setAttribute('aria-label',`${p===0?'打开档案：':'切换到'}${plants[i].name}邮票`);card.dataset.position=p;
      card.querySelector('.stamp').dispatchEvent(new Event('stamp:layout'));
      if(animate&&!reducedMotion()&&Math.abs(previous-p)<2&&(Math.abs(previous)<=2||near<=2)){
        movements.push(play(card,[{transform:start},{transform:transform((previous+p)/2,gap,.955),offset:.48},{transform:transform(p,gap)}],{duration,easing:ease}).finished);
      }
    });
    return Promise.allSettled(movements);
  }
  function update(delta){
    if(busy)return;busy=true;scene.querySelectorAll('.scene-ink-letter').forEach(glyph=>glyph.getAnimations().forEach(animation=>{animation.finish();animation.cancel();}));scene.classList.add('is-switching');homeIndex=(homeIndex+delta+plants.length)%plants.length;
    colors();const movement=layout(true),plant=plants[homeIndex];
    Promise.allSettled([movement,slideCopy(scene.querySelector('.scene-title'),titleMarkup(plant.name),-delta,plant.name),slideCopy(scene.querySelector('.scene-english'),plant.latin,-delta,plant.latin),slideCopy(scene.querySelector('.scene-chinese'),plant.heading,delta,plant.heading),slideCopy(scene.querySelector('.scene-latin'),plant.homeNote,-delta,plant.homeNote)]).then(()=>{if(!signal.aborted){busy=false;scene.classList.remove('is-switching');}});
  }
  getLensMap().ready.then(()=>{if(!signal.aborted)scene.classList.add('has-lens');}).catch(()=>{});
  const resizeLens=()=>scene.querySelector('.scene-lens-displacement').setAttribute('scale',String(Math.min(34,innerWidth*.055)));
  resizeLens();window.addEventListener('resize',resizeLens,{signal});
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',()=>cards.forEach(card=>{resetStamp(card);card.querySelector('.stamp').dispatchEvent(new Event('stamp:motion-preference'));}),{signal});
  colors();layout();
  cards.forEach(card=>card.addEventListener('click',()=>{if(busy||Date.now()-lastSwipe<350)return;const i=Number(card.dataset.sceneIndex);if(i===homeIndex)onOpen(plants[i].id,card);else update(Number(card.dataset.position)>0?1:-1);},{signal}));
  scene.addEventListener('pointerdown',event=>{if(event.button!==0||busy)return;down={x:event.clientX,y:event.clientY,moved:false};dragOffset=0;},{signal,passive:true});
  scene.addEventListener('pointermove',event=>{
    if(!down||busy)return;
    const dx=event.clientX-down.x,dy=event.clientY-down.y;
    if(Math.hypot(dx,dy)>8)down.moved=true;
    if(!down.moved)return;
    scene.classList.add('is-dragging');
    dragOffset=Math.max(-.4,Math.min(.4,(dx+dy)/(step()*2)));
    cards.forEach(card=>{resetStamp(card);card.style.transform=transform(Number(card.dataset.position)+dragOffset,step());});
  },{signal,passive:true});
  scene.addEventListener('pointerup',event=>{
    if(!down)return;const dx=event.clientX-down.x,dy=event.clientY-down.y,moved=down.moved;down=null;scene.classList.remove('is-dragging');
    if(!moved)return;lastSwipe=Date.now();
    if(Math.hypot(dx,dy)<40){layout(true);return;}
    update(dx+dy<0?1:-1);
  },{signal,passive:true});
  const cancelDrag=()=>{if(down?.moved){layout(true);lastSwipe=Date.now();}down=null;scene.classList.remove('is-dragging');};
  scene.addEventListener('pointercancel',cancelDrag,{signal});scene.addEventListener('pointerleave',cancelDrag,{signal});
  scene.addEventListener('wheel',event=>{event.preventDefault();if(down)return;const distance=Math.abs(event.deltaY)>Math.abs(event.deltaX)?event.deltaY:event.deltaX;if(Math.abs(distance)>12)update(distance>0?1:-1);},{signal,passive:false});
  scene.addEventListener('keydown',event=>{if(['ArrowRight','ArrowDown','ArrowLeft','ArrowUp'].includes(event.key)){event.preventDefault();update(['ArrowRight','ArrowDown'].includes(event.key)?1:-1);}},{signal});
  let lastSize=`${scene.clientWidth},${scene.clientHeight}`;
  const observer=new ResizeObserver(()=>{const size=`${scene.clientWidth},${scene.clientHeight}`;if(size!==lastSize){lastSize=size;layout(false);}});observer.observe(scene);
  cleanup=()=>{
    // A chapter may leave halfway through a swipe. Preserve the rendered
    // transforms before cancellation, including both travelling text copies.
    const moving=[...scene.querySelectorAll('.scene-copy,.scene-stamp')];
    const poses=moving.map(el=>[el,getComputedStyle(el).transform]);
    controller.abort();observer.disconnect();animations.forEach(animation=>animation.cancel());animations.clear();
    poses.forEach(([el,transform])=>el.style.transform=transform);
    cards.forEach(card=>card.querySelector('.stamp').dispatchEvent(new Event('stamp:dispose')));
  };
}
