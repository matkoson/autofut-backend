import fs from 'fs'
import path from 'path'
import * as url from 'url'

import * as Puppeteer from 'puppeteer'

import Logger from '../../logger/index.js'

const TAG = '[💾 HTML SAVED 🟢]:'

export const saveElement = async (
  playerName: string,
  rating: string,
  page: Puppeteer.Page,
  fileName: string,
  element?: Puppeteer.ElementHandle<Element>
) => {
  const dir = path.join(
    path.dirname(url.fileURLToPath(import.meta.url)),
    '../../debug'
  )
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }
  const filePath = path.join(dir, fileName)
  let html: string | null = null

  if (element) {
    html = await element.evaluate((node) => {
      return node.innerHTML
    })
    const json = JSON.stringify(html, null, 2)

    fs.writeFileSync(`${filePath}.json`, json)
    /* Extract html from the given page and save it to ./debug */

    await element.screenshot({ path: `${filePath}.png` })
  } else {
    html = await page.content()
    await page.screenshot({ path: `${filePath}.png` })
    fs.writeFileSync(`${filePath}.json`, JSON.stringify(html, null, 2))
  }
  Logger.logWithTimestamp(
    'info',
    TAG,
    `${fileName}]: player: [⚽️ '${playerName}' ⚽️], [💯 '${rating}'], path: ${filePath}.json`
  )

  Logger.logWithTimestamp(
    'info',
    TAG,
    ` ${fileName}]: player: ${playerName}, path: ${filePath}.png`
  )

  return { html }
}
