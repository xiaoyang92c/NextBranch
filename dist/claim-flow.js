import {mountClaimPress} from './claim-press.js?v=20261021-5';
const steps = ['信息', '方式', '约定', '小票'];
const choices = {
  place: ['阳台', '窗边', '庭院'],
  light: ['充足日照', '半日照', '明亮散射光', '光照偏弱'],
  experience: ['第一次种植', '尝试过扦插', '比较有经验']
};
const methods = [
  {value:'未生根枝条', title:'从一根枝条开始', tag:'自己尝试扦插', text:'陪一根枝条慢慢生根，适合愿意观察、耐心等待的你。'},
  {value:'已生根幼苗', title:'从一株小苗开始', tag:'领取已生根幼苗', text:'从照顾一株小苗开始，适合第一次种植的你。'}
];
// Replace this demo batch with station inventory when a real service is connected.
const demoAvailability = {
  podocarpus:[false,true],osmanthus:[true,true],citron:[false,true],'five-lobed-maple':[false,true],crape:[true,true],
  camellia:[true,true],ginkgo:[false,true],bougainvillea:[true,true],serissa:[true,true],pomegranate:[true,true]
};
const itemUnit=plant=>['podocarpus','citron','five-lobed-maple','ginkgo'].includes(plant.id)?'株':'枝';
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const date = () => new Date().toLocaleString('zh-CN', {timeZone:'Asia/Shanghai', hour12:false});

