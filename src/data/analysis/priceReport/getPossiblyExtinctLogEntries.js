const getPossiblyExtinctLogEntries = (priceEntry) => {
  const { price, isUntradeable, timestamp, rating, name, index } = priceEntry
  const calcIsPossiblyExtinctOnMarket = () => {
    return price === '0 €' && Boolean(isUntradeable)
  }

  let possiblyExtinctOnMarketLogEntry = ''
  if (calcIsPossiblyExtinctOnMarket()) {
    possiblyExtinctOnMarketLogEntry = `\n[🔥  POSSIBLY EXTINCT ON MARKET  🔥]:\n> ${index}: [🕖 ${timestamp} 🕝]: [⚽️ PLAYER ⚽️]:\n> [${getIsUntradeableLog(
      isUntradeable
    )}]: [💰 ${price} 💰]\n - ${name},[💯 ${rating} 💯]\n`
    logEntries.push({ logEntry: possiblyExtinctOnMarketLogEntry })
  }
}

export default getPossiblyExtinctLogEntries
