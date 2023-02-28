/* Uses hast, to perform specific business logic, i.e. Futbin stats analysis. */

import MParser, { ElementWithProperties, LogOptions } from '@matkoson/parser'

import { FutbinInnerStatsData, FutbinPriceBoxData } from '../types.js'

import { defaultInnerStatsData } from './default.js'
import { dataMap } from './dataMap.js'

class FutbinPriceBoxParser {
  private mParser: MParser
  private playerName: string
  private isNameGlued = false
  private rating: string
  private innerStatsData: FutbinInnerStatsData = defaultInnerStatsData
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
  //   const rawHeight = words[19].join()
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
  //   const rawHeight = words[19].join()
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
  // public getDebugTextStructure = (): string | null => {
  //   if (!this.mParser) {
  //     console.error(
  //       '[🔴 PARSER]: Hast is not initialized. Cant get text structure.'
  //     )
  //     return null
  //   }
  //   Logger.logWithTimestamp('[🟦 DEBUG]: PARSER: returning text structure.')
  //   return JSON.stringify(this.mParser.getFullStructure(), null, 2)
  // }
  //
  // public logDebug = (logOption: LogOptions, args?: unknown) => {
  //   if (!this.mParser) {
  //     console.error('[🔴 PARSER]: Hast is not initialized. Cant debug.')
  //   }
  //   this.mParser.print(logOption, args)
  // }

  public findStat = (
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
        throw new Error(`Stat name ${statName} not found in structure`)
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
      console.error(err)
      return null
    }
  }

  /* TODO:
   * - 1. extract player image url
   * - 2. extract nationality image url
   * - 3. extract club image url
   * */
  public parse = (): FutbinInnerStatsData => {
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

    // this.mParser.print('textStructure')

    this.innerStatsData.PACE = this.findStat('Pace', texts)
    this.innerStatsData.acceleration = this.findStat('Acceleration', texts)
    this.innerStatsData.sprintSpeed = this.findStat('Sprint,Speed', sentences)
    this.innerStatsData.SHOOTING = this.findStat('Shooting', texts)
    this.innerStatsData.positioning = this.findStat('Positioning', texts)
    this.innerStatsData.finishing = this.findStat('Finishing', texts)
    this.innerStatsData.shotPower = this.findStat('Shot,Power', sentences)
    this.innerStatsData.longShots = this.findStat('Long,Shots', sentences)
    this.innerStatsData.volleys = this.findStat('Volleys', texts)
    this.innerStatsData.penalties = this.findStat('Penalties', texts)
    this.innerStatsData.PASSING = this.findStat('Passing', texts)
    this.innerStatsData.vision = this.findStat('Vision', texts)
    this.innerStatsData.crossing = this.findStat('Crossing', texts)
    this.innerStatsData.freeKickAccuracy = this.findStat(
      'FK,Accuracy',
      sentences
    )
    this.innerStatsData.shortPassing = this.findStat('Short,Passing', sentences)
    this.innerStatsData.longPassing = this.findStat('Long,Passing', sentences)
    this.innerStatsData.curve = this.findStat('Curve', texts)
    this.innerStatsData.DRIBBLING = this.findStat('Dribbling', texts)
    this.innerStatsData.agility = this.findStat('Agility', texts)
    this.innerStatsData.balance = this.findStat('Balance', texts)
    this.innerStatsData.reactions = this.findStat('Reactions', texts)
    this.innerStatsData.ballControl = this.findStat('Ball,Control', sentences)
    this.innerStatsData.DRIBBLING = this.findStat('Dribbling', texts)
    this.innerStatsData.composure = this.findStat('Composure', texts)
    this.innerStatsData.DEFENDING = this.findStat('Defending', texts)
    this.innerStatsData.interceptions = this.findStat('Interceptions', texts)
    this.innerStatsData.headingAccuracy = this.findStat(
      'Heading,Accuracy',
      sentences
    )
    this.innerStatsData.standingTackle = this.findStat(
      'Standing,Tackle',
      sentences
    )
    this.innerStatsData.slidingTackle = this.findStat(
      'Sliding,Tackle',
      sentences
    )
    this.innerStatsData.PHYSICALITY = this.findStat('Physicality', texts)
    this.innerStatsData.jumping = this.findStat('Jumping', texts)
    this.innerStatsData.stamina = this.findStat('Stamina', texts)
    this.innerStatsData.strength = this.findStat('Strength', texts)
    this.innerStatsData.aggression = this.findStat('Aggression', texts)

    // Logger.logWithTimestamp(
    //   '[🔵  DEBUG]: this.innerStatsData',
    //   JSON.stringify(
    //     Object.entries(this.innerStatsData).filter((key) => {
    //       return key[1] !== null
    //     }),
    //     null,
    //     2
    //   )
    // )
    return this.innerStatsData
  }
}

export default FutbinPriceBoxParser
