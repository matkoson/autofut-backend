import path from 'path'
import * as fs from 'fs'

import { getTimestamp } from '../utils/index.js'
import Logger from '../logger/index.js'

const { logInfo, logError, logSuccess, logWarn } = Logger

type FutbinPriceData = {
  futbin: { timestamp: string; price: string }[]
}

const saveFutbinPrice = (
  playerName: string,
  rating: string,
  price: string
): void => {
  logInfo(`Saving Futbin price for (${playerName})(${rating})...`)
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

        prices.futbin.unshift({ timestamp, price })
        const data = JSON.stringify(prices, null, 2)

        fs.writeFileSync(newPath, data)
        fs.unlinkSync(oldPath)

        logSuccess(`[💾 PRICE SAVED]: (${playerName})(${rating})`)
        updatedFile = true
      }
    })

    if (!updatedFile) {
      const filePath = path.join(
        pricesDirPath,
        `(${playerName})(${rating})[${timestamp}].json`
      )
      const prices: FutbinPriceData = { futbin: [] }
      prices.futbin.unshift({ timestamp, price })
      const data = JSON.stringify(prices, null, 2)

      if (!fs.existsSync(pricesDirPath)) {
        fs.mkdirSync(pricesDirPath)
      }

      fs.writeFileSync(filePath, data)
      logSuccess(`Successfully saved price for (${playerName})(${rating})`)
    }
  } catch (error) {
    logError(`Error saving price for (${playerName})(${rating}):`, error)
  }
}

export default saveFutbinPrice
