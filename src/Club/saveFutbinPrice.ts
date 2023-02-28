import path from 'path'
import * as fs from 'fs'

import { getTimestamp } from '../utils/index.js'
import Logger from '../logger/index.js'

type FutbinPriceData = {
  futbin: {
    timestamp: string
    rating: string
    rarity: string | null
    quality: string | null
    isUntradeable: string
    price: string
    prevPrices: string
    name: string
  }[]
}

const TAG = `[💾 SAVE PRICE 💰]:`
const logger = new Logger(TAG)

const saveFutbinPrice = (
  playerName: string,
  rating: string,
  isUntradeable: string,
  quality: string | null,
  rarity: string | null,
  rawPrice: string,
  prevPrices: string
): void => {
  logger.logDebug(
    `[🆙 PRICE UPDATE 🆙]:`,
    `player: (⚽️ '${playerName}' ⚽️), rating: (💯 '${rating}' 💯), isUntradeable: (🔒 '${isUntradeable}' 🔒)`
  )

  const pricesDirPath = path.join(process.cwd(), 'src', 'data', 'price')
  const files = fs.readdirSync(pricesDirPath)
  const timestamp = getTimestamp()

  try {
    let updatedFile = false

    files.forEach((file) => {
      if (file.match(`^\\(${playerName}\\).*\\.json$`)) {
        const oldPath = path.join(pricesDirPath, file)
        const newPath = path.join(
          pricesDirPath,
          `(${playerName})(${rating})[${timestamp}].json`
        )

        let prices: FutbinPriceData = { futbin: [] }
        if (fs.existsSync(oldPath)) {
          const fileContents = fs.readFileSync(oldPath, 'utf8')
          prices = JSON.parse(fileContents)
        }

        const price = `${rawPrice} €`

        prices.futbin.unshift({
          timestamp,
          rating,
          isUntradeable,
          quality,
          rarity,
          price,
          prevPrices,
          name: playerName,
        })
        const data = JSON.stringify(prices, null, 2)

        fs.writeFileSync(newPath, data)
        fs.unlinkSync(oldPath)

        logger.logSuccess(TAG, `(${playerName})(${rating})`)
        updatedFile = true
      }
    })

    if (!updatedFile) {
      const filePath = path.join(
        pricesDirPath,
        `(${playerName})(${rating})[${timestamp}].json`
      )
      const preparePreviousPrices = (rawPrevPrices: string): string => {
        /* Prepend with '<=', unless it's the last one */
        const prevPrices = JSON.parse(rawPrevPrices)
        const processedPrevPrices = prevPrices
          .map((price: string, index: number) => {
            if (index === prevPrices.length - 1) {
              return `[${price}]`
            }
            return `[${price}]<=`
          })
          .join('')

        return processedPrevPrices
      }
      const prices: FutbinPriceData = { futbin: [] }
      const processedPrevPrices = preparePreviousPrices(prevPrices)

      prices.futbin.unshift({
        timestamp,
        price: rawPrice,
        prevPrices: processedPrevPrices,
        isUntradeable,
        quality,
        rarity,
        rating,
        name: playerName,
      })
      const data = JSON.stringify(prices, null, 2)

      if (!fs.existsSync(pricesDirPath)) {
        fs.mkdirSync(pricesDirPath)
      }

      fs.writeFileSync(filePath, data)
      logger.logDebug(
        TAG,
        `Successfully saved price for (${playerName})(${rating})`
      )
    }
  } catch (error) {
    logger.logError(
      `[🎯 PRICE UPDATE 🎯]: FAILED 🔴🔴🔴 player:`,
      error as Error,
      `(⚽️ '${playerName}' ⚽️), rating: (💯 '${rating}' 💯), isUntradeable: (🔒 '${isUntradeable}' 🔒)`
    )
    console.error(error)
  }
}

export default saveFutbinPrice
