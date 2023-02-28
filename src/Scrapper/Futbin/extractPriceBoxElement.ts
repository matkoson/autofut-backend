/* eslint-disable no-await-in-loop */
import * as Puppeteer from 'puppeteer'

const TAG = '[✂️ EXTRACT_PRICE_BOX_ELEMENT ✂️]:'
const extractPriceBoxElement = async (
  page: Puppeteer.Page
): Promise<Puppeteer.ElementHandle> => {
  const priceBox = await page.$('[class="box_price box_price_ps"]')

  if (!priceBox) {
    throw new Error(`${TAG}: 🔴🔴🔴 No element found!`)
  }

  return priceBox
}
export default extractPriceBoxElement
