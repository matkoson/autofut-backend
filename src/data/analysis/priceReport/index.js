import fs from 'fs'
import path from 'path'
import url from 'url'

import handlePriceFiles from './handlePriceFiles.js'
import getReportTime from './getReportTimestamp.js'
import getPriceDirPath from './getPricesDirPath.js'

const dirPath = path.join(
  path.dirname(url.fileURLToPath(import.meta.url)),
  '../../price'
)

const { reportDate, reportTimestamp } = getReportTime()
const today = reportTimestamp.split(':')[0]

console.log(`[🎼 PRICES REPORT  🎼]:\n>reportDate: [🗓  ${reportDate} 🗓]`)

const playerPriceList = []
const isToday = (path) => {
  return path.includes(today)
}

const pricesReportsCleanup = () => {
  const pricesDirPath = getPriceDirPath()
  const files = fs.readdirSync(pricesDirPath)
  files.forEach((priceReportFile) => {
    if (!isToday(priceReportFile)) {
      fs.rmSync(path.join(pricesDirPath, priceReportFile), { recursive: true })
    }
  })
}

const index = (onlyDiff) => {
  try {
    console.log(`[🎼  PRICES REPORT]: Cleaning up old price reports...`)
    pricesReportsCleanup()

    console.log(`[🎼  PRICES REPORT]:\n>Reading files from: ${dirPath}`)
    const files = fs.readdirSync(dirPath)
    console.log(`[🎼  PRICES REPORT]:\n>Files found: ${files.length}`)

    files.forEach((file) => {
      const filePath = path.join(dirPath, file)
      /* Cleanup old price files. */
      if (!isToday(filePath)) {
        fs.rmSync(filePath)
        return
      }

      const fileContent = fs.readFileSync(filePath, 'utf8')
      try {
        const { futbin } = JSON.parse(fileContent)
        if (futbin.length > 0) {
          const {
            timestamp,
            rating,
            quality,
            rarity,
            isUntradeable,
            price,
            name,
          } = futbin[0]
          playerPriceList.push({
            timestamp,
            rating: parseInt(rating),
            quality,
            rarity,
            isUntradeable,
            price,
            name,
          })
        }
      } catch (error) {
        console.error(`🔴🔴🔴 Error parsing JSON file: ${filePath}`, error)
      }
    })

    handlePriceFiles(onlyDiff, playerPriceList)
  } catch (error) {
    console.error(error)
  }
}

export default index
