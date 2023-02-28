/* eslint-disable no-await-in-loop */
import * as Puppeteer from 'puppeteer'

import { validateString } from '../../utils/validate/index.js'
import Logger from '../../logger/index.js'

const TAG = '[🧐 FIND_PLAYER_URL 🧐]:'
const logger = new Logger(TAG)

const findPlayerFutbinUrl = async (
  playerName: string,
  rating: string,
  page: Puppeteer.Page
): Promise<string> => {
  const url = await page.url()
  const tableRows = await page.$$('tbody tr')

  if (!tableRows.length) {
    throw new Error('[🔴 FIND_VALID_TABLE_CELLS]: No table rows found')
  }

  let futbinPlayerUrl = null

  for (const tableRow of tableRows) {
    const hasValidClassName = await tableRow.evaluate((element) => {
      return element.className?.includes('player_tr_')
    })
    const ratingElement = await tableRow.$('td > span.rating')
    const isWcVersion = await ratingElement?.evaluate((element) => {
      return element.className?.includes('wc_player')
    })

    if (isWcVersion) {
      logger.logDebug(
        TAG,
        `WC player version found for player: ${playerName}! Discarding...`
      )
      continue
    }

    const ratingElementText = await ratingElement?.evaluate((spanElement) => {
      return spanElement.textContent?.trim()
    })

    const hasExpectedRating = String(ratingElementText) === String(rating)
    if (hasValidClassName && hasExpectedRating) {
      const playerUrl = await tableRow.evaluate((element) => {
        const linkElements = [...element.querySelectorAll('[data-site-id]')]

        if (!linkElements || !linkElements.length || linkElements.length > 1) {
          throw new Error(
            '[??  LINK ELEMENTS]: Unexpected number of link elements!'
          )
        }
        return `https://www.futbin.com${linkElements[0].getAttribute('href')}`
      })

      if (futbinPlayerUrl) {
        logger.logWarn(
          TAG,
          `player: (${playerName})(${rating}): Multiple valid Futbin player URLs found! Investigate! Another valid URL: ${playerUrl}, ratingElementText: ${ratingElementText}`,
          300
        )
      }

      futbinPlayerUrl = playerUrl
    }
  }

  if (!futbinPlayerUrl) {
    throw new Error(
      `[🔴 FIND_PLAYER_FUTBIN_URL]: player: (${playerName})(${rating}) No valid Futbin player URL found`
    )
  }

  validateString(playerName, rating, futbinPlayerUrl, 'Futbin player URL')
  return futbinPlayerUrl
}

export default findPlayerFutbinUrl