export function createClaimFlow({getPlant, stamp, getClaims, persist, render, go}) {
  const drafts = new Map();
  let effect = null,dispose=()=>{},nextEntrance='feed',activePress=null;
  function cleanup(){dispose();dispose=()=>{};activePress=null;}

  function draftFor(id) {
    if (!drafts.has(id)) {
      let saved;
      try { saved = JSON.parse(sessionStorage.getItem(`next-branch-claim:${id}`)); } catch {}
      const draft = {step:1,nick:'',place:'',light:'',experience:'',form:'',agreed:false,...saved};
      draft.step = [1,2,3].includes(draft.step) ? draft.step : 1;
      for (const field of Object.keys(choices)) if (!choices[field].includes(draft[field])) draft[field] = '';
      if (!methods.some(method => method.value === draft.form)) draft.form = '';
      drafts.set(id, draft);
    }
    return drafts.get(id);
  }
  function saveDraft(id) {
    try { sessionStorage.setItem(`next-branch-claim:${id}`, JSON.stringify(draftFor(id))); } catch {}
  }
  function clearDraft(id) {
    drafts.delete(id);
    try { sessionStorage.removeItem(`next-branch-claim:${id}`); } catch {}
  }
  function currentClaim(id) {
    return [...getClaims()].reverse().find(claim => claim.plantId === id && !claim.id.startsWith('DEMO-'));
  }
  function available(id, value) {
    const index = methods.findIndex(method => method.value === value);
    return index >= 0 && (demoAvailability[id] || [false,false])[index];
  }
  function informationComplete(draft) {
    return typeof draft.nick === 'string' && draft.nick.trim() && Object.keys(choices).every(field => choices[field].includes(draft[field]));
  }
  function advice(plant, draft) {
    if (!draft.place || !draft.light || !draft.experience) return {warn:false, title:'给这一枝，找一个合适的位置。', text:`${plant.name}偏爱${plant.light}。填好位置、光照和经验后，我们一起看看。`};
    if (draft.light === '光照偏弱') return {warn:true, title:'先为它找一处更明亮的位置。', text:'目前的光照可能不足。可以调整摆放条件，或先到展馆看看其他枝条，领取时再请驿站协助判断。'};
    if (plant.light.includes('充足日照') && draft.light === '明亮散射光') return {warn:true,title:'这一枝，还需要多一点阳光。',text:`${plant.name}偏爱${plant.light}。建议调整位置或光照条件；若只有散射光，可以看看六月雪、桂花。`};
    if (['serissa','osmanthus','camellia','podocarpus'].includes(plant.id) && draft.light === '充足日照') return {warn:true,title:'给它留一点遮阴，会更安心。',text:'如果这里会被正午烈日直晒，建议移到有柔和晨光或明亮散射光的位置。领取时可以再向驿站确认。'};
    return {warn:false,title:'这里可以成为它的下一站。',text:`${plant.care}${draft.experience === '第一次种植' ? ' 第一次种植，可以优先选择已生根幼苗；如果本批暂无幼苗，也可以在驿站学习扦插后再尝试。' : ' 领取时可以向驿站说明你的种植条件。'}`};
  }
  function adviceMarkup(plant,draft){
    const note=advice(plant,draft);
    return `<aside class="suitability ${note.warn?'warn':''}"><span class="claim-note-label">安置附注</span><strong data-claim-ink>${note.title}</strong><p data-claim-ink>${note.text}</p>${note.warn?'<button type="button" class="text-back" data-claim-change-plant>换一枝看看 ↗</button>':''}</aside>`;
  }
  function progress(step){return `<ol class="claim-progress" aria-label="领取小票进度">${steps.map((label,index)=>`<li class="${index+1===step?'is-current':index+1<step?'is-complete':''}" ${index+1===step?'aria-current="step"':''}><span>${String(index+1).padStart(2,'0')}</span><b>${label}</b></li>`).join('')}</ol>`;}
  const source=plant=>plant.source.replace(/\s*·\s*演示/g,'').replace(/^农科村/,'');
  function paperHeader(plant,receipt=false){return `<header class="claim-mailhead"><div class="claim-mailtitle"><span class="claim-post-office" data-claim-ink>农科村 · 枝条再生驿站</span><h1 data-claim-ink>下一枝</h1><p class="claim-mail-kicker">${receipt?'领取凭条':'领取登记'} · BRANCH RECEIPT</p></div><div class="claim-receipt-rule" aria-hidden="true">********************************</div><div class="claim-specimen-row"><div class="claim-addressee"><span>品名 / ITEM 01</span><h2 data-claim-ink>${plant.name}</h2><p>${plant.no} · ${source(plant)}</p></div><div class="claim-specimen-branch" aria-hidden="true"><img src="./assets/${plant.art}" alt="" draggable="false"></div></div></header><dl class="claim-origin"><div><dt>领取数量</dt><dd>1 ${itemUnit(plant)}</dd></div><div><dt>领取地点</dt><dd>农科村枝条再生驿站</dd></div></dl>`;}
  function machine(plant){return `<div class="claim-machine" role="img" aria-label="复古小票打印机"><img class="claim-machine-art" src="./assets/vintage-receipt-printer-neutral.png" alt="" draggable="false"></div><div class="claim-output-lip"><span class="claim-machine-status" role="status">就绪</span><button class="claim-machine-close" type="button" data-detail="${plant.id}" aria-label="关闭领取单，返回植物档案"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6L18 18"/><path d="M18 6L6 18"/></svg></button></div>`;}
  function dispatch(plant,inside,{receipt=false,step=1,animation=''}={}){
    const entrance=nextEntrance;nextEntrance='feed';
    return `<main class="page claim-page claim-flow claim-dispatch ${receipt?'claim-receipt':''}${animation}" data-claim-plant="${plant.id}" style="--claim-scene:${plant.bg};--claim-ink:${plant.sceneInk||plant.ink};--claim-soft:${plant.sceneFine||plant.ink};--claim-rule:color-mix(in srgb,${plant.sceneInk||plant.ink} 32%,transparent)" data-print="${entrance}"><div class="claim-workspace"><section class="claim-dispenser" aria-label="枝条小票打印机">${machine(plant)}<div class="claim-paper-feed"><article class="form-paper dispatch-paper">${receipt?`<button class="claim-ticket-close" type="button" data-detail="${plant.id}" aria-label="收好小票，返回植物档案"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6L18 18"/><path d="M18 6L6 18"/></svg></button>`:''}${paperHeader(plant,receipt)}${progress(step)}${inside}<footer class="claim-paper-foot">农科村 · 下一枝 <span>请妥善保留此凭条</span></footer></article></div></section></div></main>`;
  }
  function radioGroup(field, title, draft) {
    return `<fieldset class="claim-field"><legend data-claim-ink>${title}</legend><div class="option-row">${choices[field].map(value=>`<label class="option claim-option ${draft[field]===value?'selected':''}"><input type="radio" name="claim-${field}" aria-label="${value}" value="${value}" data-claim-field="${field}" ${draft[field]===value?'checked':''}><svg class="claim-choice-check" viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 8.2 6.5 12 13.5 3.5"/></svg><span data-claim-ink>${value}</span></label>`).join('')}</div></fieldset>`;
  }
  function methodNote(plant, draft) {
    if (!available(plant.id, draft.form)) return '';
    return `<div class="suitability"><span class="claim-note-label">养护附注</span><strong data-claim-ink>${draft.form==='未生根枝条'?'慢慢等根，也是一段生长。':'先安顿，再开始新的生长。'}</strong><p data-claim-ink>${draft.form==='未生根枝条'?plant.tip:'领取后先让幼苗适应新环境，避免马上换盆或反复移动。'+plant.care}</p><small class="claim-secondary-note" data-claim-ink>${draft.form==='未生根枝条'?'到站时可体验扦插指导，再把枝条带回家。':'到站时可了解浇水、摆放与日常照顾方法。'}</small></div>`;
  }
  function summaryRows(plant, values) {
    return `<dl class="claim-review"><div><dt>收件人</dt><dd data-claim-ink>${escape(values.nick)}</dd></div><div><dt>新家</dt><dd data-claim-ink>${escape(values.place)} · ${escape(values.light)}</dd></div><div><dt>种植经验</dt><dd data-claim-ink>${escape(values.experience || '未记录')}</dd></div><div><dt>领取方式</dt><dd data-claim-ink>${escape(values.form)}</dd></div><div><dt>领取地点</dt><dd>农科村枝条再生驿站</dd></div></dl>`;
  }
  function content(plant,draft){
    if(draft.step===1)return `<div class="claim-step-heading"><h2 id="claim-step-title" tabindex="-1" data-claim-ink>写下这一枝的新家</h2></div><div class="form-row"><label for="claim-nick" data-claim-ink>收件人昵称</label><input id="claim-nick" class="form-input" placeholder="你的名字或昵称" maxlength="18" autocomplete="nickname" value="${escape(draft.nick)}" required></div>${radioGroup('place','种植位置',draft)}${radioGroup('light','光照条件',draft)}${radioGroup('experience','种植经验',draft)}<div id="claim-advice" aria-live="polite">${adviceMarkup(plant,draft)}</div>`;
    if(draft.step===2)return `<div class="claim-step-heading"><h2 id="claim-step-title" tabindex="-1" data-claim-ink>选择生长的起点</h2></div><fieldset class="claim-field claim-methods"><legend class="claim-sr-only">选择领取方式</legend>${methods.map((method,index)=>{const enabled=available(plant.id,method.value);return `<label class="claim-method ${draft.form===method.value?'selected':''} ${enabled?'':'is-unavailable'}"><input type="radio" name="claim-form" aria-label="${method.title}" data-claim-field="form" value="${method.value}" ${draft.form===method.value?'checked':''} ${enabled?'':'disabled'}><span class="claim-method-copy"><strong data-claim-ink>${method.title}</strong><span data-claim-ink>${method.text}</span>${enabled?'':'<small>暂未提供</small>'}</span><span class="claim-method-mark" aria-hidden="true">选定</span></label>`}).join('')}</fieldset><div id="claim-method-note" aria-live="polite">${methodNote(plant,draft)}</div><p class="claim-footnote" data-claim-ink>实际领取安排，请与驿站确认</p>`;
    return `<div class="claim-step-heading"><h2 id="claim-step-title" tabindex="-1" data-claim-ink>把这一枝，认真带回家</h2></div><div class="claim-agreement"><p data-claim-ink>枝条不保证每次都能生根，小苗也需要时间适应新家。请给它一点耐心。</p><p data-claim-ink>养护中遇到问题，可以在「枝友来信」求助。即使没有成功，也能留下记录，带着新的建议再试一次。</p><p data-claim-ink>请前往农科村枝条再生驿站领取，并在现场完成必要的扦插或养护指导。</p></div>${summaryRows(plant,draft)}<div class="claim-edit-links"><button type="button" class="text-back" data-claim-step="1">修改收件信息</button><button type="button" class="text-back" data-claim-step="2">修改领取方式</button></div><label class="claim-consent"><input id="claim-agreed" type="checkbox" ${draft.agreed?'checked':''}><span data-claim-ink>我已了解，愿意照顾这一枝，也愿意在需要时求助</span></label>`;
  }
  function renderForm(plant,draft){return dispatch(plant,`<form id="claim-step-form" novalidate><div class="claim-step-content" data-stage="${draft.step}">${content(plant,draft)}</div><p class="required-hint" id="claim-error" role="alert" hidden></p><div class="claim-step-actions">${draft.step>1?'<button type="button" class="line-action" data-claim-prev>← 上一步</button>':''}<button type="submit" class="solid-action">${draft.step===1?'下一步 · 领取方式':draft.step===2?'下一步 · 小小约定':'确认并打印小票'} <span>↗</span></button></div>${draft.editingId?'<button type="button" class="text-back claim-keep-ticket" data-claim-keep>保留原小票，暂不修改</button>':''}</form>`,{step:draft.step});}
  function qr(id) {
    const n=21,grid=Array.from({length:n},()=>Array(n).fill(null));let seed=2166136261;
    for(const char of id)seed=Math.imul(seed^char.charCodeAt(0),16777619)>>>0;
    const put=(x,y,value)=>{if(x>=0&&y>=0&&x<n&&y<n)grid[y][x]=value;};
    for(const [x,y] of [[0,0],[14,0],[0,14]])for(let dy=-1;dy<=7;dy++)for(let dx=-1;dx<=7;dx++)put(x+dx,y+dy,dx>=0&&dx<=6&&dy>=0&&dy<=6&&(dx===0||dx===6||dy===0||dy===6||(dx>=2&&dx<=4&&dy>=2&&dy<=4)));
    for(let i=8;i<13;i++){put(i,6,i%2===0);put(6,i,i%2===0);}
    const bits='101010000010010';for(let i=0;i<9;i++)if(i!==6){put(8,i,bits[i]==='1');put(i,8,bits[14-i]==='1');}for(let i=0;i<8;i++){put(20-i,8,bits[i]==='1');put(8,20-i,bits[14-i]==='1');}put(8,13,true);
    let cells='';for(let y=0;y<n;y++)for(let x=0;x<n;x++){if(grid[y][x]===null){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;grid[y][x]=(seed>>>0)%100<48;}if(grid[y][x])cells+=`M${x+4} ${y+4}h1v1h-1Z`;}
    return `<div class="fake-qr" role="img" aria-label="小票图形码，仅作展示"><svg viewBox="0 0 29 29" shape-rendering="crispEdges" aria-hidden="true"><rect width="29" height="29" fill="#fffbed"/><path d="${cells}" fill="#31583e"/></svg></div>`;
  }
  function renderTicket(claim,plant){
    const claimed=claim.status==='claimed',animation=effect?.id===claim.id?` is-new-${effect.kind}`:'';effect=null;
    return dispatch(plant,`<section class="claim-ticket"><div class="claim-ticket-heading"><div><span class="claim-note-label">领取状态 / STATUS</span><h2 class="ticket-title" data-claim-ink>${claimed?'已领取':'待到站领取'}</h2><p class="ticket-sub" data-claim-ink>收件人 ${escape(claim.nick)}</p></div><div class="claim-ticket-mark" role="status">${claimed?'<div class="red-postmark">已领取</div>':'<div class="claim-reserved-seal">待领取</div>'}</div></div><dl class="ticket-dl"><div><dt>枝条编号</dt><dd data-claim-ink>${plant.no}</dd></div><div><dt>领取方式</dt><dd data-claim-ink>${escape(claim.form)}</dd></div><div><dt>小票编号</dt><dd class="claim-serial">${escape(claim.id)}</dd></div><div><dt>打印时间</dt><dd data-claim-ink>${escape(claim.reservedAt||claim.date)}</dd></div><div><dt>种植位置</dt><dd data-claim-ink>${escape(claim.place)} · ${escape(claim.light||'未记录')}</dd></div>${claimed?`<div><dt>领取时间</dt><dd data-claim-ink>${escape(claim.pickedUpAt||claim.date)}</dd></div>`:''}</dl><div class="ticket-total"><span>合计 / TOTAL</span><strong>1 ${itemUnit(plant)}　${plant.name}</strong></div><div class="ticket-bottom">${qr(claim.id)}<div><span class="claim-note-label">到站出示此小票</span><p data-claim-ink>农科村枝条再生驿站<br>领取安排以驿站确认为准</p></div></div><div class="suitability"><span class="claim-note-label">${claimed?'后续记录':'领取说明'}</span><p data-claim-ink>${claimed?'已加入「枝条放映室」，可继续记录生长近况。':'到站领取并完成指导后，再点击下方按钮登记。小票保存在当前设备。'}</p></div><div class="ticket-actions">${claimed?`<button class="solid-action" data-nav="album">打开枝条放映室 <span>↗</span></button><button class="line-action" data-care="${plant.id}">写一封养护来信 <span>↗</span></button>`:`<button class="solid-action" data-claim-pickup="${claim.id}">我已到站领取 <span>↗</span></button><button class="line-action" data-claim-edit="${claim.id}">修改这张小票 <span>↗</span></button>`}</div><p class="required-hint" id="claim-error" role="alert" hidden></p></section>`,{receipt:true,step:4,animation});
  }
  function showError(message) {
    const element = document.querySelector('#claim-error');
    if (!element) return;
    element.textContent = message;
    element.hidden = false;
    element.scrollIntoView({block:'nearest',behavior:'smooth'});
  }
  function refresh(plant, focus = true) {
    nextEntrance='step';render();
    if (focus) document.querySelector('#claim-step-title')?.focus({preventScroll:true});
    window.scrollTo({top:0,behavior:'instant'});
  }
  function scrollPageUp(page) {
    const startY=window.scrollY;
    if(startY<3)return Promise.resolve();
    if(matchMedia('(prefers-reduced-motion: reduce)').matches){window.scrollTo({top:0,behavior:'instant'});return Promise.resolve();}
    return new Promise(resolve=>{
      const start=performance.now(),duration=Math.min(860,540+startY*.16);
      function frame(now){
        if(!page.isConnected){resolve();return;}
        const t=Math.min(1,(now-start)/duration),curve=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
        window.scrollTo({top:startY*(1-curve),behavior:'instant'});
        if(t<1)requestAnimationFrame(frame);else resolve();
      }
      requestAnimationFrame(frame);
    });
  }
  function bindChangePlant(element) {
    element?.querySelector('[data-claim-change-plant]')?.addEventListener('click',()=>go('home'));
  }

  function mount() {
    cleanup();
    const page = document.querySelector('.claim-flow');
    if (!page) return;
    document.body.style.backgroundColor=getComputedStyle(page).getPropertyValue('--claim-scene');
    const press=mountClaimPress(page,page.dataset.print),hotkey=new AbortController();activePress=press;dispose=()=>{hotkey.abort();press.dispose();};
    let submitting=false,changingStep=false,noteVersion=0;
    const plant = getPlant(page.dataset.claimPlant);
    const draft = draftFor(plant.id);
    window.addEventListener('keydown',event=>{
      if(event.key.toLowerCase()!=='f'||event.repeat||event.isComposing||event.altKey||event.ctrlKey||event.metaKey)return;
      if(event.target instanceof Element&&event.target.closest('input,textarea,select,[contenteditable]'))return;
      if(!page.isConnected||!page.classList.contains('claim-receipt')||currentClaim(plant.id)?.status!=='claimed')return;
      event.preventDefault();
      press.scan().catch(()=>{});
    },{signal:hotkey.signal});
    bindChangePlant(page);
    page.querySelector('#claim-nick')?.addEventListener('input',event=>{
      draft.nick = event.target.value;
      draft.agreed = false;
      event.target.removeAttribute('aria-invalid');
      saveDraft(plant.id);
    });
    page.querySelectorAll('[data-claim-field]').forEach(input=>input.addEventListener('change',async()=>{
      const field = input.dataset.claimField;
      if (input.disabled) return;
      draft[field] = input.value;
      draft.agreed = false;
      saveDraft(plant.id);
      page.querySelectorAll(`input[name="${input.name}"]`).forEach(radio=>{
        radio.closest('label').classList.toggle('selected',radio.checked);
        radio.closest('label').classList.remove('just-stamped');
      });
      input.closest('label').classList.add('just-stamped');
      const region = page.querySelector(draft.step===1?'#claim-advice':'#claim-method-note');
      if (region) {
        const version=++noteVersion;
        region.getAnimations().forEach(animation=>animation.cancel());
        const height=region.getBoundingClientRect().height;
        region.style.height=`${height}px`;
        region.style.overflow='hidden';
        region.dataset.noteSwitching='';
        if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
          const out=region.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-6px)'}],{duration:150,easing:'ease-in',fill:'both'});
          try{await out.finished;}catch{}out.cancel();
        }
        if(version!==noteVersion||!region.isConnected)return;
        region.innerHTML = draft.step===1?adviceMarkup(plant,draft):methodNote(plant,draft);
        bindChangePlant(region);press.refresh(region);
        region.style.height='auto';
        const targetHeight=region.getBoundingClientRect().height;
        region.style.height=`${height}px`;
        if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
          const incoming=region.animate([{opacity:0,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{duration:290,easing:'cubic-bezier(.2,.7,.2,1)',fill:'both'});
          const resize=region.animate([{height:`${height}px`},{height:`${targetHeight}px`}],{duration:380,easing:'cubic-bezier(.2,.7,.2,1)',fill:'both'});
          try{await Promise.all([incoming.finished,resize.finished]);}catch{}
          region.style.height=`${targetHeight}px`;incoming.cancel();resize.cancel();
        }
        if(version===noteVersion){region.style.height='';region.style.overflow='';delete region.dataset.noteSwitching;}
      }
      page.querySelector('#claim-error').hidden = true;
    }));
    page.querySelector('#claim-agreed')?.addEventListener('change',event=>{draft.agreed=event.target.checked;saveDraft(plant.id);page.querySelector('#claim-error').hidden=true;});
    const moveTo = async step => {
      if(changingStep)return;changingStep=true;
      await scrollPageUp(page);
      if(!page.isConnected)return;
      const outgoing=page.querySelector('.claim-step-content'),animateStep=!matchMedia('(prefers-reduced-motion: reduce)').matches;
      if(animateStep&&outgoing)try{
        await outgoing.animate([{clipPath:'inset(0 0 0 0)',translate:'0 0'},{clipPath:'inset(0 0 0 100%)',translate:'-8px 0'}],{duration:240,easing:'cubic-bezier(.48,.04,.7,.55)',fill:'both'}).finished;
      }catch{}
      if(!page.isConnected)return;
      draft.step=step;saveDraft(plant.id);refresh(plant,false);
      const incoming=document.querySelector('.claim-flow .claim-step-content');
      if(animateStep&&incoming)try{
        await incoming.animate([{clipPath:'inset(0 100% 0 0)',translate:'8px 0'},{clipPath:'inset(0 0 0 0)',translate:'0 0'}],{duration:370,easing:'cubic-bezier(.2,.72,.22,1)',fill:'both'}).finished;
      }catch{}
      document.querySelector('#claim-step-title')?.focus({preventScroll:true});
    };
    page.querySelector('[data-claim-prev]')?.addEventListener('click',()=>moveTo(Math.max(1,draft.step-1)));
    page.querySelectorAll('[data-claim-step]').forEach(button=>button.addEventListener('click',()=>moveTo(Number(button.dataset.claimStep))));
    page.querySelector('[data-claim-keep]')?.addEventListener('click',()=>{clearDraft(plant.id);refresh(plant,false);});
    page.querySelector('[data-claim-edit]')?.addEventListener('click',async()=>{
      const claim = currentClaim(plant.id);
      if (!claim || claim.status !== 'reserved') return;
      try{await press.redock();}catch{return;}if(!page.isConnected)return;
      drafts.set(plant.id,{step:1,nick:claim.nick,place:claim.place,light:claim.light,experience:claim.experience||'',form:claim.form,agreed:false,editingId:claim.id});
      saveDraft(plant.id);
      refresh(plant);
    });
    page.querySelector('#claim-step-form')?.addEventListener('submit',async event=>{
      event.preventDefault();
      if(submitting)return;
      if (draft.step === 1) {
        draft.nick = draft.nick.trim();
        if (!informationComplete(draft)) {
          showError('请填写昵称，并选择种植位置、光照条件和种植经验。');
          if (!draft.nick) {const input=page.querySelector('#claim-nick');input.setAttribute('aria-invalid','true');input.focus();}
          return;
        }
        moveTo(2);
        return;
      }
      if (draft.step === 2) {
        if (!available(plant.id,draft.form)) {showError('请选择一种本批可领取的方式。');return;}
        moveTo(3);
        return;
      }
      if (!informationComplete(draft)) {moveTo(1);return;}
      if (!available(plant.id,draft.form)) {moveTo(2);return;}
      if (!draft.agreed) {showError('请先读完并勾选领取前的小约定。');return;}
      const existing = currentClaim(plant.id);
      if (existing?.status === 'claimed') {clearDraft(plant.id);refresh(plant,false);return;}
      const claim = {
        id:existing?.id || `BRANCH-${Date.now().toString(36).toUpperCase()}`,
        plantId:plant.id,nick:draft.nick.trim(),place:draft.place,light:draft.light,experience:draft.experience,
        form:draft.form,agreed:true,status:'reserved',demo:true,
        date:existing?.date || new Date().toLocaleDateString('zh-CN',{timeZone:'Asia/Shanghai'}).replaceAll('/','.'),
        reservedAt:existing?.reservedAt || date(),updatedAt:date()
      };
      const previous = existing ? {...existing} : null;
      if (existing) Object.assign(existing,claim);
      else getClaims().push(claim);
      try {persist();} catch {
        if (existing) Object.assign(existing,previous);
        else getClaims().pop();
        showError('小票暂时没有保存成功，请稍后重试。');return;
      }
      submitting=true;page.querySelector('.dispatch-paper').inert=true;
      try{await press.sign();}catch{return;}
      if(!page.isConnected)return;
      clearDraft(plant.id);
      effect = {id:claim.id,kind:'reservation'};nextEntrance='receipt';
      render();
    });
    page.querySelector('[data-claim-pickup]')?.addEventListener('click',async()=>{
      if(submitting)return;
      const claim = currentClaim(plant.id);
      if (!claim || claim.status !== 'reserved') return;
      const previous = {...claim};
      claim.status='claimed';claim.pickedUpAt=date();
      try {persist();} catch {Object.assign(claim,previous);showError('领取状态暂时没有保存成功，请重试。');return;}
      submitting=true;page.querySelector('.dispatch-paper').inert=true;
      const title=page.querySelector('.ticket-title'),mark=page.querySelector('.claim-ticket-mark'),rows=page.querySelector('.ticket-dl'),note=page.querySelector('.claim-ticket .suitability'),actions=page.querySelector('.ticket-actions');
      const changes=[
        {element:title,apply:()=>{title.textContent='已领取';}},
        {element:mark,apply:()=>{mark.innerHTML='<div class="red-postmark">已领取</div>';}},
        {element:rows.lastElementChild,apply:()=>{
          const row=document.createElement('div');row.className='claim-scan-added-row';row.innerHTML=`<dt>领取时间</dt><dd>${escape(claim.pickedUpAt)}</dd>`;rows.append(row);
          if(!matchMedia('(prefers-reduced-motion: reduce)').matches){const height=row.getBoundingClientRect().height;row.animate([{height:'0px',opacity:0},{height:`${height}px`,opacity:1}],{duration:420,easing:'cubic-bezier(.2,.7,.2,1)'});}
        }},
        {element:note,apply:()=>{note.querySelector('.claim-note-label').textContent='后续记录';note.querySelector('p').textContent='已加入「枝条放映室」，可继续记录生长近况。';}},
        {element:actions,apply:()=>{
          actions.innerHTML=`<button class="solid-action" data-nav="album">打开枝条放映室 <span>↗</span></button><button class="line-action" data-care="${plant.id}">写一封养护来信 <span>↗</span></button>`;
          actions.querySelector('[data-nav]')?.addEventListener('click',()=>document.querySelector('.main-nav [data-nav="album"]')?.click());
          actions.querySelector('[data-care]')?.addEventListener('click',()=>go('letters',plant.id));
        }}
      ];
      try{await press.scan(changes);}catch{return;}
      if(!page.isConnected)return;
      clearDraft(plant.id);submitting=false;
    });
  }

  return {
    render(id) {
      const plant = getPlant(id);
      const draft = draftFor(plant.id);
      const claim = currentClaim(plant.id);
      if (claim && (claim.status==='claimed' || draft.editingId!==claim.id)) return renderTicket(claim,plant);
      if (!claim) delete draft.editingId;
      return renderForm(plant,draft);
    },
    mount,cleanup,scrollToTop(){const page=document.querySelector('.claim-flow');return page?scrollPageUp(page):Promise.resolve();},leave(){return activePress?.leave()||Promise.resolve();}
  };
}
