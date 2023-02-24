import { getEstimatedTimeToCompletion } from '../utils/getEstimatedTimeToCompletion.js'
import { validateFutbinStats } from '../utils/validate/validateFutbinStats.js'
import { getDuration } from '../utils/index.js'
import { ClubPlayer, ClubSummary } from '../types/index.js'
import Logger from '../logger/index.js'
import Scrapper, { shallowClusterConfig } from '../Scrapper/index.js'
import { FutbinStats } from '../Scrapper/FutbinParser/types.js'
import { validateString } from '../utils/validate/index.js'
import { saveReport } from '../data/clubReport/utils/saveData.js'

import prepareReport from './prepareReport.js'
import findPlayers from './findPlayers.js'
import { handleFutWebAppClubSummary } from './handleFutWebAppClubSummary.js'
import saveFutbinPrice from './saveFutbinPrice.js'

const { logInfo, logWarn } = Logger

class Club {
  scrapper: Scrapper | null = null
  clubSummary: ClubSummary
  /* Players */
  /* Hash-maps */
  clubPlayers: { [key: string]: ClubPlayer } = {}
  tradeableClubPlayers: { [key: string]: ClubPlayer } = {}
  untradeableClubPlayers: { [key: string]: ClubPlayer } = {}
  /* Lists */
  clubPlayersMap: { [key: string]: ClubPlayer } = {}
  clubPlayerList: ClubPlayer[] = []
  tradeableList: ClubPlayer[] = []
  untradeableList: ClubPlayer[] = []
  finalPlayerListToProcess: ClubPlayer[] = []
  /* Error lists */
  unknownPlayerIds: string[] = []
  futbinStatsNotUpdated: [string, string][] = []

  /* Processing data */
  processedCount = 0

  constructor(futWebAppClubSummary: string) {
    this.clubSummary = handleFutWebAppClubSummary(futWebAppClubSummary, true)
    logInfo(`[👬 NUM OF PLAYERS]: ${this.clubSummary.list.length}`)
  }

  private initScrapper = async () => {
    logInfo('[🏴‍ SCRAPPER] Initializing...')
    this.scrapper = new Scrapper()
    await this.scrapper.init()
  }

  private clubUpdater = () => {
    return {
      getTotals: () => {
        return {
          untradeableCount: this.untradeableList.length,
          tradeableCount: this.tradeableList.length,
          playerCount: this.clubPlayerList.length,
          playerList: this.clubPlayerList,
        }
      },
      updateClubPlayer: (
        id: string,
        isUntradeable: boolean | null,
        clubPlayer: ClubPlayer | null
      ) => {
        if (!clubPlayer) {
          logWarn(`[🤔 PLAYER NOT FOUND]: id: player with '${id}' not found.`)
          this.unknownPlayerIds.push(id)
          return
        }

        this.clubPlayersMap[id] = clubPlayer
        this.clubPlayerList.push(clubPlayer)
        if (isUntradeable) {
          this.untradeableClubPlayers[id] = clubPlayer
          this.untradeableList.push(clubPlayer)
        } else {
          this.tradeableClubPlayers[id] = clubPlayer
          this.tradeableList.push(clubPlayer)
        }
      },
    }
  }

  private scrapFutbinPlayers = async () => {
    if (!this.scrapper) {
      throw new Error('Scrapper not initialized')
    }

    Logger.logWithTimestamp(
      'info',
      '[👯‍ LIST TO PROCESS 👯‍]:',
      `NUMBER OF CLUB PLAYERS: ${this.finalPlayerListToProcess.length}`
    )
    const handleScrapperResponse = (
      id: string,
      playerName: string,
      rating: string,
      futbinStats: FutbinStats
    ) => {
      this.updateCount()
      this.updateClubPlayerFutbinStats(id, playerName, rating, futbinStats)
    }

    if (!this.finalPlayerListToProcess.length) {
      throw new Error('"finalPlayerListToProcess" not set!')
    }

    await this.scrapper.scrapFutbinPlayers(
      this.finalPlayerListToProcess,
      handleScrapperResponse
    )

    return {
      stats: {
        untradeableCount: this.untradeableList.length,
        tradeableCount: this.tradeableList.length,
        playerCount: this.clubPlayerList.length,
      },
      clubPlayersMap: this.clubPlayersMap,
      clubPlayersList: Object.values(this.clubPlayersMap),
      error: {
        futbinPriceNotUpdated: this.futbinStatsNotUpdated,
        unknownIds: this.unknownPlayerIds,
      },
    }
  }

