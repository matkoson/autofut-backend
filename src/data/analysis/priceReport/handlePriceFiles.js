import fs from 'fs'

import getReportTime from './getReportTimestamp.js'
import makeLogEntries from './makeLogEntries.js'
import getPricesDirPath from './getPricesDirPath.js'

const { reportTimestamp, reportDate } = getReportTime()

const handlePriceFiles = (onlyDiff, playerPriceList) => {
  const pricesDirPath = getPricesDirPath()
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
  debugger

  fs.writeFile(
    `${pricesDirPath}/${reportDate}/[${reportTimestamp}].txt`,
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

  console.log(`[🎼 TRADE REPORT]:\n>Writing ${pricesDirPath}/tradeable.txt`)
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

  fs.writeFile(`${pricesDirPath}/tradeable.txt`, tradeableEntries, (err) => {
    if (err) {
      console.error(
        `🔴🔴🔴 Error writing report to file: ${pricesDirPath}`,
        err
      )
      return
    }
    console.log(
      `[🎼  PRICES REPORT]:\n>Report saved at: ${pricesDirPath}/tradeable.txt`
    )
  })

  console.log(`[🎼  PRICES REPORT]:\n>Writing ${pricesDirPath}/prices.txt`)

  fs.writeFile(`${pricesDirPath}/prices.txt`, allEntries, (err) => {
    if (err) {
      console.error(
        `🔴🔴🔴 Error writing report to file: ${pricesDirPath}`,
        err
      )
      return
    }
    console.log(
      `[🎼  PRICES REPORT]:\n>Report saved at: ${pricesDirPath}/prices.txt`
    )
  })
}

export default handlePriceFiles
