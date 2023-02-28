// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
import * as fs from 'fs'

import puppeteer, { Browser, Page, PuppeteerLaunchOptions } from 'puppeteer'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker'
import AnonymizeUa from 'puppeteer-extra-plugin-anonymize-ua'
import Recaptcha from 'puppeteer-extra-plugin-recaptcha'
// eslint-disable-next-line @typescript-eslint/no-var-requires,import/order
import { Cluster } from 'puppeteer-cluster'

import { PuppeteerExtra } from 'puppeteer-extra'

import { getTimestamp } from '../utils/index.js'
import { ClubPlayer } from '../types/index.js'
import Logger from '../logger/index.js'
import { validateString } from '../utils/validate/index.js'

import FutbinScrapper from './Futbin/index.js'
import { defaultFutbinStatsData } from './Futbin/default.js'
import { FutbinPlayer } from './Futbin/types.js'

const DEBUG = false

const TAG = '[🏴‍☠️ SCRAPPER  🏴‍☠️]:'
const logger = new Logger(TAG)

type FutbinTaskResponseHandler = (
  id: string,
  playerName: string,
  rating: string,
  futbinPlayer: FutbinPlayer
) => void

type TaskFunction<ExpectedTaskOutput, Data> = ({
  page,
  data,
}: {
  data: Data
  page: Page
}) => Promise<ExpectedTaskOutput>

type TaskConfig<ExpectedTaskOutput, TaskData> = {
  taskName: string
  CLUSTER_TASK: TaskFunction<ExpectedTaskOutput, TaskData>
  data: { url: string } & TaskData
}

type FutbinSearchPlayerScreenStatsTask = {
  rating: string
  id: string
  playerName: string
  url: string
}

const BROWSER_WIDTH = 800
const BROWSER_HEIGHT = 800

export const shallowClusterConfig = {
  sameDomainDelay: 4000,
  concurrency: Cluster.CONCURRENCY_CONTEXT,
  maxConcurrency: 10,
  workerCreationDelay: 1000,
  puppeteerOptions: {
    devtools: false,
    headless: true,
  },
}
const puppeteerExtra = new PuppeteerExtra(puppeteer)

const clusterConfig = {
  ...shallowClusterConfig,
  puppeteer: puppeteerExtra,
  puppeteerOptions: {
    ...shallowClusterConfig.puppeteerOptions,
  },
}

type MyCluster = any
// type MyCluster = Cluster & {
//   task: <ExpectedTaskOutput, TaskData>(
//     config: TaskConfig<ExpectedTaskOutput, TaskData>
//   ) => Promise<ExpectedTaskOutput>
// }

export default class Scrapper {
  cluster: MyCluster | null = null

  shouldRunTestSuite = false

  // eslint-disable-next-line no-use-before-define
  static Instance: Scrapper
  browser: Browser | null = null
  puppeteer: Browser | null = null
  futbin: FutbinScrapper | null = null

  constructor() {
    if (Scrapper.Instance) {
      return Scrapper.Instance
    }

    Scrapper.Instance = this as Scrapper
  }

