// Narrow, tangent-aligned paper strips carry a right-to-left swell. The original
// artwork and live typography are reused, so no screenshot texture is needed.
export function mountPaperSurface(stamp,card){
  const scene=card.closest('.home-scene'),motion=matchMedia('(prefers-reduced-motion: reduce)'),compact=matchMedia('(max-width: 799px)');
  const stripCount=()=>compact.matches?6:12;
  let surface=null,strips=[],frame=0,epoch=0,width=stamp.offsetWidth,disposed=false,held=false,lastFlat=false,lastPaint=0;
  const stock=getComputedStyle(stamp.querySelector('.stamp-inner'),'::after'),grain=document.createElement('div');
  grain.className='stamp-grain-overlay';grain.setAttribute('aria-hidden','true');grain.inert=true;
  Object.assign(grain.style,{backgroundImage:stock.backgroundImage,backgroundSize:stock.backgroundSize,opacity:'.4',mixBlendMode:stock.mixBlendMode});
  // The flat stamp keeps its texture while parked. The moving strips carry
  // their own aligned copies so the grain bends with the printed paper.
  stamp.append(grain);
  const smooth=t=>t*t*(3-2*t);
  function draw(progress=null){
    if(progress===null&&lastFlat)return;
    lastFlat=progress===null;
    const spread=.22,crest=progress===null?0:1.45-1.9*progress;
    const height=progress===null?0:width*.115*Math.sin(Math.PI*progress)**.45;
    const count=strips.length;
    strips.forEach((strip,i)=>{
      const u=(i+.5)/count,distance=u-crest,z=height*Math.exp(-distance*distance/(2*spread*spread)),slope=-z*distance/(spread*spread*width);
      strip.style.transform=`translateZ(${z.toFixed(3)}px) rotateY(${(-Math.atan(slope)*180/Math.PI).toFixed(3)}deg) scaleX(${Math.sqrt(1+slope*slope).toFixed(5)})`;
    });
  }
  function tick(now){
    frame=0;if(!surface||disposed||held)return;
    if(document.hidden){draw();epoch=now;return;}
    if(compact.matches&&now-lastPaint<32){frame=requestAnimationFrame(tick);return;}
    lastPaint=now;
    const paused=scene.matches('.is-switching,.is-dragging')||card.classList.contains('is-stamp-pressed');
    if(paused)epoch=now;
    const t=((now-epoch)%7200)/7200;
    const progress=paused||t<.14||t>.86?null:smooth((t-.14)/.72);
    draw(progress);frame=requestAnimationFrame(tick);
  }
  function flatten(){
    cancelAnimationFrame(frame);frame=0;surface?.remove();surface=null;strips=[];lastFlat=false;stamp.classList.remove('has-paper-surface');
  }
  function sync(){
    if(disposed||motion.matches||!card.classList.contains('current')){flatten();return;}
    if(surface)return;
    const count=stripCount();
    width=stamp.offsetWidth;surface=document.createElement('div');surface.className='stamp-paper-surface';surface.setAttribute('aria-hidden','true');surface.inert=true;
    surface.style.setProperty('--paper-width',`${width}px`);
    for(let i=0;i<count;i++){
      const strip=document.createElement('div');strip.className='paper-strip';strip.style.left=`${i/count*100}%`;strip.style.width=`calc(${100/count}% + 1.6px)`;strip.style.zIndex=String(i+1);
      const print=stamp.cloneNode(true);print.className='stamp paper-print';print.dataset.motionReady='true';print.style.left=`${-i/count*width}px`;
      print.querySelectorAll('[id]').forEach(element=>element.removeAttribute('id'));
      strip.append(print);surface.append(strip);strips.push(strip);
    }
    stamp.append(surface);stamp.classList.add('has-paper-surface');epoch=performance.now();lastFlat=false;lastPaint=0;draw();if(!held&&!document.hidden)frame=requestAnimationFrame(tick);
  }
  function hold(){if(disposed)return;held=true;sync();cancelAnimationFrame(frame);frame=0;draw();}
  function resume(){if(disposed)return;held=false;sync();epoch=performance.now();draw();if(surface&&!frame&&!document.hidden)frame=requestAnimationFrame(tick);}
  function onVisibilityChange(){
    if(document.hidden){cancelAnimationFrame(frame);frame=0;draw();}
    else if(surface&&!held&&!frame){epoch=performance.now();frame=requestAnimationFrame(tick);}
  }
  const resize=new ResizeObserver(()=>{
    if(Math.abs(stamp.offsetWidth-width)>.5){flatten();sync();}
  });resize.observe(stamp);
  stamp.addEventListener('stamp:layout',sync);stamp.addEventListener('stamp:motion-preference',sync);
  const onCompactChange=()=>{flatten();sync();};
  compact.addEventListener('change',onCompactChange);
  document.addEventListener('visibilitychange',onVisibilityChange);
  sync();
  return {flatten,sync,hold,resume,dispose({preserve=false}={}){disposed=true;cancelAnimationFrame(frame);frame=0;if(!preserve){flatten();grain.remove();}resize.disconnect();compact.removeEventListener('change',onCompactChange);document.removeEventListener('visibilitychange',onVisibilityChange);stamp.removeEventListener('stamp:layout',sync);stamp.removeEventListener('stamp:motion-preference',sync);}};
}
