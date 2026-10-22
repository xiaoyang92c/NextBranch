import {renderLetterTheatre,mountLetterTheatre} from './letter-theatre.js?v=20261022-5';
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
let dispose=()=>{},refresh=()=>{},freshId=null,freshAnchorId=null,readerOrigin=null,returnEnvelope=null;
export function cleanupPostOffice(){dispose();dispose=()=>{};refresh=()=>{};readerOrigin=null;returnEnvelope=null;}
export function refreshPostOffice(){refresh();}
export function closePostLetter(){return document.querySelector('#letter-overlay')?.requestClose?.()??Promise.resolve();}

export function renderPostOffice(plants,filter){return renderLetterTheatre(plants,filter);}
export function mountPostOffice(config){
 const arrivingId=freshId,arrivingAnchor=freshAnchorId;freshId=null;freshAnchorId=null;
 const theatre=mountLetterTheatre({...config,freshId:arrivingId,freshAnchorId:arrivingAnchor,onReader:(origin,restore)=>{readerOrigin=origin;returnEnvelope=restore;}});
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
  if(origin?.kind==='mailbox'){
    overlay.classList.add('mailbox-reader');
    if(Number.isFinite(origin.readerTop))overlay.style.setProperty('--mail-reader-top',`${origin.readerTop}px`);
  }
  document.body.append(overlay);const sheet=overlay.querySelector('.postal-sheet'),body=overlay.querySelector('.postal-reader-body');let tab='question',requestedTab='question',tabVersion=0,closing=false,openingAnimation=Promise.resolve(),onResize=()=>{},alignClose=()=>{},foldProxy=null;
  if(fromEnvelope){
    const source=origin.paperElement,face=source.closest('.garden-letter'),top=sheet.querySelector('.postal-reader-topfold'),copy=face.cloneNode(false),paper=source.cloneNode(true);
    const scale=sheet.getBoundingClientRect().width/source.offsetWidth;
    sheet.style.setProperty('--postal-outline-inset',`${6*scale}px`);
    Object.assign(copy.style,{position:'absolute',left:`${-source.offsetLeft*scale}px`,top:`${-source.offsetTop*scale}px`,width:`${face.offsetWidth}px`,height:`${face.offsetHeight}px`,transform:`scale(${scale})`,transformOrigin:'top left'});
    Object.assign(paper.style,{transform:'none',translate:'0 0',visibility:'visible',transition:'none'});
    copy.append(paper);top.append(copy);sheet.style.setProperty('--postal-top-height',`${source.offsetHeight*scale}px`);
    const brand=top.querySelector('.garden-paper-brand'),reference=brand.querySelector('small'),mark=sheet.querySelector('.letter-close');
    alignClose=()=>{const sheetBox=sheet.getBoundingClientRect(),brandBox=brand.getBoundingClientRect(),referenceBox=reference.getBoundingClientRect();mark.style.top=`${referenceBox.top+referenceBox.height/2-sheetBox.top-mark.offsetHeight/2}px`;mark.style.left=`${brandBox.right-sheetBox.left-mark.offsetWidth}px`;};
    alignClose();
  }
  let restingBox=sheet.getBoundingClientRect();
  const foldBox=origin?.paper;
  const panelHeight=fromEnvelope?parseFloat(sheet.style.getPropertyValue('--postal-top-height')):restingBox.height/3;
  const clipMotion=(element,clips,duration,easing='cubic-bezier(.32,.04,.2,1)')=>{
    const offsets=clips.length===5?[0,.24,.5,.77,1]:clips.map((_,index)=>index/(clips.length-1));
    return element.animate(clips.map((clipPath,index)=>({clipPath,offset:offsets[index]})),{duration,easing,fill:'both'});
  };
  function makeFoldProxy(folded){
    const stage=document.createElement('div'),print=sheet.cloneNode(true);
    stage.className='postal-fold-stage';stage.setAttribute('aria-hidden','true');stage.inert=true;
    print.classList.add('postal-fold-print');print.removeAttribute('role');print.removeAttribute('aria-modal');print.removeAttribute('tabindex');print.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));
    print.querySelectorAll('button,textarea').forEach(node=>{node.tabIndex=-1;node.disabled=true;});
    Object.assign(print.style,{position:'absolute',left:'0',top:'0',width:`${restingBox.width}px`,height:`${restingBox.height}px`,margin:'0',visibility:'visible',opacity:'1'});
    const topHeight=sheet.querySelector('.postal-reader-topfold')?.getBoundingClientRect().height||panelHeight;
    const clipAt=(edge,bow=0)=>`polygon(0 0,100% 0,100% ${edge}px,83% ${edge+bow*.45}px,67% ${edge+bow*.85}px,50% ${edge+bow}px,33% ${edge+bow*.85}px,17% ${edge+bow*.45}px,0 ${edge}px)`;
    const distance=restingBox.height-topHeight;
    const foldClips=[clipAt(topHeight,6),clipAt(topHeight+distance*.2,13),clipAt(topHeight+distance*.52,21),clipAt(topHeight+distance*.82,12),clipAt(restingBox.height)];
    Object.assign(stage.style,{left:`${restingBox.left}px`,top:`${restingBox.top}px`,width:`${restingBox.width}px`,height:`${restingBox.height}px`,clipPath:folded?foldClips[0]:'inset(0 0 0 0)'});
    stage.append(print);overlay.append(stage);return {stage,foldClips};
  }
  function paint(){
    const current=getLatest();if(!current)return;
    overlay.querySelector('[data-letter-tab="replies"]').textContent=`回信 ${current.replies?.length||0}`;
    overlay.querySelectorAll('[data-letter-tab]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.letterTab===tab)));
    const awaiting=tab==='replies'&&!current.replies?.length;
    body.classList.toggle('is-awaiting',awaiting);
    const fullTitle=fromEnvelope&&Array.from(String(current.title??'')).length>30?`<h3 class="postal-reader-full-title">${esc(current.title)}</h3>`:'';
    body.innerHTML=tab==='question'?`${fullTitle}<p class="postal-salutation">亲爱的枝友：<br>见信好。</p><p class="postal-question">${esc(current.text)}</p>${current.photo?`<img class="postal-question-photo" src="${esc(current.photo)}" alt="这封信附上的植物照片">`:''}<p class="postal-signature">盼望你的回信<span>${esc(current.signature?.trim()||'一位养植物的枝友')} · ${esc(current.date)}</span></p>`:(current.replies?.length?current.replies.map(reply=>`<article class="postal-response ${reply.kind==='gardener'?'is-gardener':''}"><header><span>${esc(reply.by.replace(/\s*·\s*(?:本地)?演示/g,''))}</span><i>${reply.kind==='gardener'?'园艺建议':'枝友经验'}</i></header><p>${esc(reply.text)}</p></article>`).join(''):'<div class="postal-awaiting"><span>✉</span><h3>回信还在路上</h3><p>你可以先分享一条经验，或留下新的观察</p></div>');
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
    overlay.classList.add('is-closing');overlay.classList.remove('is-opened','is-washed');
    if(!reduced())await new Promise(resolve=>setTimeout(resolve,760));
    let paperReturned=false;
    if(!reduced()&&foldBox)try{
      restingBox=sheet.getBoundingClientRect();foldProxy=makeFoldProxy(false);sheet.style.visibility='hidden';sheet.style.opacity='0';
      const proxy=foldProxy;
      await clipMotion(proxy.stage,proxy.foldClips.slice().reverse(),740,'cubic-bezier(.32,.04,.25,.88)').finished;
      const returning=Promise.resolve(origin.returnPaper?.());returning.catch(()=>{});
      origin?.revealPaper?.();proxy.stage.remove();foldProxy=null;
      await returning;paperReturned=true;
    }catch{if(!paperReturned)try{await origin.returnPaper?.();}catch{}}
    else if(!reduced())try{await sheet.animate([{opacity:1},{opacity:0}],{duration:220,fill:'forwards'}).finished;}catch{}
    else if(foldBox)try{await origin.returnPaper?.();}catch{}
    foldProxy?.stage.remove();foldProxy=null;origin?.revealPaper?.();sheet.style.visibility='hidden';
    removeEventListener('resize',onResize);overlay.remove();if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});else document.querySelector('[data-talk-action="open"]')?.focus({preventScroll:true});foldBack?.();onClose?.();
  }
  let closeTask=null;
  const requestClose=()=>closeTask||(closeTask=close());
  overlay.requestClose=requestClose;
  overlay.addEventListener('click',event=>{if(event.target===overlay||event.target.closest('.letter-close'))requestClose();const button=event.target.closest('[data-letter-tab]');if(button)switchTab(button.dataset.letterTab);});
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
    if(event.key==='Escape'){event.preventDefault();event.stopPropagation();requestClose();}
    if(event.key==='Tab'){
      const nodes=[...sheet.querySelectorAll('button,textarea,[tabindex="0"]')].filter(element=>!element.disabled),first=nodes[0],last=nodes.at(-1);
      if(event.shiftKey&&(document.activeElement===first||document.activeElement===sheet)){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
  });
  paint();
  if(foldBox){
    if(reduced()){origin?.extracted?.();sheet.focus({preventScroll:true});overlay.classList.add('is-opened','is-washed');}
    else openingAnimation=(async()=>{
      restingBox=sheet.getBoundingClientRect();
      sheet.style.visibility='hidden';sheet.style.opacity='0';foldProxy=makeFoldProxy(true);origin?.extracted?.();
      const proxy=foldProxy;
      await clipMotion(proxy.stage,proxy.foldClips,800).finished;
      sheet.style.visibility='';sheet.style.opacity='';proxy.stage.remove();foldProxy=null;if(!closing){overlay.classList.add('is-opened','is-washed');sheet.focus({preventScroll:true});}
    })().catch(()=>{sheet.style.visibility='';sheet.style.opacity='';foldProxy?.stage.remove();foldProxy=null;if(!closing)overlay.classList.add('is-opened','is-washed');});
    onResize=()=>{openingAnimation.then(()=>{if(!closing&&overlay.isConnected){restingBox=sheet.getBoundingClientRect();alignClose();}}).catch(()=>{});};
    addEventListener('resize',onResize);
  }else{sheet.focus({preventScroll:true});overlay.classList.add('is-washed');if(!reduced())sheet.animate([{opacity:0},{opacity:1}],{duration:320,easing:'ease-out'});}
}

