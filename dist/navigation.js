let navigation=null,observer=null;
function positionCursor(){
 if(!navigation?.isConnected)return;
 const label=navigation.querySelector('button.active .nav-label'),cursor=navigation.querySelector('.nav-cursor');if(!label||!cursor)return;
 const base=navigation.getBoundingClientRect(),box=label.getBoundingClientRect(),height=parseFloat(getComputedStyle(label).lineHeight)+6;
 cursor.style.left=`${box.left-base.left-3}px`;cursor.style.right=`${base.right-box.right-3}px`;cursor.style.top=`${box.top-base.top+(box.height-height)/2}px`;cursor.style.height=`${height}px`;
}
export function selectNavigation(section){
 if(!navigation)return;
 navigation.querySelectorAll('button[data-nav]:not(.nav-brand)').forEach(button=>{const active=button.dataset.nav===section;button.classList.toggle('active',active);if(active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});
 positionCursor();
}
export function mountNavigation(markup,section){
 if(!navigation?.isConnected){
  document.body.insertAdjacentHTML('beforeend',markup);navigation=document.querySelector('.main-nav');navigation.insertAdjacentHTML('beforeend','<span class="nav-cursor" aria-hidden="true"><i></i><i></i></span>');
  observer?.disconnect();observer=new ResizeObserver(positionCursor);observer.observe(navigation);navigation.querySelectorAll('.nav-label').forEach(label=>observer.observe(label));
  document.fonts.ready.then(positionCursor);requestAnimationFrame(()=>navigation?.classList.add('is-positioned'));
 }
 selectNavigation(section);
}
