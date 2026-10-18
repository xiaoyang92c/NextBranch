import {mountPaperSurface} from './stamp-paper.js';
const interactive = stamp => {
  const scene=stamp.closest('.home-scene');
  return !scene||(stamp.closest('.scene-stamp')?.classList.contains('current')&&!scene.matches('.is-dragging,.is-switching'));
};
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
let shadowId=0;

function mountHomeStamp(stamp){
  const card=stamp.closest('.scene-stamp'),id=`branch-paper-shadow-${++shadowId}`;
  const shadow=document.createElementNS('http://www.w3.org/2000/svg','svg');
  shadow.setAttribute('class','stamp-shadow');shadow.setAttribute('viewBox','0 0 220 300');shadow.setAttribute('preserveAspectRatio','none');shadow.setAttribute('aria-hidden','true');
  // One persistent SVG clock: pointer events never stop or restart the water.
  // A single noise octave keeps the continuously repainted shadow inexpensive.
  shadow.innerHTML=`<defs><filter id="${id}" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".015 .022" numOctaves="1" seed="8" result="paper-grain"><animate attributeName="baseFrequency" values=".015 .022;.019 .016;.015 .022" dur="11s" begin="0s" repeatCount="indefinite"/></feTurbulence><feDisplacementMap in="SourceGraphic" in2="paper-grain" scale="12" xChannelSelector="R" yChannelSelector="G"><animate attributeName="scale" values="12;22;16;12" dur="6s" begin="0s" repeatCount="indefinite"/></feDisplacementMap><feGaussianBlur stdDeviation="2.1"/></filter></defs>`;
  const silhouette=stamp.querySelector('.stamp-teeth path').cloneNode(true);silhouette.setAttribute('filter',`url(#${id})`);shadow.append(silhouette);card.insertBefore(shadow,stamp);
  const syncMotion=()=>reducedMotion()?shadow.pauseAnimations():shadow.unpauseAnimations();
  syncMotion();stamp.addEventListener('stamp:motion-preference',syncMotion);
  const paper=mountPaperSurface(stamp,card);
  let frame=0,bounds=null,point=null,hovering=false;
  function reset(){
    hovering=false;cancelAnimationFrame(frame);frame=0;bounds=null;
    card.classList.remove('is-stamp-hover','is-stamp-pressed');
    for(const property of ['--shadow-offset','--shadow-skew-x','--shadow-skew-y','--shadow-stretch','--shadow-squash'])card.style.removeProperty(property);
    for(const [name,value] of [['--hover-scale','1'],['--press-scale','1'],['--stamp-glow','0'],['--tilt-x','0deg'],['--tilt-y','0deg']])stamp.style.setProperty(name,value);
  }
  function enter(event){
    if(event.pointerType==='touch'||event.buttons||reducedMotion()||!interactive(stamp)||hovering)return;
    hovering=true;bounds=card.getBoundingClientRect();
    stamp.style.setProperty('--hover-scale','1.012');stamp.style.setProperty('--stamp-glow','.34');card.classList.add('is-stamp-hover');
  }
  stamp.addEventListener('pointerenter',enter);
  stamp.addEventListener('pointermove',event=>{
    if(event.pointerType==='touch'||event.buttons||reducedMotion()||!interactive(stamp))return;
    if(!hovering)enter(event);
    point={x:event.clientX,y:event.clientY};if(frame)return;
    frame=requestAnimationFrame(()=>{
      frame=0;if(!stamp.isConnected||!hovering||!interactive(stamp))return;
      bounds ||=card.getBoundingClientRect();
      const x=Math.max(0,Math.min(1,(point.x-bounds.left)/bounds.width)),y=Math.max(0,Math.min(1,(point.y-bounds.top)/bounds.height));
      card.style.setProperty('--shadow-offset',`${(24+(x+y)*1.5).toFixed(2)}px`);
      card.style.setProperty('--shadow-skew-x',`${((x-.5)*3.2).toFixed(2)}deg`);card.style.setProperty('--shadow-skew-y',`${((y-.5)*2).toFixed(2)}deg`);
      card.style.setProperty('--shadow-stretch',(1.012+Math.abs(x-.5)*.014).toFixed(3));card.style.setProperty('--shadow-squash',(.992+Math.abs(y-.5)*.012).toFixed(3));
      stamp.style.setProperty('--tilt-x',`${((.5-y)*9).toFixed(2)}deg`);stamp.style.setProperty('--tilt-y',`${((x-.5)*11).toFixed(2)}deg`);
      stamp.style.setProperty('--glow-x',`${(x*100).toFixed(2)}%`);stamp.style.setProperty('--glow-y',`${(y*100).toFixed(2)}%`);
    });
  });
  stamp.addEventListener('pointerleave',()=>reset());stamp.addEventListener('pointercancel',()=>reset());
  stamp.addEventListener('stamp:reset',()=>{reset();paper.flatten();});
  stamp.addEventListener('stamp:park',()=>{reset();paper.hold();});
  stamp.addEventListener('stamp:hold',()=>paper.hold());stamp.addEventListener('stamp:resume',()=>paper.resume());
  stamp.addEventListener('stamp:dispose',()=>{hovering=false;cancelAnimationFrame(frame);frame=0;paper.dispose({preserve:true});shadow.pauseAnimations();stamp.getAnimations().forEach(a=>a.pause());});
  stamp.addEventListener('pointerdown',()=>{if(!interactive(stamp))return;reset();card.classList.add('is-stamp-pressed');stamp.style.setProperty('--press-scale','.97');});
  stamp.addEventListener('pointerup',()=>{card.classList.remove('is-stamp-pressed');stamp.style.setProperty('--press-scale','1');});
}