export function renderPostCompose(plants,stamp,draft){
  const plant=plants.find(plant=>plant.id===draft.plantId)||plants[0];
  const choice=(kind,label,value,items)=>`<div class="office-choice" data-choice="${kind}" data-value="${esc(value)}"><span class="office-choice-label">${label}</span><details><summary aria-label="${label}，当前${esc(items.find(item=>item.value===value)?.label||value)}"><span class="office-choice-value">${esc(items.find(item=>item.value===value)?.label||value)}</span><span class="office-choice-chevron" aria-hidden="true"></span></summary><div class="office-choice-options" role="listbox" aria-label="${label}">${items.map(item=>`<button type="button" role="option" data-value="${esc(item.value)}" aria-selected="${item.value===value}">${esc(item.label)}</button>`).join('')}</div></details></div>`;
  return `<main class="page office-compose" aria-label="寄一封枝友来信">
    <div class="office-writing-room"><form class="office-writing-paper" id="office-letter-form"><fieldset>
      <button type="button" class="office-compose-close" data-nav="letters" aria-label="收起信纸，返回来信">×</button>
      <div class="office-writing-heading"><span class="office-writing-kicker">下一枝 · 枝条邮局</span></div>
      <div class="office-writing-selects">${choice('plant','关于这一枝',plant.id,plants.map(item=>({value:item.id,label:item.name})))}${choice('category','这一页想说',draft.category,['扦插','光照','浇水','叶片','其他'].map(item=>({value:item,label:item})))}</div>
      <label class="office-writing-label" for="office-letter-title">信的题目</label><input id="office-letter-title" name="title" type="text" maxlength="30" required placeholder="例如：新叶卷起，是在等水吗？" value="${esc(draft.title)}">
      <p class="office-writing-salutation">亲爱的枝友：</p>
      <label class="office-writing-label office-writing-body-label" for="office-letter-text">写下你的观察</label><textarea id="office-letter-text" name="text" maxlength="600" required placeholder="这几天，我的枝条有了一点变化……
它现在放在……，我想问……">${esc(draft.text)}</textarea>
      <div class="office-writing-sign">盼望你的回信<label class="office-writing-signature-field" for="office-letter-signature"><input class="office-writing-signature" id="office-letter-signature" name="signature" type="text" maxlength="8" aria-label="署名，最多八个字" value="${esc(Array.from(draft.signature??'一位养植物的枝友').slice(0,8).join(''))}"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4 13 9-9 3 3-9 9-4 1 1-4Zm7-7 3 3"/></svg></label></div>
      <div class="office-writing-bottom"><label class="office-photo-label"><input id="office-letter-photo" type="file" accept="image/*" aria-label="夹进一张植物照片"><span>＋ 夹进一张照片</span><img class="office-photo-preview" ${draft.photo?`src="${esc(draft.photo)}"`:'hidden'} alt="信件附图预览"></label><button type="button" class="office-remove-photo" ${draft.photo?'':'hidden'}>移除</button><button type="submit" class="office-send">折好寄出 ↗</button></div>
      <p class="office-writing-status" role="status" aria-live="polite"></p>
    </fieldset></form></div>
  </main>`;
}
export function mountPostCompose({plants,stamp,draft,readPhoto,onSend,onComplete}){
  const root=document.querySelector('.office-compose');if(!root)return;
  const controller=new AbortController(),signal=controller.signal,animations=new Set(),choiceMotions=new Map();
  const form=root.querySelector('form'),fieldset=form.querySelector('fieldset'),message=root.querySelector('.office-writing-status');
  const bodyField=root.querySelector('#office-letter-text');
  let sending=false,reading=false,photoVersion=0;
  const animate=(element,frames,duration)=>{
    const animation=element.animate(frames,{duration,easing:'cubic-bezier(.2,.75,.22,1)',fill:'forwards'});animations.add(animation);animation.finished.catch(()=>{});return animation;
  };
  const centerUnderlayEnvelope=async()=>{
    const underlay=document.querySelector('.letter-mailbox.is-compose-underlay'),well=underlay?.querySelector('.mailbox-well');
    if(!well)return null;
    const buttons=[...well.querySelectorAll('.mailbox-letter')],middle=innerHeight/2;
    const centerOf=button=>{const box=button.getBoundingClientRect();return (box.top+box.bottom)/2;};
    const below=buttons.filter(button=>centerOf(button)>middle+36).sort((a,b)=>centerOf(a)-centerOf(b))[0];
    const above=buttons.filter(button=>centerOf(button)<middle-36).sort((a,b)=>centerOf(b)-centerOf(a))[0];
    const button=below||above||buttons.sort((a,b)=>Math.abs(centerOf(a)-middle)-Math.abs(centerOf(b)-middle))[0];
    if(!button)return null;
    const view=well.getBoundingClientRect(),box=button.getBoundingClientRect(),from=well.scrollTop;
    const delta=(box.top+box.bottom-view.top-view.bottom)/2+12;
    const to=Math.max(0,Math.min(well.scrollHeight-well.clientHeight,from+delta));
    if(reduced()||Math.abs(to-from)<2){well.scrollTop=to;return button.dataset.id;}
    await new Promise(resolve=>{let start=0;const step=now=>{if(signal.aborted){resolve();return;}start ||=now;const t=Math.min(1,(now-start)/540),ease=1-(1-t)**3;well.scrollTop=from+(to-from)*ease;if(t<1)requestAnimationFrame(step);else resolve();};requestAnimationFrame(step);});
    return button.dataset.id;
  };
  const updateDraft=()=>{draft.plantId=root.querySelector('[data-choice="plant"]').dataset.value;draft.category=root.querySelector('[data-choice="category"]').dataset.value;draft.title=root.querySelector('#office-letter-title').value;draft.text=root.querySelector('#office-letter-text').value;draft.signature=root.querySelector('#office-letter-signature').value;};
  form.addEventListener('input',event=>{event.target.setCustomValidity?.('');updateDraft();},{signal});
  // The ruled writing area should focus wherever it is tapped, including a
  // little breathing room at its edges rather than only the native text line.
  fieldset.addEventListener('pointerdown',event=>{
    if(event.target.closest('button,input,textarea,summary,select,[role="option"]'))return;
    const box=bodyField.getBoundingClientRect();
    if(event.clientX>=box.left-8&&event.clientX<=box.right+8&&event.clientY>=box.top-10&&event.clientY<=box.bottom+10)bodyField.focus({preventScroll:true});
  },{signal});
  const setChoiceOpen=(details,open)=>{
    const options=details.querySelector('.office-choice-options'),previous=choiceMotions.get(details);
    const current=previous?getComputedStyle(options):null;
    const fromClip=current?.clipPath,fromTransform=current?.transform;
    previous?.cancel();choiceMotions.delete(details);
    details.dataset.choiceState=open?'open':'closed';
    if(open)details.open=true;
    else if(!details.open)return;
    if(reduced()){if(!open)details.open=false;return;}
    const motion=options.animate([
      {clipPath:fromClip&&fromClip!=='none'?fromClip:open?'inset(0 0 100% 0)':'inset(0)',transform:fromTransform&&fromTransform!=='none'?fromTransform:open?'translateY(-5px)':'translateY(0)'},
      {clipPath:open?'inset(0)':'inset(0 0 100% 0)',transform:open?'translateY(0)':'translateY(-5px)'}
    ],{duration:open?240:190,easing:'cubic-bezier(.2,.75,.22,1)',fill:'both'});
    choiceMotions.set(details,motion);
    motion.finished.then(()=>{
      if(choiceMotions.get(details)!==motion)return;
      if(!open)details.open=false;
      choiceMotions.delete(details);motion.cancel();
    }).catch(()=>{});
  };
  const closeChoices=()=>root.querySelectorAll('.office-choice details').forEach(details=>setChoiceOpen(details,false));
  root.querySelectorAll('.office-choice').forEach(choice=>{
    const details=choice.querySelector('details'),summary=details.querySelector('summary');
    summary.addEventListener('click',event=>{
      event.preventDefault();
      const opening=details.dataset.choiceState!=='open';
      if(opening)root.querySelectorAll('.office-choice details').forEach(other=>{if(other!==details)setChoiceOpen(other,false);});
      setChoiceOpen(details,opening);
    },{signal});
    choice.querySelectorAll('[role="option"]').forEach(option=>option.addEventListener('click',()=>{
      choice.dataset.value=option.dataset.value;
      choice.querySelector('.office-choice-value').textContent=option.textContent;
      summary.setAttribute('aria-label',`${choice.querySelector('.office-choice-label').textContent}，当前${option.textContent}`);
      choice.querySelectorAll('[role="option"]').forEach(item=>item.setAttribute('aria-selected',String(item===option)));
      setChoiceOpen(details,false);summary.focus();updateDraft();
    },{signal}));
  });
  document.addEventListener('pointerdown',event=>{if(!root.contains(event.target)||!event.target.closest('.office-choice'))closeChoices();},{signal});
  root.addEventListener('keydown',event=>{if(event.key==='Escape')closeChoices();},{signal});
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
    let letter;
    try{letter=onSend({...draft,title:draft.title.trim(),text:draft.text.trim(),signature:Array.from(draft.signature.trim()).slice(0,8).join('')||'一位养植物的枝友'});}
    catch{sending=false;fieldset.disabled=false;message.textContent='这封信暂时未能保存。内容已保留，可移除照片后再试。';return;}
    freshId=letter.id;
    try{
      if(!reduced()){
        const distance=innerHeight-form.getBoundingClientRect().top+80;
        await animate(form,[{transform:'translateY(0)'},{transform:`translateY(${distance}px)`}],650).finished;
        form.style.transform=`translateY(${distance}px)`;
      }
      if(!signal.aborted)freshAnchorId=await centerUnderlayEnvelope();
    }catch{}finally{
      if(!signal.aborted){root.classList.add('is-sent');onComplete(letter);}
    }
  },{signal});
  dispose=()=>{controller.abort();photoVersion++;animations.forEach(animation=>animation.cancel());animations.clear();choiceMotions.forEach(animation=>animation.cancel());choiceMotions.clear();};
}
