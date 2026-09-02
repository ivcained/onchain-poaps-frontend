import { chromium } from 'playwright'

const routes = ['/', '/share/event/1', '/gallery', '/claim']
const widths = [320, 375, 412]
const browser = await chromium.launch({ headless: true })
const results = []
for (const width of widths) {
  for (const route of routes) {
    const page = await browser.newPage({ viewport: { width, height: 844 }, deviceScaleFactor: 1 })
    const consoleErrors = []
    const pageErrors = []
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()) })
    page.on('pageerror', (error) => pageErrors.push(error.message))
    const response = await page.goto(`https://ocp.ivc.lol${route}?qa=${width}`, { waitUntil: 'networkidle' })
    const data = await page.evaluate(() => ({
      viewportWidth: window.innerWidth,
      bodyWidth: document.body.scrollWidth,
      documentWidth: document.documentElement.scrollWidth,
      miniShell: Boolean(document.querySelector('.mini-app-shell')),
      artwork: Boolean(document.querySelector('.event-art img')),
      buttons: [...document.querySelectorAll('button')].map((button) => ({ text: button.textContent?.trim(), visible: Boolean(button.offsetWidth && button.offsetHeight), width: Math.round(button.getBoundingClientRect().width), height: Math.round(button.getBoundingClientRect().height) })),
      heading: document.querySelector('h1')?.textContent,
    }))
    results.push({ width, route, status: response?.status() ?? null, ...data, overflow: data.bodyWidth > data.viewportWidth || data.documentWidth > data.viewportWidth, consoleErrors, pageErrors })
    await page.close()
  }
}
await browser.close()
console.log(JSON.stringify(results, null, 2))
