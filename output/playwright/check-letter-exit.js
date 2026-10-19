async (page) => {
  const bounds = await page.evaluate(() => {
    const entry = document.querySelector('.mailbox-entry');
    const frame = entry.querySelector('.mailbox-ink-frame').getBoundingClientRect();
    const botanical = entry.querySelector('.garden-botanical').getBoundingClientRect();
    const letter = entry.querySelector('.mailbox-letter').getBoundingClientRect();
    return { frame: { x: frame.x, y: frame.y, width: frame.width, height: frame.height }, botanical: { x: botanical.x, y: botanical.y, right: botanical.right, bottom: botanical.bottom }, letter: { x: letter.x, y: letter.y, width: letter.width, height: letter.height } };
  });
  await page.getByRole('button', { name: '邮票馆' }).evaluate(element => element.click());
  await page.waitForTimeout(760);
  await page.screenshot({ path: 'output/playwright/letter-exit-late.png' });
  return { bounds, visible: await page.evaluate(() => [...document.querySelectorAll('.mailbox-entry')].filter(entry => { const b = entry.getBoundingClientRect(); return b.bottom > 0 && b.top < innerHeight; }).map(entry => { const image = entry.querySelector('.garden-botanical'); const b = image.getBoundingClientRect(); return { y: b.y, x: b.x, visibility: image.style.visibility, mask: image.style.maskImage, frameVisibility: entry.querySelector('.mailbox-ink-frame').style.visibility }; })) };
}
