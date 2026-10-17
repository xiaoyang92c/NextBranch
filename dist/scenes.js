let homeIndex=0;
let lastSwipe=0;

const headlines=['ROSE','MYRTLE','OSMANTHUS','HYDRANGEA','JASMINE','ROSEMARY','GARDENIA','BOUGAINVILLEA'];
const sceneColors=[
  ['#e17473','#145c45'],['#59b081','#8a2d4c'],['#efd66e','#205842'],['#9eb9db','#284d66'],
  ['#65b992','#215b43'],['#78b9ad','#225557'],['#b4ce8d','#255b43'],['#e68fa8','#24694d']
];

export function renderHome(plants,stamp){
  return `<main class="home-scene page" aria-label="植物邮票滑动展台">
    <div class="scene-identity">下一枝 <span>NEXT BRANCH</span> · 农科村枝条邮局</div>
    <h1 class="scene-english">${headlines[homeIndex]}</h1>
    <p class="scene-question">一根被剪下来的枝条，还能去哪里？</p>
    <div class="scene-rail">${plants.map((p,i)=>`<button class="scene-stamp" data-scene-index="${i}" data-focus="${p.id}" aria-label="${i===homeIndex?'放大':'切换到'}${p.name}邮票">${stamp(p.id)}</button>`).join('')}</div>
    <div class="scene-end"><div class="scene-name"><strong class="scene-chinese">${plants[homeIndex].name}</strong><span class="scene-latin">${plants[homeIndex].latin.toUpperCase()} · ${plants[homeIndex].no}</span></div></div>
  </main>`;
}

export function mountHome(plants,onOpen){
  const scene=document.querySelector('.home-scene');
  if(!scene)return;
  const update=(next,animate=true)=>{
    homeIndex=(next+plants.length)%plants.length;
    const [bg,accent]=sceneColors[homeIndex];
    scene.style.setProperty('--scene-bg',bg);
    scene.style.setProperty('--scene-accent',accent);
    scene.style.setProperty('--title-size',headlines[homeIndex].length>11?'clamp(29px,8.3vw,78px)':headlines[homeIndex].length>8?'clamp(42px,10.6vw,102px)':'clamp(64px,16vw,132px)');
    document.body.style.setProperty('--scene-accent',accent);
    const title=scene.querySelector('.scene-english'),cn=scene.querySelector('.scene-chinese'),latin=scene.querySelector('.scene-latin');
    const p=plants[homeIndex];
    title.textContent=headlines[homeIndex];cn.textContent=p.name;latin.textContent=`${p.latin.toUpperCase()} · ${p.no}`;
    if(animate){for(const el of [title,cn,latin]){el.classList.remove('text-appear');void el.offsetWidth;el.classList.add('text-appear')}}
    scene.scrollLeft=0;
    const step=innerWidth<600?Math.round(innerWidth*.62):Math.min(420,Math.round(innerWidth*.31));
    scene.querySelectorAll('.scene-stamp').forEach((el,i)=>{
      let offset=i-homeIndex;
      if(offset>plants.length/2)offset-=plants.length;
      if(offset<-plants.length/2)offset+=plants.length;
      const near=Math.abs(offset);
      el.style.transform=`translate(calc(-50% + ${offset*step}px),calc(-50% + ${offset*step}px)) rotate(${offset===0?0:offset<0?-2:2}deg) scale(${offset===0?1:near===1?.97:.9})`;
      el.style.opacity=near>2?'0':near===2?'.55':'1';
      el.style.zIndex=String(10-near);
      el.tabIndex=near<=1?0:-1;
      el.classList.toggle('current',offset===0);
      el.setAttribute('aria-label',`${offset===0?'放大':'切换到'}${plants[i].name}邮票`);
    });
  };
  update(homeIndex,false);
  scene.querySelectorAll('.scene-stamp').forEach(el=>el.onclick=()=>{
    if(Date.now()-lastSwipe<350)return;
    const index=Number(el.dataset.sceneIndex);
    if(index===homeIndex)onOpen(plants[index].id,el);else update(index);
  });
  let down=null;
  scene.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY}}, {passive:true});
  scene.addEventListener('pointerup',e=>{if(!down)return;const dx=e.clientX-down.x,dy=e.clientY-down.y;down=null;const distance=Math.hypot(dx,dy);if(distance<45)return;lastSwipe=Date.now();update(homeIndex+(dx+dy<0?1:-1))},{passive:true});
  scene.addEventListener('pointercancel',()=>{down=null});
  let wheelAt=0;
  scene.addEventListener('wheel',e=>{e.preventDefault();if(Date.now()-wheelAt<530)return;const d=Math.abs(e.deltaY)>Math.abs(e.deltaX)?e.deltaY:e.deltaX;if(Math.abs(d)<10)return;wheelAt=Date.now();update(homeIndex+(d>0?1:-1))},{passive:false});
  window.addEventListener('resize',()=>{if(document.querySelector('.home-scene')===scene)update(homeIndex,false)},{once:true});
}

export function renderGallery(plants,stamp){
  return `<main class="gallery-page page" aria-label="领取枝条邮票展馆"><div class="gallery-viewport"><div class="gallery-grid">
  ${plants.map((p,i)=>`<button class="gallery-stamp" data-focus="${p.id}" aria-label="查看${p.name}枝条邮票" style="--gallery-i:${i}">${stamp(p.id)}</button>`).join('')}
  <div class="gallery-type-tile"><b>下一枝</b><span>NEXT<br>BRANCH</span><small>农科村枝条邮局 · 演示系列</small></div>
  </div></div><div class="gallery-overlay-top"><span>ALL BRANCHES / 枝条展馆</span><span>01—08 · DEMO</span></div><div class="gallery-overlay-bottom"><strong>拖动画面，自由找一枝。</strong><span>轻触邮票 → 资料 → 领取邮单</span></div></main>`;
}

export function mountGallery(){
  const viewport=document.querySelector('.gallery-viewport');
  if(!viewport)return;
  if(innerWidth<650)viewport.scrollLeft=190;
  let drag=null;
  viewport.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')return;drag={x:e.clientX,y:e.clientY,left:viewport.scrollLeft,top:viewport.scrollTop,moved:false}}, {passive:true});
  viewport.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>5)drag.moved=true;viewport.scrollLeft=drag.left-dx;viewport.scrollTop=drag.top-dy},{passive:true});
  viewport.addEventListener('pointerup',()=>{if(drag?.moved){lastSwipe=Date.now()}drag=null});
  viewport.querySelectorAll('.gallery-stamp').forEach(el=>{const old=el.onclick;el.onclick=e=>{if(Date.now()-lastSwipe<280){e.preventDefault();return}old?.(e)}});
}
