// Short prototype lessons: distinguish unrooted cuttings from established plants.
// General cutting method: https://www.rhs.org.uk/propagation/softwood-cuttings
// Species references are listed in README.md; local station guidance takes priority.
export const careLessons={
 podocarpus:[
  ['先把小苗安放好','罗汉松小苗先住在明亮通风处，适应后再考虑修剪造型。','先安家，再造型'],
  ['表土稍干再补水','检查表土湿度，浇后让多余的水排出，避免长期积水。','先看土，再浇水'],
  ['让根系站稳','领取根系完整的小苗，用透气介质安放，长稳后再学习造型。','小苗安根，耐心等长稳']
 ],
 osmanthus:[
  ['桂花新枝先住在柔光里','扦插早期使用明亮散射光，避免直晒使叶片失水；稳定生长后再逐渐适应日照。','散射光里，慢慢等根'],
  ['稳定湿度，比多浇更好','介质保持湿润而有空气，不因等待时间较长就不断加水。','湿度稳定，根才安心'],
  ['给桂花多一点时间','选择健康的半木质化枝段，保留少量叶片；别反复拔出查看。','半木质化枝，不反复拔']
 ],
 citron:[
  ['给香泡温暖的光','小苗先适应明亮位置，再逐渐增加日照；冷凉时留意温度。','暖而明亮，循序见光'],
  ['让水经过根旁','检查介质湿度，浇后让余水排走，避免盆中长期积水。','先检查，再补水'],
  ['从完整小苗开始','优先选择根系完整的小苗，安放时留意枝上的刺。','留意枝刺，稳稳安苗']
 ],
 'five-lobed-maple':[
  ['五角叶慢慢见光','小苗先在明亮处安稳生长，叶色会随季节自然变化。','顺着季节见光'],
  ['给根留透气空间','保持介质适度湿润，花盆或种植位要有良好排水。','湿润，也要透气'],
  ['留出长大的位置','五角枫会长成乔木，优先照顾已生根的小苗，预留根系空间。','先养根，再看秋色']
 ],
 crape:[
  ['把夏日的光留给紫薇','生根稳定后适合充足日照；扦插初期先避开强烈直晒。','先缓苗，后见充足光'],
  ['浇进去，也要排出来','使用透气、排水好的介质，维持微湿。浇后不留积水。','介质微湿，底部排水'],
  ['新芽之后，还要等根','用健康的半木质化枝段扦插，保留少量上叶。抽芽后继续稳定养护。','不拔动，不急着换盆']
 ],
 camellia:[
  ['茶花喜欢柔和的光','明亮散射光或柔和晨光适合茶花，夏季避免强烈午后直晒。','柔光安放，少搬动'],
  ['微酸介质，水能排出','选微酸、透气的介质；花芽生长时留意水分，避免长期干透。','留意酸度与排水'],
  ['先把枝段固定好','可在合适季节选健康半木质化枝段，在驿站指导下处理和固定。','健康枝段，稳稳安放']
 ],
 ginkgo:[
  ['让银杏小苗逐渐见光','先给幼苗明亮的位置，适应后再逐渐增加日照。','循序见光'],
  ['排水好，根才舒展','保持适度湿润，也要让余水从底部排出。','留出空间，避免积水'],
  ['从一株小苗开始','优先领取已生根小苗；不要把剪下的枝条当作即插即活。','小苗安根，等待生长']
 ],
 bougainvillea:[
  ['三角梅长稳后多见阳光','温暖季节逐渐增加日照；新枝初期先避开强晒。','先缓苗，再向光'],
  ['先看介质再补水','土壤排水要好，冷凉时减少浇水，避免湿冷积水。','不积水，保持通风'],
  ['留意枝上的小刺','在指导下选健康半木质化枝段，处理时避开小刺。','小心枝刺，固定枝段']
 ],
 serissa:[
  ['六月雪更喜欢柔光','放在明亮散射光中，柔和晨光也适合；初期少搬动。','柔光里，安稳生长'],
  ['别干透，也别泡着','介质将干时及时检查补水，容器保持排水，避免长期水湿。','稳定湿度，避免积水'],
  ['细枝，也要留好叶节','挑选健康细枝，减少下部叶片，在疏松介质中固定。','细枝轻插，保湿通风']
 ],
 pomegranate:[
  ['石榴长稳后向阳','新枝先缓苗，稳定生长后逐步增加日照。','向阳，保持通风'],
  ['浇水后及时排出余水','使用透气介质，浇后让盆底水排走。','先看表土，再补水'],
  ['稳稳固定成熟枝段','在指导下选健康成熟枝段，去掉入土处叶片，耐心等根。','健康枝段，等待新根']
 ]
};
// Plant joints and motion pivots share local coordinates.
// Two short, equally sized callouts identify the objects and their action.
const path=(d,cls='',attrs='')=>`<path class="${cls}" d="${d}" ${attrs}/>`;
const circle=(x,y,r,cls='',attrs='')=>`<circle class="${cls}" cx="${x}" cy="${y}" r="${r}" ${attrs}/>`;
const group=(body,x=0,y=0,cls='',attrs='')=>`<g transform="translate(${x} ${y})" class="${cls}" ${attrs}>${body}</g>`;
const leaves={
 podocarpus:'M0 0Q-4-17-8-36Q0-25 0 0Z',
 citron:'M0 0C-10-23-27-30-33-26C-31-9-13 0 0 0Z',
 'five-lobed-maple':'M0 0L-13-8L-22-17L-15-18L-16-30L-5-23L0-36L5-23L16-30L15-18L22-17L13-8Z',
 crape:'M0 0C-6-18-27-27-30-19C-32-6-13 2 0 0Z',
 serissa:'M0 0Q-14-22-23-21Q-24-6 0 0Z',
 camellia:'M0 0C-8-23-27-31-34-28C-32-11-13 0 0 0Z',
 osmanthus:'M0 0C-8-20-28-33-36-31C-35-11-15 1 0 0Z',
 ginkgo:'M0 0Q-14-9-29-28Q-21-39-10-31Q0-41 9-30Q18-37 27-26Q11-11 0 0Z',
 bougainvillea:'M0 0Q-9-23-28-20Q-25-5 0 0Z',
 pomegranate:'M0 0Q-10-23-25-18Q-24-5 0 0Z'
};
const paired=new Set(['citron','crape','serissa','osmanthus','camellia','pomegranate']);
const veins={
 podocarpus:'M0 0L-7-31',citron:'M0 0Q-13-15-27-24',
 'five-lobed-maple':'M0 0L0-30M-5-15L-16-24M5-15L16-24',crape:'M0 0Q-12-13-25-17',serissa:'M0 0Q-10-9-19-17',
 camellia:'M0 0Q-14-17-28-27',osmanthus:'M0 0Q-15-16-30-26',ginkgo:'M0 0L0-30M0-15L-19-27M0-15L19-27',
 bougainvillea:'M0 0Q-10-10-22-17',pomegranate:'M0 0Q-8-10-20-16'
};
// [left label, target, right label, target, optional outside routes]. Targets
// share the scene's coordinates; the separate annotation lane is laid out later.
const sceneGuides={
 'podocarpus':[
  ['先挡强光',[164,93],'再慢慢见光',[350,114]],
  ['先摸表土',[126,116],'少量补水',[320,126]],
  ['先让小苗安根',[225,225],'长稳后再造型',[365,167]]
 ],
 citron:[
  ['先用柔和晨光',[99,147],'新枝慢慢适应',[340,105]],
  ['补水保持微湿',[110,127],'介质留出空气',[331,215]],
  ['留意枝上的刺',[260,162],'完整小苗先安根',[222,232]]
 ],
 'five-lobed-maple':[
  ['放在明亮窗边',[62,85],'保持空气流动',[185,204],null,[[215,70],[215,177]]],
  ['先检查湿度',[137,126],'表土干再补水',[321,142]],
  ['小苗先安稳生长',[198,130],'留出根系空间',[198,235]]
 ],
 crape:[
  ['新枝先遮光',[79,125],'长稳再见日照',[249,85]],
  ['介质保持微湿',[111,117],'让余水排出去',[366,283]],
  ['浅插后固定',[186,224],'耐心等待生根',[365,135],[[64,224]]]
 ],
 serissa:[
  ['用窗帘柔化光线',[65,85],'安放后少搬动',[340,110]],
  ['别让介质干透',[103,124],'湿润也要透气',[346,219]],
  ['让叶节进入介质',[216,226],'同时保持通风',[394,160],[[54,226]],[[435,110],[435,160]]]
 ],
 'camellia':[
  ['新枝先挡强晒',[264,104],'长稳再增加日照',[365,83]],
  ['先看日晒环境',[79,102],'再检查介质湿度',[354,199]],
  ['适当减少下叶',[102,173],'浅插后轻轻固定',[376,223],[[58,173]],[[435,100],[435,223]]]
 ],
 osmanthus:[
  ['遮去强烈直晒',[185,66],'明亮散射光',[354,111]],
  ['湿度保持稳定',[108,132],'介质留出空气',[342,204]],
  ['枝段安放稳固',[174,211],'给根系更多时间',[365,133],[[56,211]]]
 ],
 'ginkgo':[
  ['新枝先用柔光',[128,120],'长稳再见日照',[389,51]],
  ['使用透气介质',[63,183],'检查底部排水',[337,283]],
  ['优先选择小苗',[187,160],'给根留足空间',[187,235]]
 ],
 bougainvillea:[
  ['新枝先避强晒',[88,109],'长稳再多见光',[335,145]],
  ['先检查介质',[110,148],'多余的水排出',[320,260]],
  ['留意枝上小刺',[165,183],'稳稳固定枝段',[340,220]]
 ],
 pomegranate:[
  ['长稳后向阳',[86,112],'让叶片迎光',[333,147]],
  ['检查表土湿度',[110,148],'底部及时排水',[320,260]],
  ['健康枝段入土',[165,183],'慢慢等待新根',[340,220]]
 ]
};
function createScene(plant,topic){
 const prefix=`care-${plant.id}-${topic}`;
 // The action drawing remains separate from explanatory leaders.
 const flow=(d,kind='light')=>path(d,'care-flow-guide')+path(d,`care-flow care-flow-${kind}`,'marker-end="url(#'+prefix+'-arrow)"');
 const soil=(y=207,x=63,width=354)=>path(`M${x} ${y}H${x+width}V269H${x}Z`,'care-soil')+path(`M${x} ${y}H${x+width}`,'care-soil-top');
 const horizon=(y=246)=>path(`M57 ${y}H423`,'care-baseline');
 const drop=(x,y,scale=1,cls='')=>group(`<g transform="scale(${scale})">${path('M0-16C-3-9-12 0-12 7A12 12 0 0 0 12 7C12 0 3-9 0-16Z','care-drop')}</g>`,x,y,cls);
 const sun=(x,y,r=18,cls='')=>group(circle(0,0,r)+`<g class="care-sun-rays">${Array.from({length:8},(_,i)=>path(`M0 ${-r-6}V${-r-13}`,'',`transform="rotate(${i*45})"`)).join('')}</g>`,x,y,cls);
 function branch(x,y,{scale=1,length=132,bare=42,bud=false,thin=false}={}){
  const nodeYs=[-length+18,-length+48,-length+78].filter(n=>n<=-bare),nodes=[];
  let body=path(`M0 0V${-length}`,'care-stem'+(thin?' is-fine':''));
  nodeYs.forEach((ny,i)=>{
   const signs=paired.has(plant.id)?[-1,1]:[i%2===0?-1:1];
   signs.forEach(sign=>{
    const leafScale=plant.id==='camellia'?.8:plant.id==='five-lobed-maple'?.8:plant.id==='serissa'?.8:1;
    body+=group(`<g transform="scale(${sign<0?leafScale:-leafScale} ${leafScale})">${path(leaves[plant.id],'care-leaf')}${path(veins[plant.id],'care-vein')}</g>`,0,ny);
   });nodes.push([x,y+ny*scale]);
   body+=circle(0,ny,2.2,'care-node');
  });
  if(['citron','bougainvillea'].includes(plant.id))body+=path(`M0 -54L13 -65M0 -94L-11 -104`,'care-thorn');
  if(bud)body+=path(`M0 ${-length}Q-14 ${-length-11} 0 ${-length-20}Q14 ${-length-11} 0 ${-length}Z`,'care-bud');
  body+=circle(0,-22,2.3,'care-node');
  return {html:group(`<g transform="scale(${scale})">${body}</g>`,x,y,'care-branch'),tip:[x,y-length*scale],node:[x,y-22*scale],leaf:nodes[1]||nodes[0],base:[x,y]};
 }
 function mesh(x,y,w,h,cls=''){
  // Every slat stays within the actual frame, including the narrow screens.
  const count=Math.max(2,Math.min(7,Math.floor(w/16))),bars=Array.from({length:count},(_,i)=>{const xx=x+7+(w-14)*i/(count-1);return path(`M${xx} ${y}V${y+h-5}`,'care-mesh-line');}).join('');
  return path(`M${x} ${y+h}V${y}H${x+w}V${y+h}`,'care-mesh-frame')+`<g class="${cls}">${bars}</g>`;
 }
 const clock=(x,y,r=24)=>group(circle(0,0,r)+path(`M0 ${-r+4}V${-r+8}M${r-4} 0H${r-8}M0 ${r-4}V${r-8}M${-r+4} 0H${-r+8}`,'care-clock-ticks')+`<g class="care-clock-arm">${path(`M0 0V${-r+10}M0 0H${r*.42}`)}</g>`+circle(0,0,2,'care-node'),x,y);
 const roots=(x,y,cls='care-root-outline')=>group(path('M0 0Q-4 14 0 29M-1 11Q-19 13-26 27M0 17Q17 20 24 34',cls),x,y);
 const brace=(x,y)=>path(`M${x-25} ${y+12}L${x-10} ${y-5}H${x+10}L${x+25} ${y+12}M${x-27} ${y+14}H${x+27}`,'care-brace');
 const panelArrow=(x,y)=>path(`M${x} ${y}H${x+45}M${x+37} ${y-6}L${x+45} ${y}L${x+37} ${y+6}`,'care-step-arrow');
 let picture='';
 const scene={
 'podocarpus':[
  ()=>{const b=branch(350,246);picture=sun(76,125)+mesh(164,93,51,153,'care-mesh-breathe')+b.html+horizon()+flow('M107 126H157')+flow(`M222 128Q270 128 ${b.leaf[0]-25} ${b.leaf[1]-12}`)+flow('M222 170Q280 180 325 192');},
  ()=>{const y=206;picture=soil(y)+branch(235,225,{length:118,scale:.82,bare:54}).html+group(path('M-29-90H-4V-68Q11-70 15-58L25-36Q29-27 22-24Q16-21 12-29L3-45V-8Q3 1-5 1Q-13 1-13-8V-46L-22-36Q-29-30-34-37L-46-54Q-51-61-45-65Q-39-69-35-62L-29-53Z','care-touch-hand')+path('M-23-66L-12-59M8-53L15-37M-9-13Q-5-17-1-13','care-hand-crease'),145,y,'care-hand-tap')+drop(320,142,.72)+flow('M320 163V208Q305 234 285 251','water')+path('M278 269H298','care-outlet')+flow('M285 253V282','drain');},
  ()=>{const b=branch(225,230,{length:134,thin:true});picture=soil(207)+b.html+roots(225,230)+clock(365,167,31)+path('M199 207H251','care-position-mark')+flow('M313 173Q278 189 243 204');}
 ],
 citron:[
  ()=>{const b=branch(340,244,{scale:1.05});picture=sun(99,167,20,'care-morning-sun')+b.html+horizon()+flow('M134 153Q222 121 313 158');},
  ()=>{const b=branch(249,235,{scale:.82,bare:58});picture=soil(201)+b.html+drop(110,143,.74)+flow('M110 163L110 202Q143 233 180 267','water')+circle(331,229,14,'care-air-pocket')+circle(293,252,9,'care-air-pocket')+circle(94,248,10,'care-air-pocket')+flow('M368 261Q387 223 363 185','air');},
  ()=>{const b=branch(222,232,{length:145});picture=soil(208)+b.html+roots(222,232)+circle(260,162,17,'care-inspect-ring')+path('M243 151L254 139','care-thorn-detail')+flow('M335 153Q289 179 248 205');}
 ],
 'five-lobed-maple':[
  ()=>{const b=branch(332,239,{thin:true});picture=path('M62 85H177V225H62ZM120 85V225M62 153H177','care-window')+b.html+horizon(244)+flow('M181 118Q249 116 309 153')+flow('M185 204Q236 181 287 205','air')+path('M319 245H346M332 239V251','care-position-mark');},
  ()=>{picture=soil(207)+branch(232,227,{length:122,scale:.84,bare:56,thin:true}).html+path('M137 126V233M130 126H144M130 146H137M130 165H137M130 184H137M130 214H137M129 234H145','care-moisture-probe')+circle(137,208,11,'care-inspect-ring')+drop(321,158,.55,'care-small-drop')+flow('M321 178V208Q301 236 280 251','water');},
  ()=>{const b=branch(198,235,{length:142,thin:true});picture=soil(208,93,284)+b.html+roots(198,235)+clock(357,176,29)+path('M170 208H226','care-position-mark');}
 ],
 crape:[
  ()=>{const young=branch(128,245,{scale:.66,bare:54}),settled=branch(356,240,{scale:1.04});picture=mesh(79,125,95,120)+young.html+settled.html+roots(356,240)+sun(249,103,18)+flow('M272 117Q314 127 337 164')+panelArrow(211,222);},
  ()=>{picture=soil(181)+branch(252,207,{length:128,scale:.78,bare:60}).html+drop(111,133,.72)+flow('M111 153V182Q175 219 231 226T366 269V284','water')+path('M95 217L105 208L117 215M178 252L190 242L203 250M286 199L297 192L310 201','care-granules')+path('M350 269H382','care-outlet');},
  ()=>{const b=branch(213,247,{length:142,bare:68,bud:true});picture=soil(214,100,215)+b.html+brace(213,210)+clock(365,162,27)+path('M301 237V207M295 214L301 207L307 214M292 202L310 220M310 202L292 220','care-do-not-pull');}
 ],
 serissa:[
  ()=>{const b=branch(340,242,{thin:true});picture=path('M65 85H190V231H65ZM128 85V231','care-window')+group(path('M85 89Q75 126 86 159T85 226M110 89Q100 126 111 159T110 226M148 89Q138 126 149 159T148 226M174 89Q164 126 175 159T174 226','care-curtain-lines'),0,0,'care-curtain-sway')+b.html+horizon()+flow('M196 128Q253 123 317 163')+path('M324 249H356M340 241V255','care-position-mark');},
  ()=>{picture=soil(210)+branch(245,237,{length:134,scale:.86,bare:58,thin:true}).html+drop(103,140,.65)+flow('M103 162V211Q124 238 171 258','water')+path('M92 247Q125 241 159 247T226 247T293 247T390 247','care-stable-moisture')+circle(346,231,12,'care-air-pocket')+path('M165 269H185','care-outlet')+flow('M175 258V284','drain');},
  ()=>{const b=branch(224,248,{thin:true,length:136,bare:64});picture=soil(209)+b.html+circle(224,226,7,'care-node-ring')+brace(224,211)+drop(101,167,.5)+flow('M105 187Q145 206 182 228','water')+flow('M294 157Q346 134 394 160','air');}
 ],
 'camellia':[
  ()=>{const b=branch(171,245,{scale:1.05});picture=b.html+roots(171,245)+sun(365,105,22)+mesh(264,104,26,179)+flow('M334 119L296 142')+flow('M258 151Q230 157 191 158')+flow('M332 143L296 170')+flow('M258 177Q226 188 195 190')+horizon(283);},
  ()=>{const b=branch(219,249,{scale:.98});picture=soil(225)+b.html+sun(79,118,16)+flow('M102 143Q140 148 162 169')+circle(354,230,31,'care-lens')+path('M375 253L393 274','care-lens-handle')+path('M334 231l9-7l9 7l-9 7ZM355 219l7-6l8 7l-8 6ZM356 242l8-6l8 6','care-granules');},
  ()=>{const before=branch(129,242,{scale:1.02,bare:0}),after=branch(349,248,{length:137,bare:75,scale:.92});picture=before.html+path('M101 165L116 180M116 165L101 180','care-remove-cross')+panelArrow(211,173)+soil(208,290,125)+after.html+brace(349,209);}
 ],
 osmanthus:[
  ()=>{const b=branch(354,247,{length:136});picture=sun(74,100,18)+path('M185 251V66H411V251M185 80H411','care-diffuse-canopy')+Array.from({length:7},(_,i)=>path(`M${203+i*30} 66V80`,'care-mesh-line')).join('')+b.html+horizon(251)+flow('M104 96L176 72')+flow('M272 84Q294 127 326 153')+flow('M381 84Q383 133 377 165');},
  ()=>{picture=soil(187)+branch(240,216,{length:128,scale:.8,bare:58}).html+path('M88 229Q122 222 157 229T226 229T295 229T391 229','care-stable-moisture')+path('M88 211H391M88 246H391','care-moisture-range')+circle(342,214,10,'care-air-pocket')+circle(280,251,8,'care-air-pocket')+drop(108,148,.52)+path('M107 170V183','care-small-water');},
  ()=>{const b=branch(191,242,{length:140,bare:69});picture=soil(209,91,202)+b.html+roots(191,242,'care-patient-roots')+clock(365,166,33)+path('M174 211H208','care-position-mark');}
 ],
 'ginkgo':[
  ()=>{const young=branch(128,241,{scale:.63,bare:57}),settled=branch(354,241,{scale:.91});picture=path('M68 151Q128 89 188 151M77 143V241M179 143V241','care-shelter')+young.html+settled.html+roots(354,241)+sun(389,68,17)+flow('M377 98L344 129')+panelArrow(214,220);},
  ()=>{picture=soil(183)+branch(130,214,{length:128,scale:.75,bare:56}).html+drop(241,125,.7)+Array.from({length:8},(_,i)=>{const x=86+(i%4)*91,y=208+Math.floor(i/4)*36;return path(`M${x} ${y}l13-9l13 9l-13 9Z`,'care-drain-grain');}).join('')+flow('M241 146V185Q221 208 214 232Q211 252 193 270V284','water')+flow('M247 187Q277 219 303 235Q323 249 337 270V284','drain')+path('M177 269H209M320 269H352','care-outlet');},
  ()=>{const b=branch(187,232,{length:142,thin:true});picture=soil(208)+b.html+roots(187,232)+circle(187,245,43,'care-inspect-ring')+clock(356,160,31)+flow('M313 165Q260 192 224 227');}
 ],
 bougainvillea:[
  ()=>{const b=branch(325,240,{length:143});picture=sun(88,109,20)+mesh(183,99,39,143,'care-mesh-breathe')+b.html+horizon()+flow('M114 119L175 123')+flow('M229 140Q267 153 300 176');},
  ()=>{const b=branch(241,223,{scale:.88,bare:55});picture=soil(199)+b.html+drop(111,148,.67)+flow('M111 167V198Q168 242 205 266','water')+path('M194 269H217','care-outlet')+flow('M205 267V283','drain');},
  ()=>{const before=branch(144,241,{bare:46}),after=branch(330,230,{bare:67});picture=before.html+soil(208,270,120)+after.html+panelArrow(205,177)+circle(153,185,13,'care-inspect-ring')+brace(330,209);}
 ],
 pomegranate:[
  ()=>{const b=branch(326,240,{length:145});picture=sun(88,109,22)+b.html+horizon()+flow('M116 122Q204 132 296 166');},
  ()=>{const b=branch(241,223,{scale:.88,bare:55});picture=soil(199)+b.html+drop(111,148,.67)+flow('M111 167V198Q168 242 205 266','water')+path('M194 269H217','care-outlet')+flow('M205 267V283','drain');},
  ()=>{const before=branch(144,241,{bare:46}),after=branch(330,230,{bare:67});picture=before.html+soil(208,270,120)+after.html+panelArrow(205,177)+roots(330,230,'care-patient-roots')+clock(390,150,24);}
 ]
 };
 scene[plant.id][topic]();
 const definitions=`<defs><marker id="${prefix}-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M1 1L8 5L1 9" fill="none" stroke="context-stroke" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>`;
 const guide=sceneGuides[plant.id][topic],labels=[{text:guide[0],target:guide[1],x:120,via:guide[4]||[]},{text:guide[2],target:guide[3],x:340,via:guide[5]||[]}];
 const annotations=labels.map(({text,target,x,via})=>`<g class="scene-callout"><path class="care-leader" data-label-x="${x}" data-target="${target.join(',')}" data-via="${via.map(p=>p.join(',')).join(' ')}"/><text x="${x}" y="0" text-anchor="middle" data-type>${text}</text></g>`).join('');
 return definitions+`<g class="care-scene-composition"><g class="care-scene-art">${picture}</g><g class="care-annotations">${annotations}</g></g>`;
}
export function careScene(plant,topic){
 return `<svg xmlns="http://www.w3.org/2000/svg" class="care-diagram broadcast-diagram care-lesson-scene" data-scene="${plant.id}-${topic}" viewBox="0 0 480 320" role="img" aria-label="${plant.name} · ${careLessons[plant.id][topic][0]}，养护动作示意"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${createScene(plant,topic)}</g></svg>`;
}
