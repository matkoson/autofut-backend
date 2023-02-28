/* eslint-disable id-length */
import { pls } from './static/pls.js'

export interface RawPlayerName {
  // first
  f: string
  id: string
  // last
  l: string
  // rating
  r: string
  futbin?: {
    firstName: string
    lastName: string
  }
}

export interface PlayerName {
  firstName: string
  id: string
  lastName: string
  rating: string
  futbin?: {
    firstName: string
    lastName: string
  }
}

interface Players {
  LegendsPlayers: RawPlayerName[]
  Players: RawPlayerName[]
}

type PlayerHashMap = {
  [key: string]: RawPlayerName
}

const players = JSON.parse(pls) as Players
const regularPlayers = players.Players
const legendsPlayers = players.LegendsPlayers

const overrideIfNecessary = (player: RawPlayerName): RawPlayerName => {
  const overrides: {
    [key: string]: {
      f: string
      l: string
      futbin?: {
        firstName: string
        lastName: string
      }
    }
  } = {
    'Xabier Alonso Olano': {
      f: 'Xabi',
      l: 'Alonso',
    },
    'Ricardo Jorge da Luz Horta': {
      f: 'Ricardo',
      l: 'Horta',
    },
    'Sergio Ramos': {
      f: 'Sergio',
      l: 'Ramos',
    },
    'Renato Sanches': {
      f: 'Renato',
      l: 'Sanches',
    },
    'Esequiel Barco': {
      f: 'Esequiel',
      l: 'Barco',
      futbin: {
        firstName: 'Ezequiel',
        lastName: 'Barco',
      },
    },
    'Bruno Ricardo Valdez Wilson': {
      f: 'Bruno',
      l: 'Wilson',
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

const getPlayerHashMap = (key: 'id' | 'l'): PlayerHashMap => {
  const map: PlayerHashMap = {}
  for (const player of regularPlayers) {
    if (key === 'l') {
      map[`${player.f}${player.l}${player.r}`] = player
    } else {
      map[player[key]] = player
    }
  }

  for (const player of legendsPlayers) {
    if (key === 'l') {
      map[`${player.f}${player.l}${player.r}`] = player
    } else {
      map[player[key]] = player
    }
  }

  return map
}

const createPlayerNameObject = (player: RawPlayerName): PlayerName => {
  return {
    firstName: player.f,
    id: player.id,
    lastName: player.l,
    rating: player.r,
    futbin: player?.futbin,
  }
}

const findPlayerById = (id: string): PlayerName | null => {
  const playerIdHashMap = getPlayerHashMap('id')
  const playerObj = playerIdHashMap[id]
  if (playerObj) {
    /* E.g. "Xabier Alonso Olano" -> "Xabi Alonso"*/
    const playerObject = overrideIfNecessary(playerObj)
    return createPlayerNameObject(playerObject)
  }
  return null
}

const findPlayerByNameRating = (
  firstName: string,
  lastName: string,
  rating: string
): PlayerName => {
  const playerSurnameHashMap = getPlayerHashMap('l')
  const player = playerSurnameHashMap[`${firstName}${lastName}${rating}`]
  if (!player) {
    throw new Error(`Could not find player: ${firstName} ${lastName} ${rating}`)
  }
  const playerObject = overrideIfNecessary(player)
  return createPlayerNameObject(playerObject)
}

export { findPlayerByNameRating, findPlayerById }
