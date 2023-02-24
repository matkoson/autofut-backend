/* eslint-disable no-await-in-loop */
import * as Puppeteer from 'puppeteer'

import Logger from '../../logger/index.js'

const TAG = '[📋 STATS_INNER_TABLE  📋]:'

const extractStatsInnerTableElement = async (
  page: Puppeteer.Page
): Promise<Puppeteer.ElementHandle> => {
  /* Find stats inner table and mark it with id. */
  await page.evaluate(() => {
    const statsInnerDiv = [...document.querySelectorAll('div')].filter(
      (div) => {
        return div.className.includes('stats-inner')
      }
    )
    if (!statsInnerDiv || !statsInnerDiv.length || statsInnerDiv.length > 1) {
      throw new Error('[🔴 STATS INNER DIV]: Unexpected number of divs!')
    }
    statsInnerDiv[0].id = 'stats-inner'
  })

  const statsInnerTableElement = await page.$('#stats-inner')

  if (!statsInnerTableElement) {
    throw new Error('[🔴 FIND_STATS_INNER_TABLE_ELEMENT]: No element found!')
  }

  return statsInnerTableElement
}
export default extractStatsInnerTableElement
