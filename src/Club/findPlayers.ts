import { ClubPlayer, ClubSummary, PlayerIdentity } from '../types/index.js'
import lookupPlayer from '../data/lookupPlayer.js'
import Logger from '../logger/index.js'
import { defaultFutbinStatsData } from '../Scrapper/FutbinParser/default.js'

const { logSuccess, logInfo, logWarn } = Logger
type UpdateClubPlayer = (
  id: string,
  isUntradeable: boolean | null,
  clubPlayer: ClubPlayer | null
) => void

const findPlayers = (
  unknownClubPlayers: ClubSummary,
  updateClubPlayer: UpdateClubPlayer
) => {
  logInfo('[🤔 FIND PLAYERS]: Finding players...')
  // eslint-disable-next-line max-statements
  unknownClubPlayers.list.forEach((unknownClubPlayer) => {
    const { id } = unknownClubPlayer
    const playerName = lookupPlayer(id)

    if (!playerName) {
      updateClubPlayer(id, null, null)
      return
    }

    const { f: firstName, l: lastName } = playerName
    logSuccess(
      `[⚽️ PLAYER FOUND ⚽️]: [🪪  id:'${id}' 🪪]\n> name: 🤹‍ '${firstName} ${lastName}'`
    )

    const { isUntradeable, ...restOfUnknownPlayer } = unknownClubPlayers.map[id]

    const playerIdentity: PlayerIdentity = {
      firstName: firstName,
      lastName: lastName,
      futbinId: id,
      rating: String(unknownClubPlayer?.inGameStats?.rating),
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
}

export default findPlayers