  private updateClubPlayerFutbinStats = (
    id: string,
    playerName: string,
    rating: string,
    update: FutbinStats
  ) => {
    try {
      const clubPlayer = this.clubPlayersMap[id]
      clubPlayer.futbin = update
      const { isUntradeable } = clubPlayer
      const { price, quality, rarity } = clubPlayer.futbin
      validateString(price, 'clubPlayer.futbin.price')

      Logger.logWithTimestamp(
        'success',
        `[🎯 PRICE FOUND 🎯]:`,
        `[💰 '${clubPlayer.futbin.price}' FUT COINS 💰], player: (⚽️ '${playerName}' ⚽️), rating: (💯 '${rating}' 💯)`
      )

      saveFutbinPrice(
        playerName,
        rating,
        String(isUntradeable),
        quality,
        rarity,
        price
      )

      validateFutbinStats(update)
    } catch (error) {
      this.futbinStatsNotUpdated.push([id, (error as Error).message])
    }
  }

  private updateCount = () => {
    const totalClubPlayersToProcess = this.finalPlayerListToProcess.length
    this.processedCount += 1
    const progressPercentage =
      (this.processedCount / totalClubPlayersToProcess) * 100

    const estimatedTimeToCompletion = getEstimatedTimeToCompletion(
      shallowClusterConfig.sameDomainDelay,
      totalClubPlayersToProcess
    )

    const averageTimePerPlayer =
      estimatedTimeToCompletion / totalClubPlayersToProcess

    const remainingTime =
      (totalClubPlayersToProcess - this.processedCount) * averageTimePerPlayer

    const etaMinutes = Math.floor(remainingTime / 1000 / 60)
    const etaSeconds = Math.floor((remainingTime / 1000) % 60)

    logInfo(
      `[⚡︎ PROGRESS]: [${
        this.processedCount
      }/${totalClubPlayersToProcess}] - ${progressPercentage.toFixed(
        2
      )}% - ⏳ETA: ${etaMinutes} minutes ${etaSeconds} seconds`
    )
  }

  public makeClubReport = async (startTime: number) => {
    await this.initScrapper()

    if (!this.scrapper) {
      throw new Error('Scrapper not initialized')
    }

    if (!this.clubSummary) {
      throw new Error('Club summary not initialized')
    }

    const { updateClubPlayer, getTotals } = this.clubUpdater()

    findPlayers(this.clubSummary, updateClubPlayer)

    const { playerList } = getTotals()

    /* ##### SLICE HERE IF NECESSARY, TO NOT FUCK UP ETA  ##### */
    // logWarn(`[🟡 WARN] Number of players sliced for development purposes!`)
    logWarn(`[🟡 WARN]: WORKING ONLY ON TRADEABLE LIST!`)
    this.finalPlayerListToProcess = this.tradeableList
    /* ##### SLICE HERE IF NECESSARY, TO NOT FUCK UP ETA  ##### */

    const futbinSearchResultsStats = await this.scrapFutbinPlayers()

    const duration = getDuration(startTime, performance.now())
    logInfo(`[⏱  DURATION]: 'makeClubReport' took: ${duration}`)

    const clubReport = prepareReport(futbinSearchResultsStats, duration)

    saveReport(clubReport)

    return clubReport
  }
}

export default Club
