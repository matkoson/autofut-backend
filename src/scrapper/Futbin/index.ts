import * as Puppeteer from 'puppeteer'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import FutbinStatsParser, {
  FutbinSearchResultsRowStats,
} from '@matkoson/parser'

import { getErrorLocation } from '../../utils/index.js'
import { validateFutbinSearchResultsRowStats } from '../../utils/validate/validateFutbinSearchResultsRowStats.js'
import { validateString } from '../../utils/validate/index.js'
import saveFutbinPrice from '../../Club/saveFutbinPrice.js'

import { saveElement } from './saveElement.js'
import findValidTableRow from './findValidTableRow.js'
import { futbinStatsDefault } from './default.js'

interface FutbinError {
  message: string
  line: number
  stack: Error['stack']
}

class FutbinScrapper {
  playerName: string
  rating: string
  page: Puppeteer.Page
  url: string
  futbinStatsParser: FutbinStatsParser | null = null
  futbinStats: FutbinSearchResultsRowStats = futbinStatsDefault

  constructor(
    playerName: string,
    rating: string,
    page: Puppeteer.Page,
    url: string
  ) {
    this.playerName = playerName
    this.rating = rating
    this.page = page
    this.url = url
  }

  private createExtractorError = (error: FutbinError) => {
    return new Error(
      `[FUTBIN_STATS_EXTRACTOR_ERROR]: at line ${error.line}: ${error.message}`
    )
  }

  loadPage = async (): Promise<void> => {
    try {
      await this.page.goto(this.url)
      await this.page.waitForFunction(() => {
        return document.readyState === 'complete'
      })
    } catch (err) {
      console.error('Error while going to url', err as Error)
    }
  }

  setUpValidRow = async () => {
    if (!this.page) {
      throw new Error(
        "Puppeteer was not properly initialized! Run '.init()' first!"
      )
    }
    await this.loadPage()
    await saveElement(this.page, 'fullPage')
    const validTableRow = await findValidTableRow(this.rating, this.page)
    return saveElement(this.page, 'validRow', validTableRow)
  }

  getTextStructure = (): string | null => {
    if (!this.futbinStatsParser) {
      console.error(
        "FutbinStatsParser was not properly initialized! Can't get text structure!"
      )
      return null
    }
    return this.futbinStatsParser.getDebugTextStructure()
  }

  logDebug = (logOption: string) => {
    if (!this.futbinStatsParser) {
      console.error(
        "FutbinStatsParser was not properly initialized! Can't print debug logs!"
      )
      return
    }

    // @ts-ignore
    this.futbinStatsParser.logDebug(logOption)
  }

  extract = async (): Promise<FutbinSearchResultsRowStats> => {
    const { html: validRowHtml } = await this.setUpValidRow()
    const playerIdentity = `(${this.playerName})(${this.rating})`
    console.info(`[🥷  SCRAPPING STARTED]: ${playerIdentity}...`)

    try {
      this.futbinStatsParser = new FutbinStatsParser(
        validRowHtml,
        this.playerName,
        this.rating
      )

      console.info(`[🥷  SCRAPPING]: Getting text structure...`)
      const textStructure = this.getTextStructure()
      console.info(`[🥷  SCRAPPING]: Text structure: ${textStructure}`)
      JSON.stringify(textStructure, null, 2)
    } catch (err) {
      console.error({
        message: `[UNEXPECTED_ERROR]: ${(err as Error).message}`,
        stack: (err as Error).stack,
        line: getErrorLocation(),
      })
      throw err
    }

    return this.futbinStats
  }
}

export default FutbinScrapper
