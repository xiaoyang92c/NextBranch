async (page) => {
  await page.getByRole('button', { name: '枝友来信' }).evaluate(element => element.click());
  await page.waitForTimeout(850);
  await page.screenshot({ path: 'output/playwright/home-exit-late.png' });
  return await page.evaluate(() => ({
    bottomGlyphs: document.querySelector('.scene-chinese .scene-copy')?.children.length,
    bottomMask: document.querySelector('.scene-chinese .scene-copy .scene-ink-letter')?.style.maskImage,
    shadowMask: document.querySelector('.scene-stamp.current > .stamp-shadow')?.style.maskImage,
    shadowVisibility: document.querySelector('.scene-stamp.current > .stamp-shadow')?.style.visibility
  }));
}
