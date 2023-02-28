import * as Puppeteer from 'puppeteer'

export const generateId = (length: number): string => {
  let result = ''
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const characterCount = characters.length
  for (let index = 0; index < length; index++) {
    result += characters.charAt(Math.floor(Math.random() * characterCount))
  }
  return result
}

export const debug = async (page: Puppeteer.Page) => {
  await page.evaluate(() => {
    // eslint-disable-next-line no-debugger
    debugger
  })
}

export * from './validate/validateFutbinPriceResponse.js'
export * from './getTimestamp.js'
export * from './getDuration.js'
export * from './getErrorLocation.js'
