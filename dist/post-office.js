import {renderLetterTheatre,mountLetterTheatre} from './letter-theatre.js';
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
let dispose=()=>{},refresh=()=>{},freshId=null,readerOrigin=null,returnEnvelope=null;
export function cleanupPostOffice(){dispose();dispose=()=>{};refresh=()=>{};readerOrigin=null;returnEnvelope=null;}
export function refreshPostOffice(){refresh();}
const isDemo=letter=>letter.id.startsWith('s');

function envelope(letter,plant){
  return `<span class="garden-letter"><img class="garden-botanical" src="./assets/${plant.art}" alt="" draggable="false"><span class="garden-envelope-back"></span><span class="garden-envelope-flap"></span><span class="garden-letter-paper"><span class="garden-botanical-pin"><img src="./assets/${plant.art}" alt="" draggable="false"><i></i></span><span class="garden-letter-topic">${plant.name} · ${esc(letter.category)}</span><span class="garden-salutation">亲爱的枝友：</span><strong class="garden-letter-subject">${esc(letter.title)}</strong></span><span class="garden-envelope-pocket"><img src="./assets/letter-pocket-paper.png" alt="" draggable="false"></span><span class="garden-envelope-address">致，每一位枝友<span>待寄</span></span></span>`;
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
  overlay.innerHTML=`<article class="letter-sheet postal-sheet${origin?.kind==='mailbox'?' is-folded':''}" role="dialog" aria-modal="true" aria-labelledby="postal-letter-title" tabindex="-1"><div class="postal-sheet-head"><span>${plant.name} · ${esc(letter.category)}<small>${esc(letter.date)} / ${isDemo(letter)?'演示来信':'本地来信'}</small></span><button class="round-control letter-close" aria-label="收好这封信">×</button></div><div class="postal-sheet-postage" aria-hidden="true">${stamp(plant.id,true)}</div><h2 id="postal-letter-title">${esc(letter.title)}</h2><div class="postal-reader-tabs" role="group" aria-label="翻阅信件"><button data-letter-tab="question" aria-pressed="true">来信正文</button><button data-letter-tab="replies" aria-pressed="false"></button></div><div class="postal-reader-body"></div><form class="postal-reply-form"><label for="postal-reply">回一封经验</label><div><textarea id="postal-reply" rows="2" maxlength="300" required placeholder="说说你的观察或建议…"></textarea><button type="submit">寄出回复 ↗</button></div><span class="postal-reply-status" role="status" aria-live="polite"></span></form><div class="postal-sheet-bottom">下一枝 · 农科村枝条邮局</div><div class="postal-fold-verso" aria-hidden="true"><div class="postal-fold-preview"><small>${plant.name} · ${esc(letter.category)}</small><span>亲爱的枝友：</span><strong>${esc(letter.title)}</strong></div><div class="postal-fold-mark"><span>✦</span><small>下一枝 · 私函</small></div></div></article>`;
  if(origin?.kind==='mailbox')overlay.classList.add('mailbox-reader');
  document.body.append(overlay);const sheet=overlay.querySelector('.postal-sheet'),body=overlay.querySelector('.postal-reader-body');sheet.style.setProperty('--fold-botanical',`url("./assets/${plant.art}")`);let tab='question',closing=false,openingAnimation=Promise.resolve(),onResize=()=>{};
  let restingBox=sheet.getBoundingClientRect();
  const foldBox=origin?.paper;
  const creaseBox=()=>({left:foldBox.left,top:foldBox.top+(restingBox.top-foldBox.top)*.62,width:foldBox.width,height:foldBox.height+(restingBox.height-foldBox.height)*.62});
  const setBox=box=>Object.assign(sheet.style,{position:'fixed',left:`${box.left}px`,top:`${box.top}px`,width:`${box.width}px`,height:`${box.height}px`,margin:'0'});
  const tweenBox=async(from,to,duration)=>{
    const animation=sheet.animate([{left:`${from.left}px`,top:`${from.top}px`,width:`${from.width}px`,height:`${from.height}px`},{left:`${to.left}px`,top:`${to.top}px`,width:`${to.width}px`,height:`${to.height}px`}],{duration,easing:'cubic-bezier(.22,.76,.24,1)',fill:'forwards'});
    await animation.finished;animation.cancel();setBox(to);
  };
  const turn=async(reverse=false)=>{
    const first=sheet.animate([{transform:'perspective(900px) rotateY(0deg)'},{transform:`perspective(900px) rotateY(${reverse?-88:88}deg)`}],{duration:270,easing:'cubic-bezier(.45,0,.55,1)',fill:'forwards'});
    await first.finished;first.cancel();sheet.classList.toggle('is-reversed',!reverse);
    const second=sheet.animate([{transform:`perspective(900px) rotateY(${reverse?88:-88}deg)`},{transform:'perspective(900px) rotateY(0deg)'}],{duration:300,easing:'cubic-bezier(.22,.76,.24,1)',fill:'forwards'});
    await second.finished;second.cancel();
  };
  function paint(){
    const current=getLatest();if(!current)return;
    overlay.querySelector('[data-letter-tab="replies"]').textContent=`回信 ${current.replies?.length||0}`;
    overlay.querySelectorAll('[data-letter-tab]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.letterTab===tab)));
    body.innerHTML=tab==='question'?`<p class="postal-salutation">亲爱的枝友：<br>见信好。</p><p class="postal-question">${esc(current.text)}</p>${current.photo?`<img class="postal-question-photo" src="${esc(current.photo)}" alt="这封信附上的植物照片">`:''}<p class="postal-signature">盼你的回信。<span>一位养植物的枝友 · ${esc(current.date)}</span></p><p class="postal-demo-note">${isDemo(current)?'演示来信 · 园艺建议为预设内容':'本地来信 · 保存在当前浏览器'}</p>`:(current.replies?.length?current.replies.map(reply=>`<article class="postal-response ${reply.kind==='gardener'?'is-gardener':''}"><header><span>${esc(reply.by)}</span><i>${reply.kind==='gardener'?'园艺建议':'枝友经验'}</i></header><p>${esc(reply.text)}</p></article>`).join(''):'<div class="postal-awaiting"><span>✉</span><h3>回信还在路上</h3><p>你可以先分享一条经验，或留下新的观察。</p></div>');
    body.scrollTop=0;
  }
  async function close(){
    if(closing)return;closing=true;
    await openingAnimation.catch(()=>{});
    overlay.style.background='transparent';overlay.style.backdropFilter='none';
    if(!reduced()&&foldBox)try{
      const current=sheet.getBoundingClientRect();
      const crease=creaseBox();
      await tweenBox(current,crease,450);
      sheet.classList.add('is-folded');
      await tweenBox(crease,foldBox,540);
      await turn(true);
    }catch{}
    else if(!reduced())try{await sheet.animate([{opacity:1},{opacity:0}],{duration:220,fill:'forwards'}).finished;}catch{}
    sheet.style.visibility='hidden';try{await origin?.returnPaper?.();}catch{}
    removeEventListener('resize',onResize);overlay.remove();if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});else document.querySelector('[data-talk-action="open"]')?.focus({preventScroll:true});foldBack?.();onClose?.();
  }
  overlay.addEventListener('click',event=>{if(event.target===overlay||event.target.closest('.letter-close'))close();const button=event.target.closest('[data-letter-tab]');if(button){tab=button.dataset.letterTab;paint();}});
  overlay.querySelector('form').addEventListener('submit',event=>{
    event.preventDefault();const input=overlay.querySelector('#postal-reply'),text=input.value.trim();
    if(!text){input.setCustomValidity('写一句你的观察，再寄出吧。');input.reportValidity();return;}
    try{onReply(text);}catch{overlay.querySelector('.postal-reply-status').textContent='回复未能保存，文字已保留，请稍后再试。';return;}
    input.value='';tab='replies';paint();
    overlay.querySelector('.postal-reply-status').textContent='回复已寄出 · 保存在本机';body.scrollTop=body.scrollHeight;
    if(!reduced())body.lastElementChild?.animate([{scale:1.025,opacity:.4},{scale:1,opacity:1}],{duration:280,easing:'ease-out'});
  });
  overlay.querySelector('#postal-reply').addEventListener('input',event=>event.target.setCustomValidity(''));
  overlay.addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();}
    if(event.key==='Tab'){
      const nodes=[...sheet.querySelectorAll('button,textarea,[tabindex="0"]')].filter(element=>!element.disabled),first=nodes[0],last=nodes.at(-1);
      if(event.shiftKey&&(document.activeElement===first||document.activeElement===sheet)){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
  });
  paint();sheet.focus({preventScroll:true});
  if(foldBox){
    setBox(foldBox);overlay.style.background='transparent';origin?.extracted?.();
    if(reduced()){setBox(restingBox);sheet.classList.remove('is-folded');overlay.style.background='';}
    else openingAnimation=(async()=>{
      await turn();
      const crease=creaseBox();
      await tweenBox(foldBox,crease,540);
      overlay.style.background='';
      sheet.classList.remove('is-folded');
      await tweenBox(crease,restingBox,450);
    })();
    onResize=()=>{openingAnimation.then(()=>{
      if(closing||!overlay.isConnected)return;
      for(const key of ['position','left','top','width','height','margin'])sheet.style[key]='';
      restingBox=sheet.getBoundingClientRect();setBox(restingBox);
    }).catch(()=>{});};
    addEventListener('resize',onResize);
  }else if(!reduced())sheet.animate([{opacity:0},{opacity:1}],{duration:320,easing:'ease-out'});
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
