async (page) => {
  await page.waitForTimeout(500);
  await page.screenshot({path:'output/playwright/letter-open.png'});
  const opened=await page.evaluate(()=>({title:document.querySelector('.garden-letter-subject')?.textContent,body:document.querySelector('.postal-reader-body')?.innerText.slice(0,100),sheet:document.querySelector('.postal-sheet')?.getBoundingClientRect().toJSON()}));
  await page.locator('[data-letter-tab="replies"]').click();
  await page.waitForTimeout(180);
  await page.screenshot({path:'output/playwright/letter-tab-mid.png'});
  await page.waitForTimeout(370);
  await page.screenshot({path:'output/playwright/letter-replies.png'});
  await page.locator('.letter-close').click();
  await page.waitForTimeout(240);
  const closing=await page.evaluate(()=>{const stage=document.querySelector('.postal-fold-stage'),paper=document.querySelector('.mail-opening-stage .garden-letter-paper');return {stage:stage?.getBoundingClientRect().toJSON(),paper:paper?.getBoundingClientRect().toJSON(),stageTransform:stage&&getComputedStyle(stage).transform}});
  await page.screenshot({path:'output/playwright/letter-close-mid.png'});
  await page.waitForTimeout(1750);
  return {opened,closing,overlay:await page.locator('#letter-overlay').count()};
}
