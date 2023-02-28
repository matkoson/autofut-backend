/* eslint-disable no-await-in-loop */
import * as Puppeteer from 'puppeteer'

const extractPlayerInfoTableElement = async (
  page: Puppeteer.Page
): Promise<Puppeteer.ElementHandle> => {
  const infoTable = await page.$('[class="table  table-info"]')

  if (!infoTable) {
    throw new Error('[🔴 FIND_INFO_TABLE_ELEMENT]: No element found!')
  }

  return infoTable
}
export default extractPlayerInfoTableElement
