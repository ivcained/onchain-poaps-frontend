import { chromium } from 'playwright'

const baseUrl = process.env.QA_BASE_URL ?? 'https://ocp.ivc.lol'
const routes = ['/', '/create', '/gallery', '/claim', '/poap/1', '/share/event/1']
const widths = [320, 375, 412]
const browser = await chromium.launch({ headless: true })
const results = []

for (const width of widths) {
  for (const route of routes) {
    const page = await browser.newPage({ viewport: { width, height: 844 }, deviceScaleFactor: 1 })
    const consoleErrors = []
    const pageErrors = []
    const responseStatuses = new Map()
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()) })
    page.on('pageerror', (error) => pageErrors.push(error.message))
    page.on('response', (response) => responseStatuses.set(response.url(), response.status()))
    let navigationError = null
    let response = null
    try {
      response = await page.goto(`${baseUrl}${route}?qa=${width}`, { waitUntil: 'networkidle' })
    } catch (error) {
      navigationError = error instanceof Error ? error.message : String(error)
    }
    const data = await page.evaluate(() => {
      const visible = (element) => {
        const rect = element.getBoundingClientRect()
        const style = getComputedStyle(element)
        return Boolean(rect.width && rect.height && style.visibility !== 'hidden' && style.display !== 'none')
      }
      const geometry = (element) => {
        const rect = element.getBoundingClientRect()
        const style = getComputedStyle(element)
        return { width: Math.round(rect.width), height: Math.round(rect.height), top: Math.round(rect.top), bottom: Math.round(rect.bottom), left: Math.round(rect.left), right: Math.round(rect.right), position: style.position }
      }
      const selector = (element) => element.tagName.toLowerCase() + (element.className && typeof element.className === 'string' ? `.${element.className.replaceAll(' ', '.')}` : '')
      const artwork = [...document.querySelectorAll('.event-art, .event-artwork, .event-art img, .share-event-art, .share-event-art img, .gallery-card img, .gallery-placeholder, .scene-preview, .preview-art')].filter(visible).map((element) => ({ selector: selector(element), ...geometry(element) }))
      const ctas = [...document.querySelectorAll('button, a[role="button"], .register-button, .primary-action, [data-testid*="cta" i]')].filter(visible).map((element) => ({ text: element.textContent?.trim(), sticky: ['sticky', 'fixed'].includes(getComputedStyle(element).position), ...geometry(element) }))
      const stickyControls = [...document.querySelectorAll('button, a, [role="button"], input, textarea, select, [class*="action" i], [class*="control" i]')].filter((element) => visible(element) && ['sticky', 'fixed'].includes(getComputedStyle(element).position)).map((element) => ({ text: element.textContent?.trim(), tag: element.tagName.toLowerCase(), ...geometry(element) }))
      return {
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        bodyWidth: document.body.scrollWidth,
        documentWidth: document.documentElement.scrollWidth,
        maxElementRight: Math.max(0, ...[...document.querySelectorAll('body *')].filter(visible).map((element) => element.getBoundingClientRect().right)),
        overflow: document.body.scrollWidth > window.innerWidth || document.documentElement.scrollWidth > window.innerWidth,
        miniShell: Boolean(document.querySelector('.mini-app-shell')),
        artwork,
        ctas,
        stickyControls,
        heading: document.querySelector('h1')?.textContent,
      }
    })
    results.push({ width, route, status: response?.status() ?? null, navigationError, ...data, responseStatuses: Object.fromEntries(responseStatuses), consoleErrors, pageErrors })
    await page.close()
  }
}
await browser.close()
console.log(JSON.stringify({ baseUrl, routes, widths, results }, null, 2))
