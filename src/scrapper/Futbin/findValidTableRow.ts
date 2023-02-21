/* eslint-disable no-await-in-loop */
import * as Puppeteer from 'puppeteer'

const findValidTableRow = async (
  rating: string,
  page: Puppeteer.Page
): Promise<Puppeteer.ElementHandle<HTMLTableRowElement>> => {
  const tableRows = await page.$$('tbody tr')

  if (!tableRows.length) {
    throw new Error('[🔴 FIND_VALID_TABLE_CELLS]: No table rows found')
  }

  const validTableRows = []

  for (const tableRow of tableRows) {
    const hasValidClassName = await tableRow.evaluate((element) => {
      return element.className?.includes('player_tr_')
    })
    const ratingElement = await tableRow.$('td > span.rating')
    const hasValidRating = await ratingElement?.evaluate(
      (spanElement, expectedRating) => {
        return spanElement.textContent?.trim() === expectedRating
      },
      rating
    )
    if (hasValidClassName && hasValidRating) {
      // separate first and last name with pipe <span> tag
      const aElement = await page.$('a[data-tp-type="player"]')
      const text = await (
        await aElement?.getProperty('textContent')
      )?.jsonValue()
      const formattedText = text?.replace(/\s+/g, '|')
      console.log(formattedText)
      if (aElement) {
        const name = await page.evaluate((el) => {
          return el?.textContent?.trim().replace(' ', '<div></div>')
        }, aElement)
        console.log('[✂️  NAME REPLACED]: ', name)
      } else {
        console.log('Anchor element not found')
      }

      validTableRows.push(tableRow)
    }
  }

  if (!validTableRows.length) {
    throw new Error('[🔴 FIND_VALID_TABLE_CELLS]: No valid table rows found')
  } else if (validTableRows.length > 1) {
    throw new Error(
      '[🔴 FIND_VALID_TABLE_CELLS]: There can NOT be two valid rows'
    )
  }

  const validTableRow = await validTableRows[0]

  return validTableRow
}
export default findValidTableRow
