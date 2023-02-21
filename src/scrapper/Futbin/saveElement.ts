import fs from 'fs'
import path from 'path'
import * as url from 'url'

import * as Puppeteer from 'puppeteer'

export const saveElement = async (
  page: Puppeteer.Page,
  fileName: string,
  element?: Puppeteer.ElementHandle<Element>
) => {
  const dir = path.join(
    path.dirname(url.fileURLToPath(import.meta.url)),
    '../html'
  )
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }
  const filePath = path.join(dir, fileName)

  if (element) {
    const html = await element.evaluate((node) => {
      return node.innerHTML
    })
    const json = JSON.stringify(html, null, 2)

    fs.writeFileSync(`${filePath}.json`, json)
    /* Extract html from the given page and save it to ./debug */

    await element.screenshot({ path: `${filePath}.png` })

    return { html }
  }

  const html = await page.content()
  await page.screenshot({ path: `${filePath}.png` })
  fs.writeFileSync(`${filePath}.json`, JSON.stringify(html, null, 2))

  console.info(`[🔵 DEBUG]: HTML and PNG saved to ${filePath}`)

  return { html }
}
