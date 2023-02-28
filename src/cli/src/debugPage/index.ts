/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-debugger */

import Scrapper from '../../../Scrapper/index.js'
import { FutbinPlayer } from '../../../Scrapper/Futbin/types.js'
import { findPlayerByNameRating } from '../../../data/findSinglePlayer.js'
import getClubPlayerStructure from '../../testData/getClubPlayerStructure.js'
import Logger from '../../../logger/index.js'

const TAG = '[🎎  DP]:'
const logger = new Logger(TAG)

const debugPage = async (
  firstName: string,
  lastName: string,
  rating: string
) => {
  // const url = `https://www.futbin.com/players?page=1&search=%27${firstName}%20${lastName}%27`

  const player = findPlayerByNameRating(firstName, lastName, rating)

  const handleFutbinPlayer = (
    id: string,
    playerName: string,
    rating: string,
    futbinStats: FutbinPlayer
  ) => {
    debugger
  }

  const clubPlayer = getClubPlayerStructure(
    player.id,
    player?.futbin?.firstName || player.firstName,
    player?.futbin?.lastName || player.lastName,
    player.rating
  )

  const scrapper = new Scrapper()
  await scrapper.init()
  const futbinStats = await scrapper.scrapFutbinPlayerList(
    [clubPlayer],
    handleFutbinPlayer
  )

  logger.logInfo('[🎎  DP]:', 'Logging debug info...')
  // futbinScrapper.logDebug('textStructure')

  return futbinStats
}

export default debugPage