export function mountStampEffects(root = document) {
  root.querySelectorAll('.stamp').forEach(stamp => {
    if (stamp.dataset.motionReady) return;
    stamp.dataset.motionReady = 'true';
    if(stamp.closest('.scene-stamp')){mountHomeStamp(stamp);return;}
    let frame = 0, point = null, bounds = null;
    const reset = () => {
      cancelAnimationFrame(frame);frame=0;bounds=null;
      stamp.style.setProperty('--tilt-x','0deg');
      stamp.style.setProperty('--tilt-y','0deg');
      stamp.style.setProperty('--stamp-glow','0');stamp.style.setProperty('--hover-scale','1');
      stamp.style.setProperty('--press-scale','1');
    };
    stamp.addEventListener('pointerenter',event=>{
      if(event.pointerType==='touch'||reducedMotion()||!interactive(stamp))return;
      bounds=stamp.getBoundingClientRect();stamp.style.setProperty('--stamp-glow','.3');stamp.style.setProperty('--hover-scale','1.035');
    });
    stamp.addEventListener('pointermove',event=>{
      if(event.pointerType==='touch'||reducedMotion()||!interactive(stamp))return;
      point={x:event.clientX,y:event.clientY};
      if(frame)return;
      frame=requestAnimationFrame(()=>{
        frame=0;if(!stamp.isConnected||!interactive(stamp))return;
        bounds ||= stamp.getBoundingClientRect();
        const x=Math.max(0,Math.min(1,(point.x-bounds.left)/bounds.width));
        const y=Math.max(0,Math.min(1,(point.y-bounds.top)/bounds.height));
        stamp.style.setProperty('--glow-x',`${x*100}%`);
        stamp.style.setProperty('--glow-y',`${y*100}%`);
        stamp.style.setProperty('--stamp-glow','.3');stamp.style.setProperty('--hover-scale','1.035');
      });
    });
    stamp.addEventListener('pointerleave',reset);
    stamp.addEventListener('pointercancel',reset);
    stamp.addEventListener('pointerdown',()=>{stamp.style.setProperty('--press-scale','.95');stamp.style.setProperty('--hover-scale','1');});
    stamp.addEventListener('pointerup',()=>stamp.style.setProperty('--press-scale','1'));
  });
}

