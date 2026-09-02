import { chromium } from 'playwright'

const widths = [320, 375, 412]
const browser = await chromium.launch({ headless: true })
const results = []
for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 844 }, deviceScaleFactor: 1, isMobile: true })
  const consoleErrors = []
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()) })
  await page.goto(`https://ocp.ivc.lol/share/event/1?qa=${width}`, { waitUntil: 'networkidle' })
  const data = await page.evaluate(() => ({
    viewportWidth: window.innerWidth,
    bodyWidth: document.body.scrollWidth,
    miniShell: Boolean(document.querySelector('.mini-app-shell')),
    eventArtwork: Boolean(document.querySelector('.event-art img')),
    primaryButtons: [...document.querySelectorAll('.event-actions button')].map((button) => ({ text: button.textContent?.trim(), width: button.getBoundingClientRect().width, height: button.getBoundingClientRect().height })),
    heading: document.querySelector('h1')?.textContent,
  }))
  results.push({ width, ...data, overflow: data.bodyWidth > data.viewportWidth, consoleErrors })
  await page.close()
}
await browser.close()
console.log(JSON.stringify(results, null, 2))
