import * as Puppeteer from 'puppeteer'

import { getErrorLocation } from '../../utils/index.js'
import Logger from '../../logger/index.js'

import { saveElement } from './saveElement.js'
import { defaultFutbinStatsData } from './default.js'
import extractPriceBoxElement from './extractPriceBoxElement.js'
import extractPlayerInfoTableElement from './extractPlayerInfoTableElement.js'
import extractStatsInnerTableElement from './extractStatsInnerTableElement.js'
import PriceBoxParser from './PriceBox/index.js'
import InfoTableParser from './InfoTable/index.js'
import InnerStatsParser from './InnerStats/index.js'
import {
  FutbinInfoTableData,
  FutbinInnerStatsData,
  FutbinPriceBoxData,
  FutbinPlayer,
} from './types.js'
import findPlayerQualityAndRarity from './findPlayerQualityAndRarity.js'
import findPlayerFutbinUrl from './findPlayerFutbinUrl.js'

const TAG = '[‍☠️ FUTBIN_SCRAPPER 🏐]:'
const logger = new Logger(TAG)

interface FutbinError {
  message: string
  line: number
  stack: Error['stack']
}

class Futbin {
  playerName: string
  rating: string
  page: Puppeteer.Page
  searchResultsUrl: string
  priceBoxParser: PriceBoxParser | null = null
  innerStatsParser: InnerStatsParser | null = null
  infoTableParser: InfoTableParser | null = null

  priceBoxData: FutbinPriceBoxData | null = null
  innerStatsData: FutbinInnerStatsData | null = null

  infoTableData: FutbinInfoTableData | null = null
  playerDetailsPageUrl: string | null = null
  currentPageLocation: string | null = null
  futbinStats: FutbinPlayer = defaultFutbinStatsData

  constructor(
    playerName: string,
    rating: string,
    page: Puppeteer.Page,
    url: string
  ) {
    this.playerName = playerName
    this.rating = rating
    this.page = page
    this.searchResultsUrl = url

    return this
  }

  private createExtractorError = (error: FutbinError) => {
    return new Error(
      `[FUTBIN_STATS_EXTRACTOR_ERROR]: at line ${error.line}: ${error.message}`
    )
  }

  loadSearchResultsPage = async (): Promise<void> => {
    if (!this.searchResultsUrl) {
      throw new Error('Player futbin url is not set!')
    }

    try {
      await this.page.goto(this.searchResultsUrl)
      this.currentPageLocation = this.searchResultsUrl

      await this.page.waitForFunction(() => {
        return document.readyState === 'complete'
      })
      await saveElement(
        this.playerName,
        this.rating,
        this.page,
        'searchResultsPage'
      )
      logger.logDebug(
        '[LOAD_SEARCH_RESULTS_PAGE]:',
        `player: (${this.playerName})(${this.rating})\n url: ${this.searchResultsUrl}`
      )
    } catch (err) {
      logger.logError('[LOAD_SEARCH_RESULTS_PAGE]:', err as Error)
    }
  }

  loadPlayerDetailsPage = async (): Promise<void> => {
    if (!this.playerDetailsPageUrl) {
      throw new Error('Player futbin url is not set!')
    }

    try {
      await this.page.goto(this.playerDetailsPageUrl)
      this.currentPageLocation = this.playerDetailsPageUrl

      await this.page.waitForFunction(() => {
        return document.readyState === 'complete'
      })

      await saveElement(
        this.playerName,
        this.rating,
        this.page,
        'playerDetailsPage'
      )
      logger.logDebug(
        `[🤾‍ PLAYER_DETAILS_PAGE LOADED 🕸 ]:`,
        `player: (${this.playerName})(${this.rating}), url: ${this.playerDetailsPageUrl}`
      )
    } catch (error) {
      logger.logError('[LOAD_PLAYER_DETAILS_PAGE]:', error as Error)
    }
  }

