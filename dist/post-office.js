import {renderLetterTheatre,mountLetterTheatre} from './letter-theatre.js';
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
let dispose=()=>{},refresh=()=>{},freshId=null,readerOrigin=null,returnEnvelope=null;
export function cleanupPostOffice(){dispose();dispose=()=>{};refresh=()=>{};readerOrigin=null;returnEnvelope=null;}
export function refreshPostOffice(){refresh();}

function envelope(letter,plant){
  return `<span class="garden-letter"><img class="garden-botanical" src="./assets/${plant.art}" alt="" draggable="false"><span class="garden-envelope-back"></span><span class="garden-envelope-flap"></span><span class="garden-letter-paper"><span class="garden-paper-brand">下一枝 <small>NEXT BRANCH</small></span><span class="garden-letter-topic">${plant.name} · ${esc(letter.category)}<small>${esc(letter.date)}</small></span><span class="garden-salutation">亲爱的枝友：</span><strong class="garden-letter-subject">${esc(letter.title)}</strong><span class="garden-letter-foot">一封寄给枝友的信 <small>枝条手记</small></span></span><span class="garden-envelope-pocket"><img src="./assets/letter-pocket-paper.png" alt="" draggable="false"></span><span class="garden-envelope-address">致，每一位枝友<span>待寄</span></span></span>`;
}
export function renderPostOffice(plants,filter){return renderLetterTheatre(plants,filter);}
export function mountPostOffice(config){
 const arrivingId=freshId;freshId=null;
 const theatre=mountLetterTheatre({...config,freshId:arrivingId,onReader:(origin,restore)=>{readerOrigin=origin;returnEnvelope=restore;}});
 refresh=theatre?.refresh||(()=>{});dispose=theatre?.dispose||(()=>{});
}
export function showPostLetter({getLatest,plant,stamp,onReply,onClose}){
  document.querySelector('#letter-overlay')?.remove();
  const letter=getLatest();if(!letter)return;
  const origin=readerOrigin,foldBack=returnEnvelope;readerOrigin=null;returnEnvelope=null;
  const previousFocus=document.activeElement,overlay=document.createElement('div');overlay.id='letter-overlay';overlay.className='letter-overlay postal-reader mail-reader';
  const fromEnvelope=origin?.kind==='mailbox'&&origin.paperElement;
  const heading=fromEnvelope?'<div class="postal-reader-topfold" aria-hidden="true"></div><button class="round-control letter-close" aria-label="收好这封信">×</button>':`<div class="postal-sheet-head"><span>${plant.name} · ${esc(letter.category)}<small>${esc(letter.date)}</small></span><button class="round-control letter-close" aria-label="收好这封信">×</button></div><div class="postal-sheet-postage" aria-hidden="true">${stamp(plant.id,true)}</div><h2 id="postal-letter-title">${esc(letter.title)}</h2>`;
  overlay.innerHTML=`<article class="letter-sheet postal-sheet ${fromEnvelope?'has-envelope-topfold':''}" role="dialog" aria-modal="true" ${fromEnvelope?`aria-label="${esc(letter.title)}"`:'aria-labelledby="postal-letter-title"'} tabindex="-1">${heading}<div class="postal-reader-tabs" role="group" aria-label="翻阅信件"><button data-letter-tab="question" aria-pressed="true">来信正文</button><button data-letter-tab="replies" aria-pressed="false"></button></div><div class="postal-reader-body"></div><form class="postal-reply-form"><label for="postal-reply">回一封经验</label><div><textarea id="postal-reply" rows="2" maxlength="300" required placeholder="说说你的观察或建议…"></textarea><button type="submit">寄出回复 ↗</button></div><span class="postal-reply-status" role="status" aria-live="polite"></span></form><div class="postal-sheet-bottom">下一枝 · 农科村枝条邮局</div></article>`;
  if(origin?.kind==='mailbox')overlay.classList.add('mailbox-reader');
  document.body.append(overlay);const sheet=overlay.querySelector('.postal-sheet'),body=overlay.querySelector('.postal-reader-body');let tab='question',requestedTab='question',tabVersion=0,closing=false,openingAnimation=Promise.resolve(),onResize=()=>{},foldProxy=null;
  if(fromEnvelope){
    const source=origin.paperElement,face=source.closest('.garden-letter'),top=sheet.querySelector('.postal-reader-topfold'),copy=face.cloneNode(false),paper=source.cloneNode(true);
    const scale=sheet.getBoundingClientRect().width/source.offsetWidth;
    Object.assign(copy.style,{position:'absolute',left:`${-source.offsetLeft*scale}px`,top:`${-source.offsetTop*scale}px`,width:`${face.offsetWidth}px`,height:`${face.offsetHeight}px`,transform:`scale(${scale})`,transformOrigin:'top left'});
    Object.assign(paper.style,{transform:'none',translate:'0 0',visibility:'visible',transition:'none'});
    copy.append(paper);top.append(copy);sheet.style.setProperty('--postal-top-height',`${source.offsetHeight*scale}px`);
  }
  let restingBox=sheet.getBoundingClientRect();
  const foldBox=origin?.paper;
  const panelHeight=fromEnvelope?parseFloat(sheet.style.getPropertyValue('--postal-top-height')):restingBox.height/3;
  const clipMotion=async(element,from,mid,to,duration)=>{
    const animation=element.animate([{clipPath:from,offset:0},{clipPath:mid,offset:.52},{clipPath:to,offset:1}],{duration,easing:'cubic-bezier(.25,.65,.24,1)',fill:'both'});
    await animation.finished;element.style.clipPath=to;animation.cancel();
  };
  function makeFoldProxy(folded){
    const stage=document.createElement('div'),print=sheet.cloneNode(true);
    stage.className='postal-fold-stage';stage.setAttribute('aria-hidden','true');stage.inert=true;
    print.classList.add('postal-fold-print');print.removeAttribute('role');print.removeAttribute('aria-modal');print.removeAttribute('tabindex');print.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));
    print.querySelectorAll('button,textarea').forEach(node=>{node.tabIndex=-1;node.disabled=true;});
    Object.assign(print.style,{position:'absolute',left:'0',top:'0',width:`${restingBox.width}px`,height:`${restingBox.height}px`,margin:'0',visibility:'visible',opacity:'1'});
    const topHeight=sheet.querySelector('.postal-reader-topfold')?.getBoundingClientRect().height||panelHeight;
    const clipAt=(edge,bow=0)=>`polygon(0 0,100% 0,100% ${edge}px,83% ${edge+bow*.45}px,67% ${edge+bow*.85}px,50% ${edge+bow}px,33% ${edge+bow*.85}px,17% ${edge+bow*.45}px,0 ${edge}px)`;
    const foldedClip=clipAt(topHeight),midClip=clipAt(topHeight+(restingBox.height-topHeight)*.52,14),fullClip=clipAt(restingBox.height);
    Object.assign(stage.style,{left:`${restingBox.left}px`,top:`${restingBox.top}px`,width:`${restingBox.width}px`,height:`${restingBox.height}px`,clipPath:folded?foldedClip:'inset(0 0 0 0)'});
    stage.append(print);overlay.append(stage);return {stage,foldedClip,midClip,fullClip};
  }
  function paint(){
    const current=getLatest();if(!current)return;
    overlay.querySelector('[data-letter-tab="replies"]').textContent=`回信 ${current.replies?.length||0}`;
    overlay.querySelectorAll('[data-letter-tab]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.letterTab===tab)));
    const awaiting=tab==='replies'&&!current.replies?.length;
    body.classList.toggle('is-awaiting',awaiting);
    body.innerHTML=tab==='question'?`<p class="postal-salutation">亲爱的枝友：<br>见信好。</p><p class="postal-question">${esc(current.text)}</p>${current.photo?`<img class="postal-question-photo" src="${esc(current.photo)}" alt="这封信附上的植物照片">`:''}<p class="postal-signature">盼你的回信。<span>一位养植物的枝友 · ${esc(current.date)}</span></p>`:(current.replies?.length?current.replies.map(reply=>`<article class="postal-response ${reply.kind==='gardener'?'is-gardener':''}"><header><span>${esc(reply.by.replace(/\s*·\s*(?:本地)?演示/g,''))}</span><i>${reply.kind==='gardener'?'园艺建议':'枝友经验'}</i></header><p>${esc(reply.text)}</p></article>`).join(''):'<div class="postal-awaiting"><span>✉</span><h3>回信还在路上</h3><p>你可以先分享一条经验，或留下新的观察</p></div>');
    body.scrollTop=0;
  }
  async function switchTab(next){
    if(next===requestedTab||closing)return;
    requestedTab=next;const version=++tabVersion;
    body.getAnimations().forEach(animation=>animation.cancel());
    if(!reduced()){
      const out=body.animate([{clipPath:'polygon(0 0,100% 0,100% 25%,100% 50%,100% 75%,100% 100%,0 100%)'},{clipPath:'polygon(0 0,46% 0,49% 25%,44% 50%,48% 75%,46% 100%,0 100%)'},{clipPath:'polygon(0 0,0 0,0 25%,0 50%,0 75%,0 100%,0 100%)'}],{duration:210,easing:'cubic-bezier(.45,0,.55,1)',fill:'both'});
      try{await out.finished;}catch{}out.cancel();
      if(version!==tabVersion||closing)return;
    }
    tab=next;paint();overlay.scrollTop=0;
    if(!reduced()){
      const incoming=body.animate([{clipPath:'polygon(100% 0,100% 0,100% 25%,100% 50%,100% 75%,100% 100%,100% 100%)',translate:'12px 0'},{clipPath:'polygon(54% 0,100% 0,100% 25%,100% 50%,100% 75%,100% 100%,54% 100%)',translate:'5px 0'},{clipPath:'polygon(0 0,100% 0,100% 25%,100% 50%,100% 75%,100% 100%,0 100%)',translate:'0 0'}],{duration:310,easing:'cubic-bezier(.2,.72,.2,1)',fill:'both'});
      try{await incoming.finished;}catch{}incoming.cancel();
    }
  }
  async function close(){
    if(closing)return;closing=true;
    tabVersion++;body.getAnimations().forEach(animation=>animation.cancel());
    await openingAnimation.catch(()=>{});
    if(overlay.scrollTop>1){
      if(reduced())overlay.scrollTop=0;
      else await new Promise(resolve=>{const start=overlay.scrollTop,began=performance.now();const step=now=>{const progress=Math.min(1,(now-began)/320),eased=1-(1-progress)**3;overlay.scrollTop=start*(1-eased);if(progress<1)requestAnimationFrame(step);else resolve();};requestAnimationFrame(step);});
    }
    overlay.style.background='transparent';overlay.style.backdropFilter='none';
    let paperReturned=false;
    if(!reduced()&&foldBox)try{
      restingBox=sheet.getBoundingClientRect();foldProxy=makeFoldProxy(false);sheet.style.visibility='hidden';sheet.style.opacity='0';
      const proxy=foldProxy;
      await clipMotion(proxy.stage,proxy.fullClip,proxy.midClip,proxy.foldedClip,650);
      origin?.revealPaper?.();proxy.stage.remove();foldProxy=null;
      await origin.returnPaper?.();paperReturned=true;
    }catch{if(!paperReturned)try{await origin.returnPaper?.();}catch{}}
    else if(!reduced())try{await sheet.animate([{opacity:1},{opacity:0}],{duration:220,fill:'forwards'}).finished;}catch{}
    else if(foldBox)try{await origin.returnPaper?.();}catch{}
    foldProxy?.stage.remove();foldProxy=null;origin?.revealPaper?.();sheet.style.visibility='hidden';
    removeEventListener('resize',onResize);overlay.remove();if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});else document.querySelector('[data-talk-action="open"]')?.focus({preventScroll:true});foldBack?.();onClose?.();
  }
  overlay.addEventListener('click',event=>{if(event.target===overlay||event.target.closest('.letter-close'))close();const button=event.target.closest('[data-letter-tab]');if(button)switchTab(button.dataset.letterTab);});
  overlay.querySelector('form').addEventListener('submit',async event=>{
    event.preventDefault();const input=overlay.querySelector('#postal-reply'),text=input.value.trim();
    if(!text){input.setCustomValidity('写一句你的观察，再寄出吧。');input.reportValidity();return;}
    try{onReply(text);}catch{overlay.querySelector('.postal-reply-status').textContent='回复未能保存，文字已保留，请稍后再试。';return;}
    input.value='';overlay.querySelector('.postal-reply-status').textContent='回复已寄出 · 保存在本机';
    if(tab==='replies')paint();else await switchTab('replies');
    if(!overlay.isConnected)return;
    body.scrollTop=body.scrollHeight;
    if(!reduced())body.lastElementChild?.animate([{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0 0 0)'}],{duration:300,easing:'ease-out'});
  });
  overlay.querySelector('#postal-reply').addEventListener('input',event=>event.target.setCustomValidity(''));
  overlay.addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();}
    if(event.key==='Tab'){
      const nodes=[...sheet.querySelectorAll('button,textarea,[tabindex="0"]')].filter(element=>!element.disabled),first=nodes[0],last=nodes.at(-1);
      if(event.shiftKey&&(document.activeElement===first||document.activeElement===sheet)){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
  });
  paint();
  if(foldBox){
    overlay.style.background='transparent';
    if(reduced()){origin?.extracted?.();sheet.focus({preventScroll:true});overlay.style.background='';}
    else openingAnimation=(async()=>{
      restingBox=sheet.getBoundingClientRect();
      sheet.style.visibility='hidden';sheet.style.opacity='0';foldProxy=makeFoldProxy(true);origin?.extracted?.();
      const proxy=foldProxy;
      await new Promise(resolve=>setTimeout(resolve,130));
      overlay.style.transition='background-color .55s ease';overlay.style.background='';
      await clipMotion(proxy.stage,proxy.foldedClip,proxy.midClip,proxy.fullClip,760);
      sheet.style.visibility='';sheet.style.opacity='';proxy.stage.remove();foldProxy=null;if(!closing)sheet.focus({preventScroll:true});
    })().catch(()=>{sheet.style.visibility='';sheet.style.opacity='';foldProxy?.stage.remove();foldProxy=null;overlay.style.background='';});
    onResize=()=>{openingAnimation.then(()=>{if(!closing&&overlay.isConnected)restingBox=sheet.getBoundingClientRect();}).catch(()=>{});};
    addEventListener('resize',onResize);
  }else{sheet.focus({preventScroll:true});if(!reduced())sheet.animate([{opacity:0},{opacity:1}],{duration:320,easing:'ease-out'});}
}

