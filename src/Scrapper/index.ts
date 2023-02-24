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

import saveFutbinPrice from '../Club/saveFutbinPrice.js'
import { getTimestamp } from '../utils/index.js'
import { ClubPlayer } from '../types/index.js'
import Logger from '../logger/index.js'
import { validateFutbinStats } from '../utils/validate/validateFutbinStats.js'
import { validateString } from '../utils/validate/index.js'

import FutbinParser from './FutbinParser/index.js'
import { defaultFutbinStatsData } from './FutbinParser/default.js'
import { FutbinStats } from './FutbinParser/types.js'

const DEBUG = false

const { logInfo, logError, logSuccess } = Logger

// add stealth plugin and use defaults (all evasion techniques)
// eslint-disable-next-line @typescript-eslint/no-var-requires
// Add adblocker plugin to block all ads and trackers (saves bandwidth)
// eslint-disable-next-line @typescript-eslint/no-var-requires

// Anonymize user agent
// eslint-disable-next-line @typescript-eslint/no-var-requires
// eslint-disable-next-line @typescript-eslint/no-var-requires

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

export interface MetaData {
  href: string
  timestamp: number
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
  futbinScrapper: FutbinParser | null = null

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
    await page.screenshot({
      path: `${path}`,
      fullPage: true,
    })
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
      logError(
        `[🤬 ERROR REPORT]: Generating error report for player: '${playerName}'`
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
      logError(
        `[🤬 ERROR REPORT]: Error, while generating: ${
          (error as Error).message
        }`
      )
      console.error(error)
    }
  }

  private currentUserAgentIndex = 0
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
      logInfo(`Testing adblocker plugin...`)
      await page.goto('https://www.vanityfair.com')
      await page.waitForTimeout(1000)
      await this.saveScreenshot(
        `${screenshotDir}/ADBLOCK_TEST_${timestamp}.png`,
        page
      )

      logInfo(`Testing the stealth plugin...`)
      await page.goto('https://bot.sannysoft.com')
      await page.waitForTimeout(5000)
      await this.saveScreenshot(
        `${screenshotDir}/STEALTH_TEST_${timestamp}.png`,
        page
      )

      logInfo(`All done, check the screenshots. ✨`)
    }

    return page
  }

  private preparePage = async (page: Page) => {
    await page.setViewport({ width: BROWSER_WIDTH, height: BROWSER_HEIGHT })
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'
    )
  }

  private scrapFutbinStatsTask = async ({
    page,
    data,
  }: {
    page: Page
    data: FutbinSearchPlayerScreenStatsTask
  }): Promise<unknown> => {
    const { playerName, rating, url } = data
    await this.preparePage(page)

    if (!this.cluster) {
      throw new Error('Cluster is not initialized!')
    }

    let futbinStats = defaultFutbinStatsData
    try {
      this.futbinScrapper = new FutbinParser(playerName, rating, page, url)
      futbinStats = await this.futbinScrapper.extract()

      // validateFutbinStats(futbinStats)
      validateString(futbinStats.prevPrices, 'prevPrices')
      validateString(futbinStats.PACE, 'pace')
      validateString(futbinStats.SHOOTING, 'shooting')
      validateString(futbinStats.PASSING, 'passing')
      validateString(futbinStats.DRIBBLING, 'dribbling')
      validateString(futbinStats.DEFENDING, 'defending')
      validateString(futbinStats.PHYSICALITY, 'physicality')
      validateString(futbinStats.playerFutbinUrl, 'playerFutbinUrl')
      validateString(futbinStats.firstName, 'firstName')
      validateString(futbinStats.lastName, 'lastName')

      Logger.logWithTimestamp(
        `info`,
        `[🟢 100% SUCCESS 🟢]:`,
        `\nfor player: (⚽️ '${playerName.toUpperCase()}' ⚽️)(💯 '${rating}' 💯)!\n`
      )
      Logger.logWithTimestamp(
        'info',
        `[🟢 100% SUCCESS 🟢]:`,
        `Stats: '${JSON.stringify(futbinStats, null, 2)}'!`
      )
      if (futbinStats.price === '0') {
        Logger.logWithTimestamp(
          'info',
          `[🟢 PRICE '0' 🔵]:`,
          ` Price is eq to '0'! Might be valid, might be not. Reporting!`
        )

        const textStructure = this.futbinScrapper?.debugFutbinStats()
        await this.generateErrorReport(playerName, rating, page, textStructure)
      }
      return futbinStats
    } catch (err) {
      Logger.logWithTimestamp(
        'info',

        `[🟡 NOT 100％ 🟡]:`,
        ` player: ('${playerName}')('${rating}')! Reporting!`
      )
      Logger.logWithTimestamp(
        'info',
        `[🟡 NOT 100％ 🟡]:`,
        `Stats '${JSON.stringify(futbinStats, null, 2)}'!`
      )
      const textStructure = this.futbinScrapper?.debugFutbinStats()

      await this.generateErrorReport(playerName, rating, page, textStructure)
      return futbinStats
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
    logInfo('Waiting for cluster to be idle...')
    if (!this.cluster) {
      throw new Error('Cluster is not initialized!')
    }

    await this.cluster.idle()
    await this.cluster.close()

    logInfo('Cluster finished working!')

    logInfo('Closing browser...')
    this.browser?.close()
  }

  queueClusterTask = <ExpectedOutput, TaskData>(
    taskConfig: TaskConfig<ExpectedOutput, TaskData>
  ) => {
    if (!this.cluster) {
      throw new Error('Cluster is not initialized!')
    }
    const { CLUSTER_TASK, data, taskName } = taskConfig

    Logger.logWithTimestamp(
      'info',
      `[🍒 QUEUE 🍒]:`,
      `[CLUSTER_TASK]: ${taskName} queued!`
    )

    const clusterTask = this.cluster.execute(data, CLUSTER_TASK)

    return clusterTask
  }
  setUpCluster = async () => {
    // Create a cluster with 2 workers
    this.cluster = await Cluster.launch(clusterConfig)
    logInfo('scrapper cluster initialized!')
  }

  scrapSearchResultsRow = async (
    id: string,
    playerName: string,
    rating: string,
    responseHandler: (
      id: string,
      playerName: string,
      rating: string,
      futbinStats: FutbinStats
    ) => void
  ) => {
    const url = `https://www.futbin.com/players?page=1&search=%27${playerName}%27`
    const taskConfig = {
      data: {
        id,
        playerName,
        rating,
        url,
      },
      taskName: `scrapFutbinStatsTask for ${playerName}`,
      CLUSTER_TASK: this.scrapFutbinStatsTask,
    }

    const searchResultsRowStats = await this.queueClusterTask<
      unknown,
      FutbinSearchPlayerScreenStatsTask
    >(taskConfig)

    if (!searchResultsRowStats) {
      throw new Error(
        `Futbin search results row stats for ${playerName} are not defined!`
      )
    }

    responseHandler(id, playerName, rating, searchResultsRowStats)
  }

  scrapFutbinPlayers = async (
    playerList: ClubPlayer[],
    responseHandler: (
      id: string,
      playerName: string,
      rating: string,
      futbinStats: FutbinStats
    ) => void
  ) => {
    for (let index = 0; index < playerList.length; index++) {
      const clubPlayer = playerList[index]
      const { id, identity } = clubPlayer
      const { firstName, lastName } = identity

      const fullPlayerName = `${firstName} ${lastName}`
      const rating = String(clubPlayer.details.inGameStats.rating)
      // eslint-disable-next-line no-await-in-loop
      await this.scrapSearchResultsRow(
        id,
        fullPlayerName,
        rating,
        responseHandler
      )
    }

    await this.waitForClusterToFinish()
  }

  init = async () => {
    logInfo('At scrapper init!')
    // E.g. 100[ms]
    const slowMo = 500

    const { devtools, headless } = this.getDebugConfig(DEBUG)
    try {
      await this.setUpBrowser({ headless, devtools, slowMo })
      await this.setUpPage()
      await this.setUpCluster()
      return true
    } catch (err) {
      console.error(err)
      throw new Error(
        `Error while initializing scrapper: ${(err as Error).message}!`
      )
    }
  }
}
