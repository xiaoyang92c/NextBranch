async (page) => {
  await page.setViewportSize({width:518,height:1143});
  await page.goto('http://localhost:4173/?letter=geometry-v2#letters');
  await page.waitForTimeout(1550);
  const selected=page.locator('.mailbox-letter[aria-current="true"]').first();
  const before=await selected.evaluate(el=>{const b=el.getBoundingClientRect(),p=el.querySelector('.garden-letter-paper').getBoundingClientRect();return {button:{x:b.x,y:b.y,w:b.width,h:b.height},paper:{x:p.x,y:p.y,w:p.width,h:p.height}}});
  await selected.click();
  const frames=[];
  for(const delay of [780,280,450]){
    await page.waitForTimeout(delay);
    frames.push(await page.evaluate(()=>{const stage=document.querySelector('.postal-fold-stage'),sheet=document.querySelector('.postal-sheet'),paper=document.querySelector('.mail-opening-stage .garden-letter-paper');const rect=el=>{if(!el)return null;const b=el.getBoundingClientRect();return {x:Math.round(b.x),y:Math.round(b.y),w:Math.round(b.width),h:Math.round(b.height)}};return {stage:rect(stage),stageTransform:stage&&getComputedStyle(stage).transform,sheet:rect(sheet),paper:rect(paper)};}));
  }
  return {before,frames};
}
