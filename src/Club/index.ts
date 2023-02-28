import path from 'path'
import fs from 'fs'

import { getEstimatedTimeToCompletion } from '../utils/getEstimatedTimeToCompletion.js'
import { validateFutbinStats } from '../utils/validate/validateFutbinStats.js'
import { getDuration } from '../utils/index.js'
import { ClubPlayer, ClubSummary } from '../types/index.js'
import Logger from '../logger/index.js'
import Scrapper, { shallowClusterConfig } from '../Scrapper/index.js'
import { FutbinPlayer } from '../Scrapper/Futbin/types.js'
import { validateString } from '../utils/validate/index.js'
import { saveReport } from '../data/clubReport/utils/saveData.js'

import prepareReport from './prepareReport.js'
import findPlayers from './findPlayers.js'
import { handleFutWebAppClubSummary } from './handleFutWebAppClubSummary.js'
import saveFutbinPrice from './saveFutbinPrice.js'

const TAG = '[♣  CLUB  ♣]:'
const logger = new Logger(TAG)

class Club {
  scrapper: Scrapper | null = null
  clubSummary: ClubSummary
  /* Players */
  /* Hash-maps */
  tradeableClubPlayers: { [key: string]: ClubPlayer } = {}
  untradeableClubPlayers: { [key: string]: ClubPlayer } = {}
  /* Lists */
  clubPlayersMap: { [key: string]: ClubPlayer } = {}
  clubPlayerList: ClubPlayer[] = []
  tradeableList: ClubPlayer[] = []
  untradeableList: ClubPlayer[] = []
  playerListToProcess: ClubPlayer[] = []
  /* Error lists */
  unknownPlayerIds: string[] = []
  futbinStatsNotUpdated: [string, string][] = []

  /* Processing data */
  processedCount = 0

  constructor(futWebAppClubSummary: string) {
    this.clubSummary = handleFutWebAppClubSummary(futWebAppClubSummary, true)
    logger.logInfo(`[👬 NUM OF PLAYERS]:`, `${this.clubSummary.list.length}`)
  }

