import { pls } from './static/pls.js'

export interface PlayerName {
  // first
  f: string
  id: string
  // last
  l: string
  // rating
  r: string
}

interface Players {
  LegendsPlayers: PlayerName[]
  Players: PlayerName[]
}

const players = JSON.parse(pls) as Players
const regularPlayers = players.Players
const legendsPlayers = players.LegendsPlayers
const playerHashMap: {
  [key: string]: PlayerName
} = {}
const overrideIfNecessary = (player: PlayerName): PlayerName => {
  const overrides: { [key: string]: { f: string; l: string } } = {
    'Xabier Alonso Olano': {
      f: 'Xabi',
      l: 'Alonso',
    },
  }

  if (overrides[`${player.f} ${player.l}`]) {
    return {
      ...player,
      ...overrides[`${player.f} ${player.l}`],
    }
  }

  return player
}

for (const player of regularPlayers) {
  playerHashMap[player.id] = player
}

for (const player of legendsPlayers) {
  playerHashMap[player.id] = player
}

const lookupPlayer = (id: string) => {
  const playerObj = playerHashMap[id]
  if (playerObj) {
    /* E.g. "Xabier Alonso Olano" -> "Xabi Alonso"*/
    const playerObject = overrideIfNecessary(playerObj)
    return playerObject
  }
  return null
}

export default lookupPlayer
