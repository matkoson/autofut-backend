const getCheapestByQualityRarity = (quality, rarity) => {
  const cheapestMap = {
    'bronze,common': '300',
    'bronze,rare': '300',
    'silver,common': '350',
    'silver,rare': '350',
    'gold,common': '350',
    'gold,rare': '700',
  }

  const qualityRarity = `${quality},${rarity}`
  let log = '[❓]'

  switch (qualityRarity) {
    case 'bronze,common':
      log = `[🤑🥉🧦='${cheapestMap['bronze,common']}'€]:`
      break

    case 'bronze,rare':
      log = `[🤑🥉💎='${cheapestMap['bronze,rare']}'€]:`
      break

    case 'silver,common':
      log = `[🤑🥈🧦='${cheapestMap['silver,common']}'€]:`
      break

    case 'silver,rare':
      log = `[🤑🥈💎='${cheapestMap['silver,rare']}'€]:`
      break

    case 'gold,common':
      log = `[🤑🥇🧦='${cheapestMap['gold,rare']}'€]:`
      break

    case 'gold,rare':
      log = `[🤑🥇💎='${cheapestMap['gold,rare']}'€]:`
      break
    default:
      if (rarity === 'special') {
        log = '[spPrice]'
      }
  }

  return { log, value: Number(cheapestMap[qualityRarity]) }
}

export default getCheapestByQualityRarity