  private scrapInfoElements = async () => {
    if (!this.page) {
      throw new Error(
        "Puppeteer was not properly initialized! Run '.init()' first!"
      )
    }

    await this.loadSearchResultsPage()

    this.playerDetailsPageUrl = await findPlayerFutbinUrl(
      this.playerName,
      this.rating,
      this.page
    )
    await this.loadPlayerDetailsPage()

    const { rarity, quality } = await findPlayerQualityAndRarity(
      this.playerName,
      this.rating,
      this.page
    )

    logger.logDebug(
      `[⚱️ FIND_QUALITY_AND_RARITY ⚱️]:`,
      `player: ${this.playerName}, found rarity: ${rarity}, quality: ${quality}`
    )
    this.futbinStats.rarity = rarity
    this.futbinStats.quality = quality

    const priceBoxElement = await extractPriceBoxElement(this.page)
    await saveElement(
      this.playerName,
      this.rating,
      this.page,
      'priceBoxElement',
      priceBoxElement
    )
    const infoTableElement = await extractPlayerInfoTableElement(this.page)
    await saveElement(
      this.playerName,
      this.rating,
      this.page,
      'infoTableElement',
      infoTableElement
    )

    const statsInnerTableElement = await extractStatsInnerTableElement(
      this.page
    )
    await saveElement(
      this.playerName,
      this.rating,
      this.page,
      'statsInnerTableElement',
      statsInnerTableElement
    )

    return {
      priceBoxElement,
      infoTableElement,
      statsInnerTableElement,
    }
  }

  getTextStructure = (): string | null => {
    if (!this.priceBoxParser) {
      console.error(
        "FutbinStatsParser was not properly initialized! Can't get text structure!"
      )
      return null
    }
    return this.priceBoxParser.getDebugTextStructure()
  }
  debugFutbinStats = () => {
    logger.logInfo(
      TAG,
      `Getting text structure for player: ${this.playerName}...`
    )
    const textStructure = this.getTextStructure()
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const parsedTextStructure = JSON.parse(textStructure)

      logger.logDebug(
        `[🔬 DEBUG_FUTBIN_STATS 🔬]:`,
        JSON.stringify(parsedTextStructure?.structure?.texts, null, 2)
      )
    } catch (err) {
      console.error("[🖖 PARSER  🔴]: Couldn't parse debug text structure", err)
      return null
    }

    return textStructure
  }

  private getHtmlFromElement = async (element: Puppeteer.ElementHandle) => {
    const html = await this.page.evaluate((el) => {
      return el.outerHTML
    }, element)
    return html
  }

  getPlayer = async (): Promise<FutbinPlayer> => {
    const TAG = '[🥷  EXTRACTING  🥷]:'
    const infoElements = await this.scrapInfoElements()
    const { priceBoxElement, infoTableElement, statsInnerTableElement } =
      infoElements

    const playerIdentity = `⚽️ '(${this.playerName}' ⚽️)(💯 '${this.rating}' 💯)`
    logger.logDebug(TAG, `${playerIdentity}...`)
    const priceBoxHtml = await this.getHtmlFromElement(priceBoxElement)
    const infoTableHtml = await this.getHtmlFromElement(infoTableElement)
    const statsInnerTableHtml = await this.getHtmlFromElement(
      statsInnerTableElement
    )

    try {
      this.priceBoxParser = new PriceBoxParser(
        priceBoxHtml,
        this.playerName,
        this.rating
      )
      this.priceBoxData = this.priceBoxParser.parse()

      this.innerStatsParser = new InnerStatsParser(
        statsInnerTableHtml,
        this.playerName,
        this.rating
      )
      this.innerStatsData = this.innerStatsParser.parse()

      this.infoTableParser = new InfoTableParser(
        infoTableHtml,
        this.playerName,
        this.rating
      )
      this.infoTableData = this.infoTableParser.parse()

      this.futbinStats = {
        ...{
          rarity: this.futbinStats.rarity,
          quality: this.futbinStats.quality,
          playerFutbinUrl: this.playerDetailsPageUrl,
        },
        ...this.priceBoxData,
        ...this.infoTableData,
        ...this.innerStatsData,
      }

      return this.futbinStats
    } catch (err) {
      console.error({
        message: `[UNEXPECTED_ERROR]: ${(err as Error).message}`,
        stack: (err as Error).stack,
        line: getErrorLocation(),
      })
      this.debugFutbinStats()
      throw err
    }
  }
}

export default Futbin
