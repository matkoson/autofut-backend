import getIsUntradeableLog from './getIsUntradeableLog.js'
import getQualityRarityLog from './getQualityRarityLog.js'
import getPriceDiff from './getPriceDiff.js'
import transformLogEntries from './applyLogTransformations.js'

const blackList = [
  'Kylian Mbappé',
  'Kyle Walker',
  'Theo Hernández',
  'Renato Sanches',
]

const makeLogEntries = (
  reportTimestamp,
  playerPriceList,
  shouldLogToStdOut = false,
  onlyDiff = false
) => {
  const logEntries = []

  playerPriceList.forEach((priceEntry, index) => {
    const {
      timestamp,
      rating,
      quality,
      rarity,
      price,
      prevPrices,
      name,
      isUntradeable,
    } = priceEntry

    if (
      ![timestamp, rating, quality, rarity, price, name, isUntradeable].every(
        Boolean
      )
    ) {
      return
    }

    const trabeability = getIsUntradeableLog(isUntradeable)
    if (trabeability !== '[🟢 TR 🟢]') {
      return
    }
    if (blackList.includes(name)) {
      return
    }

    const nameLog = `[⚽️'${name}'️]`
    const priceLog = `[💰'${price}'][📇'${prevPrices}']`
    const ratingLog = `[💯'${rating}']`

    const qualityRarity = getQualityRarityLog(quality, rarity)
    const sharedLog = `${ratingLog}:${qualityRarity}:`
    const {
      log: diffLog,
      priceDiffToCheapestByQualityRarity,
      priceDiffToCheapestByRating,
      cheapestQRLog,
      cheapestRATLog,
    } = getPriceDiff(priceEntry, rating, quality, rarity)
    if (onlyDiff && !diffLog) {
      return
    }

    let logEntry = ''
    if (onlyDiff) {
      logEntry = `\n${diffLog}${nameLog}\n`
    } else {
      logEntry = `\n[${index}][🕖 ${timestamp} 🕝]:${trabeability}\n${nameLog}\n${priceLog}${
        cheapestQRLog || ''
      }${cheapestRATLog || ''}${sharedLog}\n`
    }

    logEntries.push({
      DQR: priceDiffToCheapestByQualityRarity,
      DRT: priceDiffToCheapestByRating,
      logEntry,
    })

    const displayPossiblyExtinct = false
    if (displayPossiblyExtinct) {
      getPossiblyExtinctLogEntries(priceEntry)
    }

    if (shouldLogToStdOut) {
      console.log(logEntry)
      possiblyExtinctOnMarketLogEntry &&
        console.warn(possiblyExtinctOnMarketLogEntry)
    }
  })

  const transformedLogEntries = transformLogEntries(logEntries)

  transformedLogEntries.unshift({
    logEntry: `\n\n'DQR'(QualityRarityPriceDiff)\n\n|\n\n'DRT'(CheapestRatingPriceDiff)\n\n\n`,
  })
  transformedLogEntries.unshift({
    logEntry: `\n\n[🎼  PRICES REPORT]: Report generated at: ${reportTimestamp}\n\n`,
  })

  // return entries.join('\n')
  return transformedLogEntries
    .map(({ logEntry }) => {
      return logEntry
    })
    .join('\n')
}

export default makeLogEntries
