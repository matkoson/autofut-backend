/* eslint-disable @typescript-eslint/ban-ts-comment*/
import puppeteer from 'puppeteer'
import { PuppeteerExtra } from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
// add stealth plugin and use defaults (all evasion techniques)
// Add adblocker plugin to block all ads and trackers (saves bandwidth)
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker'
import Recaptcha from 'puppeteer-extra-plugin-recaptcha'
// Anonymize user agent
import AnonymizeUa from 'puppeteer-extra-plugin-anonymize-ua'

export const initPuppeteer = async () => {
  const puppeteerExtra = new PuppeteerExtra(puppeteer)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  puppeteerExtra.use(StealthPlugin({ stripHeadless: true, makeWindows: true }))
  puppeteerExtra.use(AdblockerPlugin.default({ blockTrackers: true }))
  // @ts-ignore
  puppeteerExtra.use(AnonymizeUa())
  puppeteerExtra.use(Recaptcha.default())

  const browser = await puppeteerExtra.launch({
    devtools: false,
    headless: true,
  })
  const page = await browser.newPage()
  await page.setViewport({ width: 800, height: 800 })
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'
  )

  return { page, browser }
}
