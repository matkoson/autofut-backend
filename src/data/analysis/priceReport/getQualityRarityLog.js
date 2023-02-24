const getQualityRarityLog = (quality, rarity) => {
  const combined = `${quality},${rarity}`
  switch (combined) {
    case 'bronze,common':
      return '[🥉🧦]'
    case 'bronze,rare':
      return '[🥉💎]'
    case 'silver,common':
      return '[🥈🧦]'
    case 'silver,rare':
      return '[🥈💎]'
    case 'gold,common':
      return '[🥇🧦]'
    case 'gold,rare':
      return '[🥇💎]'
    default:
      if (rarity === 'special') {
        return '[🦄 SPECIAL  🦄]'
      }
      return '[❓]'
  }
}

export default getQualityRarityLog