export function renderPostCompose(plants,stamp,draft){
  const plant=plants.find(plant=>plant.id===draft.plantId)||plants[0];
  return `<main class="page office-compose" aria-label="寄一封枝友来信">
    <div class="office-writing-room"><form class="office-writing-paper" id="office-letter-form"><fieldset>
      <button type="button" class="office-compose-close" data-nav="letters" aria-label="收起信纸，返回来信">×</button>
      <div class="office-writing-heading"><div class="office-writing-intro"><span class="office-writing-kicker">下一枝 · 枝条邮局</span><strong>亲爱的枝友：</strong><small>见信如晤。</small></div><span class="office-writing-postage" aria-hidden="true">${stamp(plant.id,true)}</span></div>
      <div class="office-writing-selects"><label for="office-letter-plant">关于这一枝<select id="office-letter-plant">${plants.map(plant=>`<option value="${plant.id}" ${plant.id===draft.plantId?'selected':''}>${plant.name}</option>`).join('')}</select></label><label for="office-letter-category">这一页想说<select id="office-letter-category">${['扦插','光照','浇水','叶片','其他'].map(category=>`<option ${category===draft.category?'selected':''}>${category}</option>`).join('')}</select></label></div>
      <label class="office-writing-label" for="office-letter-title">信的题目</label><input id="office-letter-title" name="title" type="text" maxlength="45" required placeholder="例如：新叶卷起，是在等水吗？" value="${esc(draft.title)}">
      <label class="office-writing-label" for="office-letter-text">写下你的观察</label><textarea id="office-letter-text" name="text" maxlength="600" required placeholder="这几天，我的枝条有了一点变化……

它现在放在……，我想问……">${esc(draft.text)}</textarea>
      <div class="office-writing-sign">盼复。<span>一位照顾枝条的人</span></div>
      <div class="office-writing-bottom"><label class="office-photo-label"><input id="office-letter-photo" type="file" accept="image/*" aria-label="夹进一张植物照片"><span>＋ 夹进一张照片</span><img class="office-photo-preview" ${draft.photo?`src="${esc(draft.photo)}"`:'hidden'} alt="信件附图预览"></label><button type="button" class="office-remove-photo" ${draft.photo?'':'hidden'}>移除</button><button type="submit" class="office-send">折好寄出 ↗</button></div>
      <p class="office-writing-status" role="status" aria-live="polite"></p>
    </fieldset></form><div class="office-delivery-seal" aria-hidden="true">已寄出<small>下一枝 · 枝条邮局</small></div></div>
  </main>`;
}
export function mountPostCompose({plants,stamp,draft,readPhoto,onSend,onComplete}){
  const root=document.querySelector('.office-compose');if(!root)return;
  const controller=new AbortController(),signal=controller.signal,animations=new Set();
  const form=root.querySelector('form'),fieldset=form.querySelector('fieldset'),message=root.querySelector('.office-writing-status');
  let sending=false,reading=false,photoVersion=0,flight=null;
  const animate=(element,frames,duration)=>{
    const animation=element.animate(frames,{duration,easing:'cubic-bezier(.2,.75,.22,1)',fill:'forwards'});animations.add(animation);animation.finished.catch(()=>{});return animation;
  };
  const updateDraft=()=>{draft.plantId=root.querySelector('#office-letter-plant').value;draft.category=root.querySelector('#office-letter-category').value;draft.title=root.querySelector('#office-letter-title').value;draft.text=root.querySelector('#office-letter-text').value;};
  form.addEventListener('input',event=>{event.target.setCustomValidity?.('');updateDraft();},{signal});
  root.querySelector('#office-letter-plant').addEventListener('change',()=>{updateDraft();root.querySelector('.office-writing-postage').innerHTML=stamp(draft.plantId,true);},{signal});
  root.querySelector('#office-letter-category').addEventListener('change',updateDraft,{signal});
  root.querySelector('#office-letter-photo').addEventListener('change',async event=>{
    if(!event.target.files?.length)return;const version=++photoVersion;reading=true;root.querySelector('.office-send').disabled=true;message.textContent='正在整理照片…';
    try{
      const photo=await readPhoto(event.target);if(signal.aborted||version!==photoVersion)return;draft.photo=photo;
      const preview=root.querySelector('.office-photo-preview');preview.src=photo;preview.hidden=false;root.querySelector('.office-remove-photo').hidden=false;message.textContent='近照已夹进信里。';
    }catch{if(!signal.aborted)message.textContent='照片没有读取成功，可以重新选择。';}
    finally{if(version===photoVersion&&!signal.aborted){reading=false;root.querySelector('.office-send').disabled=false;}}
  },{signal});
  root.querySelector('.office-remove-photo').addEventListener('click',()=>{draft.photo='';photoVersion++;reading=false;root.querySelector('#office-letter-photo').value='';root.querySelector('.office-photo-preview').hidden=true;root.querySelector('.office-remove-photo').hidden=true;root.querySelector('.office-send').disabled=false;message.textContent='近照已移除。';},{signal});
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(sending||reading)return;updateDraft();
    for(const [id,label] of [['office-letter-title','标题'],['office-letter-text','内容']]){const field=root.querySelector(`#${id}`);if(!field.value.trim()){field.setCustomValidity(`写一点${label}，再寄出吧。`);field.reportValidity();return;}}
    if(!form.reportValidity())return;
    sending=true;fieldset.disabled=true;message.textContent='正在封好这封信…';
    const plant=plants.find(plant=>plant.id===draft.plantId);let letter;
    try{letter=onSend({...draft,title:draft.title.trim(),text:draft.text.trim()});}
    catch{sending=false;fieldset.disabled=false;message.textContent='这封信暂时未能保存。内容已保留，可移除照片后再试。';return;}
    freshId=letter.id;
    try{
      if(!reduced()){
        const rect=form.getBoundingClientRect();
        const w=Math.min(230,innerWidth*.58),h=w/.91,x=rect.left+rect.width/2-w/2,y=rect.top+rect.height/2-h/2;
        flight=document.createElement('div');flight.className='office-letter-flight outgoing-letter';flight.style.width=`${w}px`;flight.style.height=`${h}px`;flight.innerHTML=envelope(letter,plant);document.body.append(flight);
        await Promise.all([animate(form,[{scale:1,opacity:1},{scale:.92,opacity:0}],220).finished,animate(flight,[{transform:`translate(${x}px,${y}px) scale(.75)`,opacity:0},{transform:`translate(${x}px,${y}px) scale(1)`,opacity:1}],260).finished]);
        flight.classList.add('is-sealed');root.classList.add('is-posting');
        const endX=innerWidth*.75-w/2,endY=-h-30;
        await animate(flight,[{transform:`translate(${x}px,${y}px) rotate(0deg)`,opacity:1},{transform:`translate(${x-45}px,${y-65}px) rotate(-8deg) scale(.95)`,offset:.35},{transform:`translate(${endX}px,${endY}px) rotate(12deg) scale(.6)`,opacity:0}],580).finished;
        root.classList.add('is-posted');await animate(root.querySelector('.office-delivery-seal'),[{scale:1.7,rotate:'-22deg',opacity:0},{scale:1,rotate:'-12deg',opacity:1}],260).finished;
      }
      if(!signal.aborted)onComplete(letter);
    }catch{}finally{flight?.remove();flight=null;}
  },{signal});
  dispose=()=>{controller.abort();photoVersion++;animations.forEach(animation=>animation.cancel());animations.clear();flight?.remove();};
}
