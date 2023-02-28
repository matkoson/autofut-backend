/* Uses hast, to perform specific business logic, i.e. Futbin stats analysis. */

import MParser from '@matkoson/parser'

import { FutbinPriceBoxData } from '../types.js'
import Logger from '../../../logger/index.js'

import { defaultPriceBoxData } from './default.js'
import { dataMap } from './dataMap.js'

const TAG = '[💰 PRICE_BOX_PARSER 🖖]:'
const { logInfo, logError, logSuccess, logWarn, logDebug } = new Logger(TAG)

class FutbinPriceBoxParser {
  private mParser: MParser
  private playerName: string
  private isNameGlued = false
  private rating: string
  private priceBoxData: FutbinPriceBoxData = defaultPriceBoxData
  lastLogMessage = ''

  constructor(html: string, playerName: string, rating: string) {
    this.mParser = new MParser(html)
    this.playerName = playerName
    this.rating = rating
  }

  // getNameAndRating = (element: ElementWithProperties[]) => {
  //   const [firstName, lastName, rating] = (
  //     element[0]?.properties.alt as string
  //   ).split(' ')
  //
  //   this.priceBoxData.firstName = firstName
  //   this.priceBoxData.lastName = lastName
  //   this.priceBoxData.rating = rating
  // }
  //
  // getPlayerUrl = (element: ElementWithProperties[]) => {
  //   this.priceBoxData.playerFutbinUrl = element[1].properties?.href || null
  // }
  //
  // getTeamName = (element: ElementWithProperties[]) => {
  //   const teamName = element[3].properties?.dataOriginalTitle || null
  //
  //   this.priceBoxData.clubName = teamName
  // }
  // getLeagueName = (elements: ElementWithProperties[]) => {
  //   const leagueName = elements[7].properties?.dataOriginalTitle || null
  //
  //   this.priceBoxData.leagueName = leagueName
  // }
  // getNationName = (elements: ElementWithProperties[]) => {
  //   const nationName = elements[5].properties?.dataOriginalTitle || null
  //
  //   this.priceBoxData.nationName = nationName
  // }
  // getPlayerFutbinId = (elements: ElementWithProperties[]) => {
  //   const playerFutbinId = elements[1].properties?.dataSiteId || null
  //
  //   this.priceBoxData.playerFutbinId = playerFutbinId
  // }
  //
  // getHeight = (words: string[][]) => {
  //   const regex = /(\d+)/
  //   const rawHeight = words[19]?.join()
  //   const match = rawHeight.match(regex)
  //
  //   if (match && match.length > 1) {
  //     const number = parseInt(match[1], 10)
  //     this.priceBoxData.height = String(number)
  //     return
  //   }
  //   console.error('Could not extract height from: ', rawHeight)
  //   this.priceBoxData.height = null
  // }
  // getWeight = (words: string[][]) => {
  //   const regex = /(\d+)/
  //   const rawHeight = words[19]?.join()
  //   const match = rawHeight.match(regex)
  //
  //   if (match && match.length > 1) {
  //     const number = parseInt(match[1], 10)
  //     this.priceBoxData.weight = String(number)
  //     return
  //   }
  //   console.error('Could not extract weight from: ', rawHeight)
  //   this.priceBoxData.weight = null
  // }
  //
  // logResult = () => {
  //   let logMessage = ''
  //   const notScrapped: string[] = []
  //   const playerIdentifiers = `${this.playerName} ${this.rating}`
  //
  //   if (!Object.values(this.priceBoxData).filter(Boolean).length) {
  //     logMessage = `[🔴 PARSER FINISHED]: ${playerIdentifiers}: Futbin stats are empty. Scrapping failed.`
  //     console.error(logMessage)
  //   } else if (
  //     Object.values(this.priceBoxData).filter((futbinValue, index) => {
  //       if (!futbinValue) {
  //         notScrapped.push(Object.keys(this.priceBoxData)[index])
  //         return false
  //       }
  //       return true
  //     }).length !== Object.values(this.priceBoxData).length
  //   ) {
  //     logMessage = `[🟡 PARSER FINISHED]: ${playerIdentifiers}: Futbin stats are incomplete. Something went wrong.`
  //     const secondPart = `[🟡 NOT SCRAPPED]: ${JSON.stringify(
  //       notScrapped,
  //       null,
  //       2
  //     )}`
  //     console.warn(`${logMessage}\n${secondPart}`)
  //   } else if (
  //     Object.values(this.priceBoxData).filter(Boolean).length ===
  //     Object.values(this.priceBoxData).length
  //   ) {
  //     logMessage = `[🟢 PARSER FINISHED]: ${playerIdentifiers}: Futbin stats are complete. Scrapping succeeded! 🎉🎉🎉`
  //     Logger.logWithTimestamp(logMessage)
  //   }
  //
  //   this.lastLogMessage = logMessage
  // }
  //
  public getDebugTextStructure = (): string | null => {
    if (!this.mParser) {
      console.error(
        '[🔴 PARSER]: Hast is not initialized. Cant get text structure.'
      )
      return null
    }
    logDebug(TAG, ' PARSER: returning text structure.')
    return JSON.stringify(this.mParser.getFullStructure(), null, 2)
  }
  //
  // public logDebug = (logOption: LogOptions, args?: unknown) => {
  //   if (!this.mParser) {
  //     console.error('[🔴 PARSER]: Hast is not initialized. Cant debug.')
  //   }
  //   this.mParser.print(logOption, args)
  // }

  /* TODO:
   * - 1. extract player image url
   * - 2. extract nationality image url
   * - 3. extract club image url
   * */
  public parse = (): FutbinPriceBoxData => {
    // const anchorsImagesWithProperties = this.mParser.getElementsWithProperties([
    //   'a',
    //   'img',
    // ])
    const { texts, paragraphs, sentences, words } =
      this.mParser.getTextStructure()
    const {
      paragraphs: pKey,
      words: wKey,
      sentences: sKey,
      texts: tKey,
    } = dataMap

    this.priceBoxData.price = paragraphs[0]?.join() || null
    try {
      this.priceBoxData.prevPrices = JSON.stringify(
        [
          paragraphs[1]?.join(),
          paragraphs[2]?.join(),
          paragraphs[3]?.join(),
          paragraphs[4]?.join(),
        ],
        null,
        2
      )
    } catch (err) {
      console.error(err)
      this.priceBoxData.prevPrices = null
    }

    this.priceBoxData.prp = paragraphs[pKey.prp]?.join() || null
    this.priceBoxData.priceRange = paragraphs[pKey.priceRange]?.join() || null

    return this.priceBoxData
  }
}

export default FutbinPriceBoxParser
