import path from 'path'
import * as fs from 'fs'

import { getTimestamp } from '../utils/index.js'
import Logger from '../logger/index.js'

const { logSuccess } = Logger

type FutbinPriceData = {
  futbin: {
    timestamp: string
    rating: string
    rarity: string | null
    quality: string | null
    isUntradeable: string
    price: string
    name: string
  }[]
}

const TAG = `[💾 PRICE SAVED 💾]:`

const saveFutbinPrice = (
  playerName: string,
  rating: string,
  isUntradeable: string,
  quality: string | null,
  rarity: string | null,
  rawPrice: string
): void => {
  Logger.logWithTimestamp(
    'info',
    `[🆙 PRICE UPDATE 🆙]:`,
    ` player: (⚽️ '${playerName}' ⚽️), rating: (💯 '${rating}' 💯), isUntradeable: (🔒 '${isUntradeable}' 🔒)`
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
          name: playerName,
        })
        const data = JSON.stringify(prices, null, 2)

        fs.writeFileSync(newPath, data)
        fs.unlinkSync(oldPath)

        Logger.logWithTimestamp('success', TAG, `(${playerName})(${rating})`)
        updatedFile = true
      }
    })

    if (!updatedFile) {
      const filePath = path.join(
        pricesDirPath,
        `(${playerName})(${rating})[${timestamp}].json`
      )
      const prices: FutbinPriceData = { futbin: [] }
      prices.futbin.unshift({
        timestamp,
        price: rawPrice,
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
      Logger.logWithTimestamp(
        'success',
        TAG,
        `Successfully saved price for (${playerName})(${rating})`
      )
    }
  } catch (error) {
    Logger.logWithTimestamp(
      'error',
      `[🎯 PRICE UPDATE 🎯]: FAILED 🔴🔴🔴 player:`,
      `(⚽️ '${playerName}' ⚽️), rating: (💯 '${rating}' 💯), isUntradeable: (🔒 '${isUntradeable}' 🔒)`
    )
    console.error(error)
  }
}

export default saveFutbinPrice
