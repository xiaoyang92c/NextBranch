async (page) => {
  await page.setViewportSize({width:390,height:844});
  await page.locator('.mailbox-find').click();
  await page.locator('[data-mail-plant="serissa"]').click();
  await page.locator('.mailbox-filter-done').click();
  await page.locator('.mailbox-letter').click();
  await page.waitForTimeout(2050);
  await page.locator('[data-letter-tab="replies"]').click();
  await page.waitForTimeout(600);
  await page.screenshot({path:'output/playwright/letter-awaiting.png'});
  return await page.evaluate(()=>{const body=document.querySelector('.postal-reader-body'),awaiting=body.querySelector('.postal-awaiting');return {text:awaiting?.innerText,body:body?.getBoundingClientRect().toJSON(),content:awaiting?.getBoundingClientRect().toJSON(),centered:body?.classList.contains('is-awaiting')};});
}
