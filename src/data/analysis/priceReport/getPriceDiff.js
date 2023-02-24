import getCheapestByRating from './getCheapestByRating.js'
import getCheapestByQualityRarity from './getCheapestByQualityRarity.js'

const formatPrice = (price) => {
  const formattedNum = (price / 1000).toFixed(3).replace('.', ',')
  const formattedPrice = formattedNum.replace(',', '.')
  return formattedPrice
}

const getPriceDiff = (priceInfo) => {
  const { quality, rarity, rating, price, name } = priceInfo
  const { log: cheapestQRLog, value: valueQR } = getCheapestByQualityRarity(
    quality,
    rarity
  )
  const { log: cheapestRATLog, value: valueRAT } = getCheapestByRating(
    rating,
    name
  )


  if (!price) {
    console.log('no price')
  }
  if (isNaN(valueQR) || isNaN(valueRAT)) {
    return '[QR:|Δ(N/A)|:RAT|𝜟(N/A)|]:'
  }

  const regex = /\d+/g
  const calcPrice = Number(price.match(regex).join(''))
  const diffToCheapestQRLog = `|:QR|𝜟💰${formatPrice(calcPrice - valueQR)}€💰|]`
  const diffToCheapestRATLog =
    valueRAT === null
      ? `${cheapestRATLog}:`
      : `[RAT:|Δ💰${formatPrice(calcPrice - valueRAT)}|]:`

  const log = `${diffToCheapestQRLog}${diffToCheapestRATLog}`

  if (name === 'Karim Bellarabi') {
    debugger
  }

  return {
    cheapestQRLog,
    cheapestRATLog,
    log,
    priceDiffToCheapestByQualityRarity: diffToCheapestQRLog,
    priceDiffToCheapestByRating: diffToCheapestRATLog,
  }
}

export default getPriceDiff
