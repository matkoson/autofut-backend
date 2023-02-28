/* Uses hast, to perform specific business logic, i.e. Futbin stats analysis. */
/* TODO:
 * - 1. extract player image url
 * - 2. extract nationality image url
 * - 3. extract club image url
 * */

import MParser from '@matkoson/parser'

import { FutbinInfoTableData, FutbinPriceBoxData } from '../types.js'
import Logger from '../../../logger/index.js'

import { defaultInfoTableData } from './default.js'

const TAG = '[🖼 INFO_TABLE  🖼]:'
const logger = new Logger(TAG)

class FutbinPriceBoxParser {
  private mParser: MParser
  private playerName: string
  private isNameGlued = false
  private rating: string
  private infoTableData: FutbinInfoTableData = defaultInfoTableData
  lastLogMessage = ''

  constructor(html: string, playerName: string, rating: string) {
    this.mParser = new MParser(html)
    this.playerName = playerName
    this.rating = rating
  }

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
  public findPiece = (
    statName: string,
    structure: string[][] | string[]
  ): string | null => {
    // Logger.logWithTimestamp('structure', JSON.stringify(structure, null, 2))
    try {
      const statNameIndex = structure.findIndex((element) => {
        if (typeof element === 'string') {
          return element === statName
        } else if (Array.isArray(element)) {
          return element.join() === statName
        }

        return false
      })
      if (typeof statNameIndex !== 'number' || statNameIndex < 0) {
        logger.logDebug(TAG, `Stat name ${statName} not found in structure`)
        return null
      }
      const maybeStatValue = structure[statNameIndex + 1]
      const statValue =
        typeof maybeStatValue === 'string'
          ? maybeStatValue
          : maybeStatValue.join()

      if (!statValue) {
        throw new Error(`Stat value for ${statName} not found in structure`)
      }

      return statValue
    } catch (err) {
      logger.logError(TAG, err as Error)
      return null
    }
  }

  public parse = (): FutbinInfoTableData => {
    // const anchorsImagesWithProperties = this.mParser.getElementsWithProperties([
    //   'a',
    //   'img',
    // ])
    const { texts, paragraphs, sentences, words } =
      this.mParser.getTextStructure()

    // this.mParser.print('textStructure')

    this.infoTableData.firstName = this.findPiece('Name', texts)
    /* TODO: get rid of this hack! */
    this.infoTableData.lastName = texts[2]
    if (this.infoTableData.firstName && this.infoTableData.lastName) {
      this.infoTableData.fullName = `${this.infoTableData.firstName} ${this.infoTableData.lastName}`
    }
    this.infoTableData.alternativePositions = this.findPiece(
      'Alt,POS',
      paragraphs
    )
    this.infoTableData.accelerationType = this.findPiece('AcceleRATE', texts)
    this.infoTableData.clubName = this.findPiece('Club', texts)
    this.infoTableData.nationName = this.findPiece('Nation', texts)
    this.infoTableData.leagueName = this.findPiece('League', texts)
    this.infoTableData.skillMovesLevel = this.findPiece('Skills', sentences)
    this.infoTableData.weakFootLevel = this.findPiece('Weak,Foot', sentences)
    this.infoTableData.foot = this.findPiece('Foot', texts)
    this.infoTableData.height = this.findPiece('Height', texts)
    this.infoTableData.weight = this.findPiece('Weight', texts)
    this.infoTableData.revision = this.findPiece('Revision', texts)
    this.infoTableData.attackingWorkRate = this.findPiece('Att,WR', sentences)
    this.infoTableData.defensiveWorkRate = this.findPiece('Def,WR', sentences)
    this.infoTableData.origin = this.findPiece('Origin', texts)
    this.infoTableData.bodyType = this.findPiece('B,Type', sentences)
    this.infoTableData.age = this.findPiece('Age', texts)
    this.infoTableData.playerFutbinId = this.findPiece('ID', texts)
    this.infoTableData.clubId = this.findPiece('Club,ID', sentences)
    this.infoTableData.leagueId = this.findPiece('League,ID', sentences)

    return this.infoTableData
  }
}

export default FutbinPriceBoxParser
