import saveData from '../data/clubReport/utils/saveData.js'
import {
  ClubSummary,
  FutWebClubSummaryItem,
  UnknownClubPlayerList,
  UnknownClubPlayerMap,
} from '../types/index.js'
import Logger from '../logger/index.js'

interface HandleFutWebClubSummary {
  (futWebClubSummary: string, save?: boolean): ClubSummary
}
export const handleFutWebAppClubSummary: HandleFutWebClubSummary = (
  futWebClubSummary,
  save = false
) => {
  const map: UnknownClubPlayerMap = {}
  const list: UnknownClubPlayerList = []
  const clubSummaryJson = JSON.parse(futWebClubSummary)
  if (save) {
    /* TODO: find better solution! */
    /* Hack, I don't want it stringified more than once. */
    try {
      saveData({ type: 'futWebClubSummary', data: clubSummaryJson })
      Logger.logWithTimestamp(
        'info',
        `[💾 SAVE FUT WEB CLUB SUMMARY  🟢]:`,
        `\n`
      )
    } catch (error) {
      Logger.logWithTimestamp(
        'error',
        `[💾 SAVE FUT WEB CLUB SUMMARY  🔴]:`,
        `\n`
      )

      throw error
    }
  }
  /* 'itemData' is some redundant object property in which EA hides player info. */
  const clubSummaryItemData = clubSummaryJson.itemData
  if (!clubSummaryItemData) {
    throw new Error('No club summary item data found!')
  }

  clubSummaryItemData.forEach((itemData: FutWebClubSummaryItem) => {
    const clubPlayerDetails = itemData

    const id = String(clubPlayerDetails.assetId)
    const [gamesPlayed, goalsScored, yellowCards, redCards] =
      clubPlayerDetails.statsArray

    const isUntradeable = clubPlayerDetails.untradeable
    const isLoaned = clubPlayerDetails.loans > 0
    const performance = {
      assists: clubPlayerDetails.assists,
      injuryGames: clubPlayerDetails.injuryGames,
      gamesPlayed,
      goalsScored,
      yellowCards,
      redCards,
    }
    const inGameStats = {
      rating: clubPlayerDetails.rating,
      playStyle: clubPlayerDetails.playStyle,
      possiblePositions: clubPlayerDetails.possiblePositions,
      preferredPosition: clubPlayerDetails.preferredPosition,
      preferredFoot: clubPlayerDetails.preferredfoot,
      workRate: {
        attacking: clubPlayerDetails.attackingworkrate,
        defending: clubPlayerDetails.defendingworkrate,
      },
      weakFootAbilityType: clubPlayerDetails.weakfootabilitytypecode,
    }

    const detailedInfo = {
      itemType: clubPlayerDetails.itemType,
      contract: clubPlayerDetails.contract,
      cardSubTypeId: clubPlayerDetails.cardsubtypeid,
      formation: clubPlayerDetails.formation,
      itemState: clubPlayerDetails.itemState,
      leagueId: clubPlayerDetails.leagueId,
      loans: clubPlayerDetails.loans,
      loyaltyBonus: clubPlayerDetails.loyaltyBonus,
      nation: clubPlayerDetails.nation,
      rareFlag: clubPlayerDetails.rareflag,
      teamId: clubPlayerDetails.teamid,
    }

    const playerValue = isUntradeable
      ? {
          discardValue: null,
          lastSalePrice: null,
          marketDataMaxPrice: null,
          marketDataMinPrice: null,
        }
      : {
          discardValue: clubPlayerDetails.discardValue,
          lastSalePrice: clubPlayerDetails.lastSalePrice,
          marketDataMaxPrice: clubPlayerDetails.marketDataMaxPrice,
          marketDataMinPrice: clubPlayerDetails.marketDataMinPrice,
        }

    map[id] = {
      id,
      isUntradeable,
      isLoaned,
      performance,
      inGameStats,
      detailedInfo,
      playerValue,
    }

    list.push(map[id])
  })

  if (save) {
    try {
      saveData({ type: 'clubSummary', data: { map, list } })
      Logger.logWithTimestamp(
        'info',
        `[💾 SAVE PROCESSED CLUB SUMMARY  🟢]:`,
        `\n`
      )
    } catch (error) {
      Logger.logWithTimestamp(
        'error',
        `[💾 SAVE PROCESSED CLUB SUMMARY  🔴]:`,
        `\n`
      )

      throw error
    }
  }

  return { map, list }
}
