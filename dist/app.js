import {mountNavigation,selectNavigation} from './navigation.js';
import {plants} from './plants.js';
import {renderHome, mountHome, cleanupScene, letterMarkup, homeBackground,selectHomePlant} from './scenes.js?v=20261021-4';
import {mountStampEffects} from './stamp-motion.js?v=20261021-3';
import {renderArchive,mountArchive,cleanupArchive,enterArchive,cancelArchiveEntry,returnArchive} from './plant-archive.js?v=20261022-4';
import {createClaimFlow} from './claim-flow.js?v=20261021-7';
import {enterChapter,leaveChapter,stopChapterMotion,rememberArchivePosition,unfoldNewspaper,paintInitialInterface} from './chapter-motion.js?v=20261021-7';
import {renderAlbumDesk,mountAlbumDesk,cleanupAlbumDesk,albumBackground} from './album-desk.js?v=20261021-20';
import {saveRecordVideo,removeRecordVideo,releaseRecordVideos} from './record-media.js';
import {renderPostOffice,mountPostOffice,cleanupPostOffice,refreshPostOffice,showPostLetter,closePostLetter,renderPostCompose,mountPostCompose} from './post-office.js?v=20261021-1';

const P = Object.fromEntries(plants.map(x=>[x.id,x]));
const initial = {saved:['podocarpus','osmanthus'],claims:[{id:'DEMO-2026-01',plantId:'crape',nick:'演示访客',place:'阳台',light:'充足日照',form:'已生根幼苗',status:'claimed',date:'2026.08.18',demo:true}],postcards:[{id:'demo-post',plantId:'crape',date:'2026.09.03',status:'抽出新芽',text:'第十七天，枝条顶端有了小小的绿点。先继续耐心等根。',photo:'',demo:true}],letters:[],unread:true};
const DATA_KEY='next-branch-demo-v2';
const load=()=>{try{const x=JSON.parse(localStorage.getItem(DATA_KEY)||localStorage.getItem('next-branch-demo'));if(!x||!Array.isArray(x.claims))return structuredClone(initial);const known=id=>Boolean(P[id]);return {...structuredClone(initial),...x,saved:(x.saved||[]).filter(known),claims:x.claims.filter(c=>known(c.plantId)),postcards:(x.postcards||[]).filter(c=>known(c.plantId)),letters:(x.letters||[]).filter(c=>known(c.plantId))};}catch{return structuredClone(initial)}};
let data=load(),openLetterId=null,originView='home',letterForm={plantId:'podocarpus',category:'扦插',title:'',text:'',photo:''},mailboxComposeState=null;
const app=document.querySelector('#app');
const persist=()=>localStorage.setItem(DATA_KEY,JSON.stringify(data));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function stampEdge(){
  // Continuous rounded perforations; every wave has the same pitch and depth.
  const edges=[[8,4,1,0,0,1,204,20,'Q216 4 216 8'],[216,8,0,1,-1,0,284,28,'Q216 296 212 296'],[212,296,-1,0,0,-1,204,20,'Q4 296 4 292'],[4,292,0,-1,1,0,284,28,'Q4 4 8 4']];
  let d='M8 4';
  for(const [x,y,dx,dy,nx,ny,length,count,corner] of edges){
    const step=length/count;
    const point=(along,depth=0)=>`${(x+dx*along+nx*depth).toFixed(2)} ${(y+dy*along+ny*depth).toFixed(2)}`;
    for(let i=0;i<count;i++){
      const start=i*step,q=step/4,r=2.7,k=.55228475;
      // Four quarter ellipses make round crests and round valleys, without flats.
      d+=` C${point(start+q*k)} ${point(start+q,r*(1-k))} ${point(start+q,r)}`;
      d+=` C${point(start+q,r*(1+k))} ${point(start+q*(2-k),r*2)} ${point(start+q*2,r*2)}`;
      d+=` C${point(start+q*(2+k),r*2)} ${point(start+q*3,r*(1+k))} ${point(start+q*3,r)}`;
      d+=` C${point(start+q*3,r*(1-k))} ${point(start+q*(4-k))} ${point(start+step)}`;
    }
    d+=` ${corner}`;
  }
  return `<svg class="stamp-teeth" viewBox="0 0 220 300" preserveAspectRatio="none" aria-hidden="true"><path d="${d}Z"/></svg>`;
}
const stampTeeth=stampEdge();
function stamp(id,small=false,{preview=false,defer=false,priority=false}={}){
  const p=P[id],image=`./assets/${preview?p.art.replace(/\.webp$/,'-preview.webp'):p.art}`;
  const source=defer?`data-src="${image}"`:`src="${image}"`;
  return `<div class="stamp ${small?'small':''}" style="--stamp-bg:${p.bg};--stamp-ink:${p.ink}">${stampTeeth}<div class="stamp-inner"><div class="stamp-top"><span class="stamp-brand">下一枝<small>NEXT BRANCH</small></span><b class="stamp-emblem">枝</b></div><img class="stamp-art" ${source} ${priority?'fetchpriority="high"':''} decoding="async" alt="${p.name}植物插画" draggable="false"><div class="stamp-bottom"><span><span class="stamp-name">${p.name}</span><span class="stamp-latin">${p.english}</span></span><span class="stamp-index">${p.value}<small>${p.no}</small></span></div></div></div>`;
}
const claimFlow=createClaimFlow({getPlant:id=>P[id]||plants[0],stamp,getClaims:()=>data.claims,persist,render,go});
const navLabels=[['home','邮票馆','INDEX'],['album','枝条放映室','ALBUM'],['letters','枝友来信','LETTERS']];
const navigationSection=current=>current==='detail'||current==='story'?originView:current==='claim'?'home':current==='growth'?'album':current==='write-letter'?'letters':current;
function nav(current){const section=navigationSection(current);return `<nav class="main-nav" aria-label="主要导航"><button class="nav-brand" data-nav="home" aria-label="下一枝 · 返回邮票馆">下一枝<span>NEXT BRANCH</span></button>${navLabels.map(([id,cn])=>`<button data-nav="${id}" aria-label="${cn}" ${section===id?'aria-current="page"':''} class="${section===id?'active':''}"><span class="nav-label char-shift" aria-label="${cn}">${letterMarkup(cn)}</span></button>`).join('')}</nav>`}
function header(){return ''}
const hashParts=()=>{let [view,id]=location.hash.replace(/^#/,'').split('/');if(view==='story'){history.replaceState(null,'',`#detail/${P[id]?id:plants[0].id}`);return ['detail',P[id]?id:plants[0].id];}if(view==='claim-list'){history.replaceState(null,'','#home');return ['home'];}if(view==='growth'){history.replaceState(null,'','#album');return ['album'];}if(id&&!P[id]){const next=view==='letters'?'#letters':'#home';history.replaceState(null,'',next);return [view==='letters'?'letters':'home'];}return [view||'home',id]};
function go(view,id){selectNavigation(navigationSection(view));cancelArchiveEntry(view==='detail'?id:null);openLetterId=null;const next=`#${view}${id?'/'+id:''}`;if(location.hash===next){render();window.scrollTo(0,0)}else location.hash=next}
function render(){releaseRecordVideos();const [view,id]=hashParts();let body=view==='home'?home():view==='detail'?detail(id):view==='claim'?claim(id):view==='album'?album():view==='letters'?letters(id):view==='write-letter'?writeLetter():home();stopChapterMotion();cleanupScene();cleanupAlbumDesk();cleanupPostOffice();cleanupArchive();claimFlow.cleanup();app.innerHTML=header()+body;document.body.dataset.view=view;mountNavigation(nav(view),navigationSection(view));bind();if(view==='home')mountHome(plants,(id,el)=>openArchive(id,el));if(view==='album')mountAlbumDesk({plants,getData:()=>data,onClaim:id=>go('claim',id),onSaveGrowth:saveAlbumGrowth,onDeleteGrowth:deleteAlbumGrowth,onArchive:id=>openArchive(id,null)});if(view==='letters')mountPostOffice({plants,stamp,getLetters:allLetters,onOpen:openLetter,onWrite:plantId=>{if(plantId)letterForm.plantId=plantId;go('write-letter');},filter:id});if(view==='write-letter')mountPostCompose({plants,stamp,draft:letterForm,readPhoto:readFile,onSend:draft=>{const letter={id:`L-${Date.now()}`,date:new Date().toLocaleDateString('zh-CN').replaceAll('/','.'),...draft,mine:true,replies:[]};data.letters.unshift(letter);try{persist();}catch(error){data.letters.shift();throw error;}letterForm={plantId:draft.plantId,category:'扦插',title:'',text:'',photo:''};return letter;},onComplete:letter=>go('letters',letter.plantId)});mountStampEffects(app);mountArchive();}
function home(){return renderHome(plants,stamp)}
function detail(id){const p=P[id]||plants[0],records=[...(publicStories[p.id]||[]).map(r=>({date:r[0],title:r[1],text:r[2],demo:true})),...data.postcards.filter(r=>r.plantId===p.id).map(r=>({date:r.date,title:r.status,text:r.text,photo:r.photo,demo:Boolean(r.demo)}))],stories=[...new Map(records.map(r=>[`${r.date}-${r.title}`,r])).values()].sort((a,b)=>a.date.localeCompare(b.date)).slice(-3);return renderArchive(p,originView,stories)}
function claim(id){return claimFlow.render(id)}
function album(){return renderAlbumDesk(plants,stamp,data)}
const publicStories={
 podocarpus:[['2026.09.02','刚刚安家','把罗汉松小苗安放在明亮通风处，先让根系适应新的介质。'],['2026.09.24','细叶舒展','新梢逐渐舒展，暂时不急着造型。']],
 crape:[['2026.08.18','开始扦插','把紫薇放进疏松的介质，给它留一个温暖的新位置。'],['2026.09.03','抽出新芽','叶芽长大了一点，但还不能太早判断已经生根。']],
 serissa:[['2026.08.20','刚刚安家','六月雪安放在柔和的光里，留意介质湿度。']]
};

const sampleLetters=[
 {id:'n1',plantId:'podocarpus',category:'叶片',title:'罗汉松的新梢变浅绿，是正常的吗？',date:'2026.09.12',text:'小苗到家后一直放在通风的东窗边，枝头慢慢长出浅绿色的新叶。现在要开始修剪造型吗？',replies:[{by:'枝友分享',text:'先让小苗安稳长一阵子吧，细叶舒展开来就很好看。',kind:'friend'},{by:'园艺建议',text:'新梢颜色较浅可以继续观察。先检查根系和介质的适应情况，等植株长稳后再考虑造型。',kind:'gardener'}]},
 {id:'n2',plantId:'crape',category:'扦插',title:'紫薇长了芽，是不是已经生根？',date:'2026.09.05',text:'扦插十多天后顶端长出新芽。很想知道现在可不可以换盆，担心碰坏它。',replies:[{by:'园艺建议',text:'新芽可能消耗的是枝条原有养分，暂时不能据此判断生根。保持原状，观察后续稳定生长，再考虑换盆。',kind:'gardener'}]},
 {id:'n3',plantId:'serissa',category:'光照',title:'六月雪午后有点耷拉，怎么办？',date:'2026.08.27',text:'窗边下午会被太阳晒到，叶片看起来没有精神。该先检查日照还是盆土？',replies:[]},
 {id:'n4',plantId:'citron',category:'浇水',title:'香泡小苗的盆土多久检查一次？',date:'2026.08.23',text:'带回香泡小苗后，最想闻的是叶片的清香。它住在明亮窗边，我准备先摸一摸表土，再决定什么时候补水。',replies:[]},
 {id:'n5',plantId:'five-lobed-maple',category:'叶片',title:'五角枫开始转色了',date:'2026.08.19',text:'原本翠绿的叶缘有了暖色。想把每一周的变化拍下来，也想知道小苗换位置时要注意什么。',replies:[]},
 {id:'n6',plantId:'camellia',category:'光照',title:'茶花的花苞，适合住在东窗吗？',date:'2026.08.16',text:'茶花叶片很有光泽，枝头也有小花苞。东窗早上有柔和的光，午后不晒，想先让它安稳地待在这里。',replies:[]},
 {id:'n7',plantId:'osmanthus',category:'扦插',title:'桂花迟迟没动静，我还在等',date:'2026.08.12',text:'我的桂花枝条插下快一个月了，叶片看起来和最初差不多，没有新的变化。每天看一眼，又忍住不去碰它。',replies:[]},
 {id:'n8',plantId:'ginkgo',category:'其他',title:'给银杏留一个长大的位置',date:'2026.08.08',text:'小小的扇形叶现在可以放在窗边，将来却会成为大树。我想先替它找一个排水好的位置，也给根系留足空间。',replies:[]},
 {id:'n9',plantId:'bougainvillea',category:'光照',title:'三角梅的苞片颜色亮起来了',date:'2026.08.03',text:'新枝稳定后，我慢慢增加了见光时间。最近纸质的苞片更鲜亮了，想把这个早晨寄给大家。',replies:[{by:'枝友分享',text:'收到这份好消息了！我也在记录窗边的光线和叶色。',kind:'friend'}]},
 {id:'n10',plantId:'pomegranate',category:'其他',title:'石榴开了一朵红花',date:'2026.07.29',text:'枝头刚出现一朵朱红的小花，花萼像一顶小冠冕。今天先拍照存档，继续照顾好阳光和排水。',replies:[]}
];
const allLetters=()=>[...data.letters,...sampleLetters.map(l=>({...l,replies:[...l.replies,...(data.sampleReplies?.[l.id]||[])]}))];
function letters(filter){return renderPostOffice(plants,filter)}
function writeLetter(){return renderPostCompose(plants,stamp,letterForm)}
function openArchive(id,source){const p=P[id];if(!p)return;const from=hashParts()[0];if(['home','album','growth'].includes(from))originView=from==='growth'?'album':from;enterArchive(p,source,()=>go('detail',id));}

async function readFile(input){const file=input.files?.[0];if(!file)return '';const blobUrl=URL.createObjectURL(file);try{const img=new Image();img.src=blobUrl;await img.decode();const ratio=Math.min(1,1000/Math.max(img.width,img.height));const canvas=document.createElement('canvas');canvas.width=Math.round(img.width*ratio);canvas.height=Math.round(img.height*ratio);const ctx=canvas.getContext('2d');ctx.fillStyle='#f8f5ea';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);return canvas.toDataURL('image/jpeg',.8)}catch{return new Promise((resolve,reject)=>{const fr=new FileReader();fr.onload=()=>resolve(fr.result);fr.onerror=reject;fr.readAsDataURL(file)})}finally{URL.revokeObjectURL(blobUrl)}}
async function saveAlbumGrowth({plantId,recordId,status,text,input,removeMedia=false}){
 const previous=recordId?data.postcards.find(item=>item.id===recordId&&item.plantId===plantId&&!item.demo):null;
 if(recordId&&!previous)throw new Error('这段近况已不存在，请重新打开。');
 const file=input.files?.[0],nextVideo=file?.type.startsWith('video/')?await saveRecordVideo(file):'',nextPhoto=file?.type.startsWith('image/')?await readFile(input):'';
 const record=previous?{...previous,status,text,photo:file?nextPhoto:removeMedia?'':previous.photo,videoId:file?nextVideo:removeMedia?'':previous.videoId}:{id:`PC-${Date.now()}`,plantId,date:new Date().toLocaleDateString('zh-CN').replaceAll('/','.'),status,text,photo:nextPhoto,videoId:nextVideo,demo:false};
 const index=previous?data.postcards.indexOf(previous):-1;if(index>=0)data.postcards[index]=record;else data.postcards.push(record);
 try{persist();if(previous?.videoId&&previous.videoId!==record.videoId)await removeRecordVideo(previous.videoId).catch(()=>{});return record}
 catch(error){if(index>=0)data.postcards[index]=previous;else data.postcards.pop();if(nextVideo)removeRecordVideo(nextVideo).catch(()=>{});throw new Error('保存失败，请检查浏览器存储空间后重试。')}
}
async function deleteAlbumGrowth({plantId,recordId}){
 const index=data.postcards.findIndex(item=>item.id===recordId&&item.plantId===plantId&&!item.demo);
 if(index<0)throw new Error('这段近况已不存在，请重新打开。');
 const [record]=data.postcards.splice(index,1);
 try{persist();if(record.videoId)await removeRecordVideo(record.videoId).catch(()=>{});return record}
 catch(error){data.postcards.splice(index,0,record);throw new Error('删除失败，请稍后再试。')}
}
let chapterNavIntent=0;
function bind(){document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=async()=>{const target=b.dataset.nav,intent=++chapterNavIntent;if(document.body.dataset.view==='letters'&&target!=='letters'&&target!=='album'&&document.querySelector('#letter-overlay')){await closePostLetter();if(intent!==chapterNavIntent)return;}if(document.body.dataset.view==='claim'){
  // Finish the current feed in place before changing the scene or nav colour.
  claimChapterExitPromise??=(async()=>{await claimFlow.scrollToTop();const mode=await claimFlow.leave();await animateClaimExit(app,mode);})();
  try{await claimChapterExitPromise;}catch{}if(intent!==chapterNavIntent||document.body.dataset.view!=='claim')return;
  claimChapterExitDone=true;
}go(target);});document.querySelectorAll('[data-detail]').forEach(b=>b.onclick=()=>openArchive(b.dataset.detail,b));document.querySelectorAll('[data-claim]').forEach(b=>b.onclick=async()=>{if(b.classList.contains('archive-accept')){if(b.classList.contains('is-accepting'))return;b.classList.add('is-accepting');b.disabled=true;if(!matchMedia('(prefers-reduced-motion: reduce)').matches)await new Promise(resolve=>setTimeout(resolve,570));if(!b.isConnected||document.body.dataset.view!=='detail')return;}go('claim',b.dataset.claim);});document.querySelectorAll('[data-care]').forEach(b=>b.onclick=()=>go('letters',b.dataset.care));document.querySelectorAll('[data-growth]').forEach(b=>b.onclick=()=>go('growth',b.dataset.growth));claimFlow.mount();document.querySelectorAll('[data-letter]').forEach(b=>b.onclick=()=>{b.classList.add('open');setTimeout(()=>openLetter(b.dataset.letter),220)});document.querySelector('#unread-letter')?.addEventListener('click',()=>{data.unread=false;persist();go('letters','crape');setTimeout(()=>openLetter('n2'),120)});}
function openLetter(id){
  const letter=allLetters().find(item=>item.id===id);if(!letter)return;openLetterId=id;
  if(id==='n2'){data.unread=false;persist();}
  showPostLetter({getLatest:()=>allLetters().find(item=>item.id===id),plant:P[letter.plantId],stamp,onReply:text=>{
    const reply={by:'枝友分享 · 本地演示',text,kind:'friend'};
    let replies;
    if(sampleLetters.some(item=>item.id===id)){data.sampleReplies??={};replies=(data.sampleReplies[id]??=[]);}
    else replies=data.letters.find(item=>item.id===id)?.replies;
    if(!replies)return;replies.push(reply);
    try{persist();}catch(error){replies.pop();throw error;}
    refreshPostOffice();
  },onClose:()=>{openLetterId=null;}});
}
let scrollFrame=0;window.addEventListener('scroll',()=>{if(scrollFrame)return;scrollFrame=requestAnimationFrame(()=>{scrollFrame=0;if(hashParts()[0]!=='home')return;document.querySelectorAll('.field-stamp').forEach((el,i)=>{const amount=Math.min(24,window.scrollY*.035)*Math.sin(i*1.9+.6);el.style.setProperty('--drift',`${amount.toFixed(1)}px`)})})},{passive:true});
let routeVersion=0,claimChapterExitPromise=null,claimChapterExitDone=false,claimBackgroundBlend=null;
function stopClaimBackgroundBlend(){
  if(!claimBackgroundBlend)return;
  const current=getComputedStyle(document.body).backgroundColor;
  claimBackgroundBlend.cancel();claimBackgroundBlend=null;
  document.body.style.backgroundColor=current;
}
async function blendClaimBackground(color){
  if(!color)return;
  const from=getComputedStyle(document.body).backgroundColor;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches||from===color){document.body.style.backgroundColor=color;return;}
  const animation=document.body.animate([{backgroundColor:from},{backgroundColor:color}],{duration:720,easing:'cubic-bezier(.42,0,.58,1)',fill:'both'});
  claimBackgroundBlend=animation;
  try{await animation.finished;}catch{}
  if(claimBackgroundBlend===animation){document.body.style.backgroundColor=color;animation.cancel();claimBackgroundBlend=null;}
}
async function animateClaimExit(frame,mode){
  const snapshot=frame.querySelector('.claim-page'),sheet=snapshot?.querySelector('.dispatch-paper'),machine=snapshot?.querySelector('.claim-machine'),lip=snapshot?.querySelector('.claim-output-lip'),feed=snapshot?.querySelector('.claim-paper-feed');
  if(!sheet)return;
  snapshot.style.background='transparent';
  if(feed&&mode==='ticket')feed.style.overflow='visible';
  const shift=(element,distance,duration,{clipPath,delay=0}={})=>{
    if(!element||getComputedStyle(element).visibility==='hidden')return Promise.resolve();
    const current=getComputedStyle(element),parts=current.translate==='none'?['0px','0px']:current.translate.split(' '),x=parts[0]||'0px',y=parseFloat(parts[1]||'0')||0;
    const from={translate:`${x} ${y}px`},to={translate:`${x} ${y+distance}px`};
    if(clipPath){from.clipPath=current.clipPath==='none'?'inset(0 0 0% 0)':current.clipPath;to.clipPath=clipPath;}
    return element.animate([from,to],{duration,delay,easing:'cubic-bezier(.35,.05,.25,1)',fill:'forwards'}).finished.catch(()=>{});
  };
  const machineUp=()=>{const distance=-(machine.getBoundingClientRect().bottom+55);return Promise.all([shift(machine,distance,700),shift(lip,distance,700)]);};
  if(mode==='retract'){
    // Pull the visible stock back through the slot before the press leaves.
    const visible=Math.max(0,sheet.getBoundingClientRect().bottom-machine.getBoundingClientRect().bottom);
    await shift(sheet,-Math.min(visible+18,innerHeight*.82),760,{clipPath:'inset(0 0 100% 0)'});
    await machineUp();
  }else{
    const down=innerHeight-sheet.getBoundingClientRect().top+100;
    await shift(sheet,down,840);
  }
}
async function scrollArchiveToTop(isStale){
  const start=window.scrollY;
  if(start<=2)return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){window.scrollTo({top:0,behavior:'instant'});return;}
  const duration=Math.min(1200,Math.max(650,start*.45));
  await new Promise(resolve=>{
    let began;
    const step=now=>{
      if(isStale()){resolve();return;}
      began??=now;
      const progress=Math.min(1,(now-began)/duration);
      const eased=progress<.5?4*progress**3:1-(-2*progress+2)**3/2;
      window.scrollTo({top:start*(1-eased),behavior:'instant'});
      if(progress<1)requestAnimationFrame(step);
      else{window.scrollTo({top:0,behavior:'instant'});resolve();}
    };
    requestAnimationFrame(step);
  });
}
window.addEventListener('hashchange',async()=>{
  stopClaimBackgroundBlend();
  const version=++routeVersion,previous=document.body.dataset.view,next=hashParts()[0],finishedClaimChapterExit=previous==='claim'&&claimChapterExitDone;claimChapterExitDone=false;claimChapterExitPromise=null;stopChapterMotion();selectNavigation(navigationSection(next));cancelArchiveEntry(next==='detail'?hashParts()[1]:null);const viaStamp=Boolean(document.querySelector('.branch-flight'));
  const currentPage=app.querySelector('main');
  if(previous==='claim'&&next==='home'&&currentPage?.dataset.claimPlant)selectHomePlant(plants,currentPage.dataset.claimPlant);
  if(previous==='detail'&&next==='claim'&&currentPage?.classList.contains('archive-page'))rememberArchivePosition(currentPage);
  if(previous==='claim'&&next==='detail'){
    const exitSelectors=['.dispatch-paper','.claim-machine','.claim-output-lip','.claim-paper-feed'];
    const exitPoses=new Map(exitSelectors.map(selector=>{const source=currentPage?.querySelector(selector),pose=source&&getComputedStyle(source);return [selector,pose&&{translate:pose.translate,clipPath:pose.clipPath,visibility:pose.visibility}]}));
    let exitMode='split';try{exitMode=await claimFlow.leave()||'split';}catch{}if(version!==routeVersion)return;
    // Freeze the live feed pose before switching pages so the exit can continue
    // from the same sheet position, including a close during printing.
    const outgoing=document.createElement('div'),snapshot=currentPage.cloneNode(true);
    outgoing.className='claim-return-frame';
    Object.assign(outgoing.style,{position:'fixed',inset:'0',zIndex:'90',overflow:'hidden',pointerEvents:'none',background:'transparent'});
    Object.assign(snapshot.style,{position:'absolute',top:`${-window.scrollY}px`,left:'0',width:'100%',margin:'0'});
    for(const selector of exitSelectors){
      const copy=snapshot.querySelector(selector),pose=exitPoses.get(selector);if(!copy||!pose)continue;
      Object.assign(copy.style,pose);
    }
    outgoing.append(snapshot);
    currentPage.style.visibility='hidden';
    cleanupScene();cleanupAlbumDesk();cleanupPostOffice();cleanupArchive();claimFlow.cleanup();
    // Keep the current claim canvas underneath the frozen printer until its
    // last frame. Rendering the article early exposed its picture at the foot.
    document.body.append(outgoing);
    try{
      await animateClaimExit(outgoing,exitMode);
      if(version!==routeVersion)return;
      render();document.body.style.backgroundColor=P[hashParts()[1]]?.bg||'#b9d4bf';
      await unfoldNewspaper(app.querySelector('.archive-page'),outgoing);
    }finally{outgoing.remove();}
    return;
  }
  if(previous==='letters'&&next==='write-letter'&&currentPage?.classList.contains('letter-mailbox')){
    // Keep the exact mailbox pose behind the sheet. Writing is a paper slide,
    // not a chapter exit followed by a second mailbox entrance.
    const mailboxScroll=currentPage.querySelector('.mailbox-well')?.scrollTop||0;
    const mailboxQuery=currentPage.querySelector('.mailbox-query input')?.value||'';
    mailboxComposeState={scroll:mailboxScroll,query:mailboxQuery,plant:currentPage.querySelector('[data-mail-plant][aria-pressed="true"]')?.dataset.mailPlant||'',status:currentPage.querySelector('[data-mail-filter][aria-pressed="true"]')?.dataset.mailFilter||'',origin:currentPage.querySelector('[data-mail-origin][aria-pressed="true"]')?.dataset.mailOrigin||'',searchOpen:currentPage.querySelector('.mailbox-find')?.getAttribute('aria-expanded')==='true'};
    const underlay=currentPage.cloneNode(true);
    underlay.classList.add('is-compose-underlay');
    underlay.setAttribute('aria-hidden','true');
    underlay.inert=true;
    document.querySelector('#letter-overlay')?.remove();
    render();
    const compose=app.querySelector('.office-compose');
    compose.classList.add('is-over-mailbox');
    app.append(underlay);
    underlay.querySelector('.mailbox-well').scrollTop=mailboxScroll;
    underlay.querySelector('.mailbox-query input').value=mailboxQuery;
    document.body.style.backgroundColor='#f1f3eb';
    window.scrollTo({top:0,behavior:'instant'});
    enterChapter(compose,'write-letter',{fromView:'letters'});
    return;
  }
  const closingReader=previous==='letters'&&next==='album'?document.querySelector('#letter-overlay'):null;
  if(closingReader)closingReader.inert=true;else document.querySelector('#letter-overlay')?.remove();
  if(!(previous==='home'&&next==='letters'))cleanupScene();cleanupAlbumDesk();cleanupPostOffice();cleanupArchive();claimFlow.cleanup();
  if(previous==='detail'&&next==='home'&&!viaStamp){
    const paper=app.querySelector('.archive-page'),plant=P[paper?.dataset.plant];
    if(plant){
      paper.inert=true;
      await scrollArchiveToTop(()=>version!==routeVersion);
      if(version!==routeVersion)return;
      selectHomePlant(plants,plant.id);
      const revealHome=()=>{if(version!==routeVersion)return;render();window.scrollTo({top:0,behavior:'instant'});};
      await returnArchive(plant,revealHome);
      if(version===routeVersion&&document.body.dataset.view!=='home')revealHome();
      return;
    }
  }
  // Blend the outgoing paper into the destination before replacing its DOM.
  const nextBackground=next==='home'?homeBackground(plants):next==='album'?albumBackground():next==='letters'||next==='write-letter'?'#f1f3eb':next==='claim'?P[hashParts()[1]]?.bg:next==='detail'?P[hashParts()[1]]?.bg:next==='growth'?'#e5b8be':null;
  const page=app.querySelector('main');if(page)page.inert=true;
  if(finishedClaimChapterExit&&(next==='home'||next==='letters')){
    await blendClaimBackground(nextBackground);
    if(version!==routeVersion)return;
  }else if(nextBackground)document.body.style.backgroundColor=nextBackground;
  if(previous!==next&&!viaStamp&&!finishedClaimChapterExit)await leaveChapter(page,previous,{nextBackground,nextView:next,cover:closingReader});
  closingReader?.remove();
  if(version!==routeVersion)return;
  if(next==='claim')window.scrollTo({top:0,behavior:'instant'});
  render();window.scrollTo({top:0,behavior:'instant'});
  const closingCompose=previous==='write-letter'&&next==='letters'&&!hashParts()[1];
  if(closingCompose&&mailboxComposeState){
    const state=mailboxComposeState,mailbox=app.querySelector('.letter-mailbox');
    const query=mailbox.querySelector('.mailbox-query input');
    if(state.query){query.value=state.query;query.dispatchEvent(new Event('input',{bubbles:true}));}
    if(state.plant)mailbox.querySelector(`[data-mail-plant="${state.plant}"]`)?.click();
    if(state.status)mailbox.querySelector(`[data-mail-filter="${state.status}"]`)?.click();
    if(state.origin)mailbox.querySelector(`[data-mail-origin="${state.origin}"]`)?.click();
    mailbox.querySelector('.mailbox-well').scrollTop=state.scroll;
    if(state.searchOpen){mailbox.querySelector('.mailbox-find').click();mailbox.querySelector('.mailbox-search').getAnimations().forEach(animation=>animation.finish());}
    mailboxComposeState=null;
  }else if(previous==='write-letter')mailboxComposeState=null;
  if(previous!==next&&!viaStamp)enterChapter(app.querySelector('main'),next,{fromView:previous==='write-letter'&&!closingCompose?null:previous});
});
window.addEventListener('keydown',e=>{if(e.key==='Escape'){cancelArchiveEntry();document.querySelector('#letter-overlay')?.remove()}});
render();enterChapter(app.querySelector('main'),hashParts()[0],{initial:true});
paintInitialInterface();
document.body.classList.remove('is-initial-entrance');
