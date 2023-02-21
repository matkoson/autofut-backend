import Scrapper, { shallowClusterConfig } from '../scrapper/index.js'
import { getEstimatedTimeToCompletion } from '../utils/getEstimatedTimeToCompletion.js'
import { validateFutbinSearchResultsRowStats } from '../utils/validate/validateFutbinSearchResultsRowStats.js'
import { SearchResultsRowStats } from '../scrapper/Futbin/types.js'
import { getDuration } from '../utils/index.js'
import { ClubPlayer, ClubSummary } from '../types/index.js'
import Logger from '../logger/index.js'

import prepareReport from './prepareReport.js'
import findPlayers from './findPlayers.js'
import { handleClubSummary } from './handleClubSummary.js'

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
  playerList: ClubPlayer[] = []
  tradeableList: ClubPlayer[] = []
  untradeableList: ClubPlayer[] = []
  finalPlayerListToProcess: ClubPlayer[] = []
  /* Error lists */
  unknownPlayerIds: string[] = []
  futbinStatsNotUpdated: [string, string][] = []

  /* Processing data */
  processedCount = 0

  constructor(rawClubSummary: string) {
    this.clubSummary = handleClubSummary(rawClubSummary)
    logInfo(`[👬 NUM OF PLAYERS]: ${this.clubSummary.list.length}`)
  }

  private initScrapper = async () => {
    logInfo('[🏴‍ SCRAPPER] Initializing...')
    this.scrapper = await new Scrapper()
    await this.scrapper.init()
  }

  private clubUpdater = () => {
    return {
      getTotals: () => {
        return {
          untradeableCount: this.untradeableList.length,
          tradeableCount: this.tradeableList.length,
          playerCount: this.playerList.length,
          playerList: this.playerList,
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

        this.clubPlayers[id] = clubPlayer
        this.playerList.push(clubPlayer)
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

    console.log('[👯‍ LIST TO PROCESS]: ', this.finalPlayerListToProcess.length)
    const handleScrapperResponse = (
      id: string,
      futbinStats: SearchResultsRowStats
    ) => {
      this.updateCount()
      this.updateClubPlayerFutbinStats(id, futbinStats)
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
        playerCount: this.playerList.length,
      },
      playerList: this.playerList,
      tradeableList: this.tradeableList,
      untradeableList: this.untradeableList,
      futbinPriceNotUpdated: this.futbinStatsNotUpdated,
      unknownIds: this.unknownPlayerIds,
    }
  }

  private updateClubPlayerFutbinStats = (
    id: string,
    update: SearchResultsRowStats
  ) => {
    try {
      validateFutbinSearchResultsRowStats(update)
      const clubPlayer = this.clubPlayers[id]
      clubPlayer.futbin = update
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
    this.finalPlayerListToProcess = playerList.slice(0, 10)
    /* ##### SLICE HERE IF NECESSARY, TO NOT FUCK UP ETA  ##### */

    const futbinSearchResultsStats = await this.scrapFutbinPlayers()

    const duration = getDuration(startTime, performance.now())

    const clubReport = prepareReport(futbinSearchResultsStats, duration)

    return clubReport
  }
}

export default Club
