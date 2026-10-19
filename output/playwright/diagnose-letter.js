async (page) => {
  await page.getByRole('button', { name: '邮票馆' }).evaluate(element => element.click());
  await page.waitForTimeout(520);
  const state = await page.evaluate(() => [...document.querySelectorAll('.mailbox-entry')].filter(entry => { const box = entry.getBoundingClientRect(); return box.bottom > 0 && box.top < innerHeight; }).map(entry => { const image = entry.querySelector('.garden-botanical'); const paper = entry.querySelector('.mailbox-ink-frame'); return { y: image.getBoundingClientRect().y, opacity: getComputedStyle(image).opacity, imageAnimations: image.getAnimations().map(a => ({ currentTime: a.currentTime, playState: a.playState })), frameMask: paper.style.maskImage }; }));
  await page.screenshot({ path: 'output/playwright/letter-exit-diagnostic.png' });
  return state;
}
