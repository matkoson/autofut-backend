import fs from 'fs'
import path from 'path'

import getReportTime from './getReportTimestamp.js'
import makeLogEntries from './makeLogEntries.js'

const { reportTimestamp, reportDate } = getReportTime()

const handlePriceFiles = (onlyDiff, playerPriceList) => {
  const priceAnalysisOutputPath = path.join(process.cwd(), 'analysis', 'prices')

  if (!fs.existsSync(priceAnalysisOutputPath)) {
    fs.mkdirSync(priceAnalysisOutputPath, { recursive: true })
  }

  console.log('[🎼  PRICES REPORT]:\n>logging results!')

  console.log('Sorting by price...')
  // eslint-disable-next-line id-length
  playerPriceList.sort((a, b) => {
    const regex = /\d+/g
    const getCalcPrice = (price) => {
      return Number(price.match(regex).join(''))
    }

    return getCalcPrice(a.price) - getCalcPrice(b.price)
  })

  const sortedList = playerPriceList.map((player, index) => {
    return player.price
  })

  const todayPricesDir = path.join(`${priceAnalysisOutputPath}/${reportDate}`)

  if (!fs.existsSync(todayPricesDir)) {
    fs.mkdirSync(todayPricesDir)
  }

  fs.writeFile(
    `${todayPricesDir}/[${reportTimestamp}].txt`,
    makeLogEntries(reportTimestamp, playerPriceList, false, onlyDiff),
    (err) => {
      if (err) {
        console.error(`🔴🔴🔴 Error writing report to file: ${reportDate}`, err)
        return
      }
      console.log(
        `[🎼  PRICES REPORT]:\n>Report saved at: [${reportTimestamp}].txt`
      )
    }
  )

  console.log(
    `[🎼 TRADE REPORT]:\n>Writing ${priceAnalysisOutputPath}/tradeable.txt`
  )
  const tradeableEntries = makeLogEntries(
    reportTimestamp,
    playerPriceList,
    false,
    true
  )

  const allEntries = makeLogEntries(
    reportTimestamp,
    playerPriceList,
    false,
    false
  )

  fs.writeFile(
    `${priceAnalysisOutputPath}/tradeable.txt`,
    tradeableEntries,
    (err) => {
      if (err) {
        console.error(
          `🔴🔴🔴 Error writing report to file: ${priceAnalysisOutputPath}`,
          err
        )
        return
      }
      console.log(
        `[🎼  PRICES REPORT]:\n>Report saved at: ${priceAnalysisOutputPath}/tradeable.txt`
      )
    }
  )

  console.log(
    `[🎼  PRICES REPORT]:\n>Writing ${priceAnalysisOutputPath}/prices.txt`
  )

  fs.writeFile(`${priceAnalysisOutputPath}/prices.txt`, allEntries, (err) => {
    if (err) {
      console.error(
        `🔴🔴🔴 Error writing report to file: ${priceAnalysisOutputPath}`,
        err
      )
      return
    }
    console.log(
      `[🎼  PRICES REPORT]:\n>Report saved at: ${priceAnalysisOutputPath}/prices.txt`
    )
  })
}

export default handlePriceFiles