  static validUserAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.104 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_3_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.705.70 Safari/537.36 Edg/88.0.705.70',
  ]

  private getDebugConfig = (debug: boolean) => {
    return debug
      ? {
          devtools: true,
          // Without opening a browser window
          headless: false,
        }
      : {
          devtools: false,
          // Without opening a browser window
          headless: true,
        }
  }

  private saveScreenshot = async (path: string, page: Page) => {
    try {
      await page.screenshot({
        path: `${path}`,
        fullPage: true,
      })
    } catch (err) {
      logger.logError(
        `[🤬 ERROR REPORT]:`,
        err as Error,
        `Error while saving screenshot!`
      )
    }
  }

  private saveHtml = async (path: string, page: Page) => {
    const html = await page.content()

    fs.writeFileSync(path, html.toString())
  }

  private saveTextStructure = (path: string, textStructure: string) => {
    fs.writeFileSync(path, JSON.stringify(textStructure, null, 2))
  }

  private generateErrorReport = async (
    playerName: string,
    rating: string,
    page: Page,
    textStructure?: string | null
  ) => {
    try {
      logger.logInfo(
        `[🤬 ERROR REPORT]:`,
        `Generating error report for player: ${playerName} - rating: ${rating}`
      )
      const dirPath = `./src/data/err/futbinPrice`
      // First, check if dir exists, if not, create it
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true })
      }

      const files = fs.readdirSync(dirPath)

      const matchingDirs = files.filter((file) => {
        return file.includes(playerName) && file.includes(rating)
      })

      if (matchingDirs.length > 0) {
        const dirToRemove = matchingDirs[0]
        fs.rmSync(`${dirPath}/${dirToRemove}`, { recursive: true })
      }

      const playerDirPath = `${dirPath}/(${playerName})(${rating})[${getTimestamp()}]`

      if (!fs.existsSync(playerDirPath)) {
        fs.mkdirSync(playerDirPath, { recursive: true })
      }

      const timestamp = getTimestamp()
      const path = `${playerDirPath}/${timestamp}`

      await this.saveScreenshot(`${path}.png`, page)
      await this.saveHtml(`${path}.html`, page)

      if (textStructure) {
        this.saveTextStructure(`${path}-text_structure.json`, textStructure)
      }
    } catch (error) {
      logger.logError(`[🤬 ERROR REPORT  🤬]:`, error as Error)
    }
  }

  private setUpPage = async () => {
    // const { validUserAgents } = Scrapper
    if (!this.browser) {
      throw new Error('Browser is not initialized!')
    }
    const page: Page = await this.browser.newPage()
    await page.setViewport({ width: BROWSER_WIDTH, height: BROWSER_HEIGHT })
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'
    )

    if (this.shouldRunTestSuite) {
      const timestamp = getTimestamp()
      const screenshotDir = './src/puppeteer/screenshots'

      this.shouldRunTestSuite = false
      logger.logInfo(TAG, `Testing adblocker plugin...`)
      await page.goto('https://www.vanityfair.com')
      await page.waitForTimeout(1000)
      await this.saveScreenshot(
        `${screenshotDir}/ADBLOCK_TEST_${timestamp}.png`,
        page
      )

      logger.logInfo(TAG, `Testing the stealth plugin...`)
      await page.goto('https://bot.sannysoft.com')
      await page.waitForTimeout(5000)
      await this.saveScreenshot(
        `${screenshotDir}/STEALTH_TEST_${timestamp}.png`,
        page
      )

      logger.logInfo(TAG, `Page setup finished!`)
    }

    return page
  }

  private preparePage = async (page: Page) => {
    await page.setViewport({ width: BROWSER_WIDTH, height: BROWSER_HEIGHT })
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'
    )
  }

  private scrapFutbinPlayerTask = async ({
    page,
    data,
  }: {
    page: Page
    data: FutbinSearchPlayerScreenStatsTask
  }): Promise<FutbinPlayer> => {
    const { playerName, rating, url } = data
    await this.preparePage(page)

    if (!this.cluster) {
      throw new Error('Cluster is not initialized!')
    }

    let futbinPlayer = defaultFutbinStatsData
    try {
      this.futbin = new FutbinScrapper(playerName, rating, page, url)

      futbinPlayer = await this.futbin.getPlayer()

      /* Validate essential values. */
      validateString(playerName, rating, futbinPlayer.prevPrices, 'prevPrices')
      validateString(playerName, rating, futbinPlayer.PACE, 'pace')
      validateString(playerName, rating, futbinPlayer.SHOOTING, 'shooting')
      validateString(playerName, rating, futbinPlayer.PASSING, 'passing')
      validateString(playerName, rating, futbinPlayer.DRIBBLING, 'dribbling')
      validateString(playerName, rating, futbinPlayer.DEFENDING, 'defending')
      validateString(
        playerName,
        rating,
        futbinPlayer.PHYSICALITY,
        'physicality'
      )
      validateString(
        playerName,
        rating,
        futbinPlayer.playerFutbinUrl,
        'playerFutbinUrl'
      )
      validateString(playerName, rating, futbinPlayer.firstName, 'firstName')
      validateString(playerName, rating, futbinPlayer.lastName, 'lastName')

      logger.logSuccess(
        `[🟢 100% SUCCESS 🟢]:`,
        `for player: \n(⚽️ '${playerName.toUpperCase()}' ⚽️)(💯 '${rating}' 💯)!\n`
      )
      logger.logSuccess(
        `[🟢 100% SUCCESS 🟢]:`,
        `Stats: '${JSON.stringify(futbinPlayer, null, 2)}'!`
      )
      if (futbinPlayer.price === '0') {
        logger.logInfo(
          `[🟢 PRICE '0' 🔵]:`,
          ` Price is eq to '0'! Might be valid, might be not. Reporting!`
        )

        const textStructure = this.futbin?.debugFutbinStats()
        await this.generateErrorReport(playerName, rating, page, textStructure)
      }
      return futbinPlayer
    } catch (err) {
      logger.logError(TAG, err as Error)
      logger.logWarn(
        `[🟡 NOT 100％ 🟡]:`,
        ` player: ('${playerName}')('${rating}')! Reporting!`
      )
      logger.logWarn(
        `[🟡 NOT 100％ 🟡]:`,
        `Stats '${JSON.stringify(futbinPlayer, null, 2)}'!`
      )
      const textStructure = this.futbin?.debugFutbinStats()

      await this.generateErrorReport(playerName, rating, page, textStructure)
      return futbinPlayer
    }
  }

  private setUpBrowser = async (browserOptions: PuppeteerLaunchOptions) => {
    puppeteerExtra.use(StealthPlugin())
    puppeteerExtra.use(AdblockerPlugin.default({ blockTrackers: true }))
    if (typeof AnonymizeUa === 'function') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      puppeteerExtra.use(AnonymizeUa())
    } else if (typeof AnonymizeUa?.default === 'function') {
      puppeteerExtra.use(AnonymizeUa.default())
    } else {
      console.warn('[🎎 PUPPETEER] Could not load plugin: "anonymize-ua"')
    }
    puppeteerExtra.use(Recaptcha.default())

    const browser: Browser = await puppeteerExtra.launch({
      ...browserOptions,
    })
    const context = browser.defaultBrowserContext()
    // context.overridePermissions('https://www.facebook.com/', ['clipboard-read'])

    this.browser = browser
  }

  waitForClusterToFinish = async () => {
    logger.logInfo(TAG, 'Waiting for cluster to be idle...')
    if (!this.cluster) {
      throw new Error('Cluster is not initialized!')
    }

    await this.cluster.idle()
    await this.cluster.close()

    logger.logInfo(TAG, 'Cluster closed!')

    this.browser?.close()
    logger.logInfo(TAG, 'Browser closed!')
  }

  private queueClusterTask = <ExpectedOutput, TaskData>(
    taskConfig: TaskConfig<ExpectedOutput, TaskData>
  ) => {
    if (!this.cluster) {
      throw new Error('Cluster is not initialized!')
    }
    const { CLUSTER_TASK, data, taskName } = taskConfig

    logger.logDebug(`[🍒 QUEUE 🍒]:`, `[CLUSTER_TASK]: ${taskName} queued!`)

    const clusterTask = this.cluster.execute(data, CLUSTER_TASK)

    return clusterTask
  }

  private setUpCluster = async () => {
    // Create a cluster with 2 workers
    this.cluster = await Cluster.launch(clusterConfig)
    logger.logInfo(TAG, 'Cluster is up and running!')
  }

  private scrapFutbinPlayer = async (
    id: string,
    playerName: string,
    rating: string,
    responseHandler: FutbinTaskResponseHandler
  ) => {
    const url = `https://www.futbin.com/players?page=1&search=%27${playerName}%27`
    const taskConfig = {
      data: {
        id,
        playerName,
        rating,
        url,
      },
      taskName: `scrapFutbinTask for ${playerName}`,
      CLUSTER_TASK: this.scrapFutbinPlayerTask,
    }

    const futbinPlayer: FutbinPlayer = await this.queueClusterTask<
      unknown,
      FutbinSearchPlayerScreenStatsTask
    >(taskConfig)

    if (!futbinPlayer) {
      throw new Error(
        `Futbin search results row stats for ${playerName} are not defined!`
      )
    }

    responseHandler(id, playerName, rating, futbinPlayer)
  }

  scrapFutbinPlayerList = async (
    playerList: ClubPlayer[],
    responseHandler: FutbinTaskResponseHandler
  ) => {
    for (let index = 0; index < playerList.length; index++) {
      const clubPlayer = playerList[index]
      const { id, identity } = clubPlayer
      const { firstName, lastName, rating } = identity

      const fullPlayerName = `${firstName} ${lastName}`
      // eslint-disable-next-line no-await-in-loop
      await this.scrapFutbinPlayer(id, fullPlayerName, rating, responseHandler)
    }

    await this.waitForClusterToFinish()
  }

  init = async () => {
    logger.logInfo(TAG, 'Initializing scrapper...')
    // E.g. 100[ms]
    const slowMo = 500

    const { devtools, headless } = this.getDebugConfig(DEBUG)
    try {
      await this.setUpBrowser({ headless, devtools, slowMo })
      await this.setUpPage()
      await this.setUpCluster()
      logger.logSuccess(TAG, '\n\n✅ Scrapper initialized! ✅\n\n')
      return true
    } catch (err) {
      console.error(err)
      throw new Error(
        `Error while initializing scrapper: ${(err as Error).message}!`
      )
    }
  }
}