  private initScrapper = async () => {
    logger.logInfo(`[🏴‍☠️ SCRAPPER  🏴‍☠️]:`, `Initializing...`)
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
          logger.logWarn(
            `[🤔 PLAYER NOT FOUND]:`,
            `id: player with '${id}' not found.`
          )
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
  private backUpPrices = () => {
    const pricesDirPath = path.join(process.cwd(), 'src', 'data', 'price')
    const priceFiles = fs.readdirSync(pricesDirPath)

    const analysisPricesDirPath = path.join(
      process.cwd(),
      'src',
      'data',
      'analysis',
      'priceReport',
      'prices'
    )

    if (!fs.existsSync(analysisPricesDirPath)) {
      fs.mkdirSync(analysisPricesDirPath)
    } else {
      const files = fs.readdirSync(analysisPricesDirPath)
      files.forEach((file) => {
        fs.rmSync(path.join(analysisPricesDirPath, file), {
          recursive: true,
        })
      })
    }

    priceFiles.forEach((file) => {
      fs.copyFileSync(
        path.join(pricesDirPath, file),
        path.join(analysisPricesDirPath, file)
      )
    })
  }

  private removeOldPrices = () => {
    const pricesDirPath = path.join(process.cwd(), 'src', 'data', 'price')
    const files = fs.readdirSync(pricesDirPath)
    try {
      logger.logInfo(
        `[🗑️ REMOVING OLD PRICE 💰]:[🔐 BACKING UP 🔐]:`,
        `Backing up prices before updating...`
      )
      this.backUpPrices()
      files.forEach((file) => {
        logger.logDebug(
          `[🗑️ REMOVING OLD PRICE 💰]:`,
          `Removing old price file: ${file}`
        )

        fs.rmSync(path.join(pricesDirPath, file))
      })
      logger.logSuccess(
        `[🗑️ REMOVING OLD PRICE 💰]:`,
        '\n\n✅ Removed old price files! ✅\n\n'
      )
    } catch (error) {
      logger.logError(
        `[🤯 ERROR]:`,
        error as Error,
        `Error while removing old prices!`
      )
    }
  }

  private scrapFutbin = async () => {
    if (!this.scrapper) {
      throw new Error('Scrapper not initialized')
    }

    logger.logInfo(
      '[👯‍ LIST TO PROCESS 👯‍]:',
      `\n\n NUMBER OF CLUB PLAYERS: ${this.playerListToProcess.length} \n\n`
    )
    const handleFutbinPlayer = (
      id: string,
      playerName: string,
      rating: string,
      futbinPlayer: FutbinPlayer
    ) => {
      this.updateCount()
      this.updateClubPlayer(id, playerName, rating, futbinPlayer)
    }

    if (!this.playerListToProcess.length) {
      throw new Error('"finalPlayerListToProcess" not set!')
    }

    this.removeOldPrices()

    await this.scrapper.scrapFutbinPlayerList(
      this.playerListToProcess,
      handleFutbinPlayer
    )

    logger.logInfo(
      `[🗑️ REMOVING OLD PRICE 💰]:[🔐 BACKING UP 🔐]:`,
      `Backing up prices after success...`
    )
    this.backUpPrices()

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

  private updateClubPlayer = (
    id: string,
    playerName: string,
    rating: string,
    futbinPlayer: FutbinPlayer
  ) => {
    try {
      const clubPlayer = this.clubPlayersMap[id]
      clubPlayer.futbin = futbinPlayer
      const { isUntradeable } = clubPlayer
      const { price, quality, prevPrices, rarity } = clubPlayer.futbin
      validateString(playerName, rating, price, 'clubPlayer.futbin.price')
      validateString(
        playerName,
        rating,
        prevPrices,
        'clubPlayer.futbin.prevPrices'
      )

      logger.logSuccess(
        `[🎯 PRICE FOUND 🎯]:`,
        `[💰 '${clubPlayer.futbin.price}' FUT COINS 💰], player: (⚽️ '${playerName}' ⚽️), rating: (💯 '${rating}' 💯)`
      )

      saveFutbinPrice(
        playerName,
        rating,
        String(isUntradeable),
        quality,
        rarity,
        price,
        prevPrices
      )

      validateFutbinStats(playerName, rating, futbinPlayer)
    } catch (error) {
      this.futbinStatsNotUpdated.push([id, (error as Error).message])
    }
  }

  private updateCount = () => {
    const totalClubPlayersToProcess = this.playerListToProcess.length
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

    logger.logInfo(
      TAG,
      `[⚡️︎ PROGRESS  ⚡️]:[${
        this.processedCount
      }/${totalClubPlayersToProcess}] - ${progressPercentage.toFixed(
        2
      )}% - ⏳ETA: ${etaMinutes} minutes ${etaSeconds} seconds`,
      120
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

    const { updateClubPlayer } = this.clubUpdater()

    logger.logInfo(`[🔎 SEARCHING FOR PLAYERS]:`, `Searching for players...`)
    findPlayers(this.clubSummary, updateClubPlayer)

    /* ##### SLICE HERE IF NECESSARY, TO NOT FUCK UP ETA  ##### */
    // logger.logWarn(`[🟡 WARN] Number of players sliced for development purposes!`)
    logger.logWarn(TAG, `WORKING ONLY ON TRADEABLE LIST!`)
    this.playerListToProcess = this.tradeableList
    /* ##### SLICE HERE IF NECESSARY, TO NOT FUCK UP ETA  ##### */

    const futbinInfo = await this.scrapFutbin()

    const duration = getDuration(startTime, performance.now())
    logger.logInfo(`[⏱  DURATION]:`, `'makeClubReport' took: ${duration}`)

    const clubReport = prepareReport(futbinInfo, duration)

    saveReport(clubReport)

    return clubReport
  }
}

export default Club
