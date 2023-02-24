import * as Puppeteer from 'puppeteer'

import Logger from '../../logger/index.js'

const getRarityText = (attributeType: string | null, playerName: string) => {
  /* '0' is 'common', '1' is 'rare', everything above is 'special' */
  if (!attributeType) {
    console.error(
      `[✂️ FIND_PLAYER_QUALITY_AND_RARITY  ✂️]:\n 🔴🔴🔴 could not extract text from rarity attribute for player: [⚽️ ${playerName} ⚽️]`
    )

    return null
  }

  switch (attributeType) {
    case '0':
      return 'common'
    case '1':
      return 'rare'
    default: {
      const type = Number(attributeType)
      if (isNaN(type) || !Boolean(type > 1)) {
        throw new Error('Invalid rarity attribute')
      }

      return 'special'
    }
  }
}

const findPlayerQualityAndRarity = async (
  playerName: string,
  page: Puppeteer.Page
): Promise<{ quality: string | null; rarity: string | null }> => {
  const { quality, rarity, playerCard } = await page.evaluate(() => {
    const playerCard = document.querySelector('#Player-card')
    const qualityAttr = playerCard?.getAttribute('data-level') || null
    const rarityAttr = playerCard?.getAttribute('data-rare-type') || null

    return { quality: qualityAttr, rarity: rarityAttr, playerCard }
  })

  if (!quality || !rarity) {
    console.error(`[✂️ FIND_PLAYER_QUALITY_AND_RARITY  ✂️]:\n 🔴🔴🔴 failed!`)
    return { quality: null, rarity: null }
  }

  return { quality, rarity: getRarityText(rarity, playerName) }
}

export default findPlayerQualityAndRarity
