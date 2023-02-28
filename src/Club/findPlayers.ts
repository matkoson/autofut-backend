import { ClubPlayer, ClubSummary, PlayerIdentity } from '../types/index.js'
import { findPlayerById } from '../data/findSinglePlayer.js'
import Logger from '../logger/index.js'
import { defaultFutbinStatsData } from '../Scrapper/Futbin/default.js'

const TAG = '[🤔 FIND_PLAYERS 🤔]:'
const { logInfo, logDebug, logWarn, logSuccess } = new Logger(TAG)
type UpdateClubPlayer = (
  id: string,
  isUntradeable: boolean | null,
  clubPlayer: ClubPlayer | null
) => void

const findPlayers = (
  unknownClubPlayers: ClubSummary,
  updateClubPlayer: UpdateClubPlayer
) => {
  const failureList: string[] = []
  logInfo(TAG, 'Finding players...')
  // eslint-disable-next-line max-statements
  unknownClubPlayers.list.forEach((unknownClubPlayer) => {
    const { id } = unknownClubPlayer
    const identifiedPlayer = findPlayerById(id)

    if (!identifiedPlayer) {
      logWarn(TAG, `Player not found: [🪪  id:'${id}' 🪪]`)
      updateClubPlayer(id, null, null)
      failureList.push(id)
      return
    }
    let { firstName, lastName, rating } = identifiedPlayer
    if (identifiedPlayer.futbin) {
      const { futbin } = identifiedPlayer
      firstName = futbin.firstName
      lastName = futbin.lastName
      rating = identifiedPlayer.rating
    }

    logDebug(
      `[⚽️ PLAYER FOUND ⚽️]:`,
      `[🪪  id:'${id}' 🪪]\n> name: 🤹‍ '${firstName} ${lastName}'`
    )

    const { isUntradeable, ...restOfUnknownPlayer } = unknownClubPlayers.map[id]

    const playerIdentity: PlayerIdentity = {
      firstName,
      lastName,
      rating,
      futbinId: id,
    }

    const clubPlayer: ClubPlayer = {
      id,
      identity: playerIdentity,
      isUntradeable,
      futbin: defaultFutbinStatsData,
      details: {
        ...restOfUnknownPlayer,
      },
    }

    updateClubPlayer(id, isUntradeable, clubPlayer)
  })
  if (!failureList.length) {
    logSuccess(TAG, '\n\n✅ All players found! ✅\n\n')
  }
}

export default findPlayers
