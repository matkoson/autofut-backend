/* eslint-disable func-style */

import { FutbinPlayer } from '../../Scrapper/Futbin/types.js'

import { validateString } from './index.js'

// eslint-disable-next-line max-lines-per-function
export function validateFutbinStats(
  playerName: string,
  rating: string,
  futbinPlayer: FutbinPlayer
): asserts futbinPlayer is FutbinPlayer {
  validateString(playerName, rating, futbinPlayer.price, 'price')
  validateString(playerName, rating, futbinPlayer.prevPrices, 'prevPrices')
  validateString(playerName, rating, futbinPlayer.prp, 'prp')
  validateString(playerName, rating, futbinPlayer.priceRange, 'priceRange')
  validateString(
    playerName,
    rating,
    futbinPlayer.playerFutbinId,
    'playerFutbinId'
  )
  validateString(
    playerName,
    rating,
    futbinPlayer.playerFutbinUrl,
    'playerFutbinUrl'
  )
  validateString(playerName, rating, futbinPlayer.firstName, 'firstName')
  validateString(playerName, rating, futbinPlayer.lastName, 'lastName')
  validateString(playerName, rating, futbinPlayer.clubName, 'clubName')
  validateString(playerName, rating, futbinPlayer.nationName, 'nationName')
  validateString(playerName, rating, futbinPlayer.leagueName, 'leagueName')
  // validateStriplayerName,rating, futbinStatsats.rating, 'rating')
  // validateStriplayerName,rating, futbinStatsats.preferredPosition, 'preferredPosition')
  // validateStriplayerName,rating, futbinStatsats.alternativePositions, 'alternativePositions')
  validateString(playerName, rating, futbinPlayer.revision, 'revision')
  validateString(
    playerName,
    rating,
    futbinPlayer.accelerationType,
    'accelerationType'
  )
  validateString(
    playerName,
    rating,
    futbinPlayer.skillMovesLevel,
    'skillMovesLevel'
  )
  validateString(
    playerName,
    rating,
    futbinPlayer.weakFootLevel,
    'weakFootLevel'
  )
  validateString(
    playerName,
    rating,
    futbinPlayer.attackingWorkRate,
    'workRates'
  )
  validateString(
    playerName,
    rating,
    futbinPlayer.defensiveWorkRate,
    'workRates'
  )
  validateString(playerName, rating, futbinPlayer.PACE, 'pace')
  validateString(playerName, rating, futbinPlayer.SHOOTING, 'shooting')
  validateString(playerName, rating, futbinPlayer.PASSING, 'passing')
  validateString(playerName, rating, futbinPlayer.DRIBBLING, 'dribbling')
  validateString(playerName, rating, futbinPlayer.DEFENDING, 'defending')
  validateString(playerName, rating, futbinPlayer.PHYSICALITY, 'physicality')
  validateString(playerName, rating, futbinPlayer.height, 'height')
  validateString(playerName, rating, futbinPlayer.bodyType, 'bodyType')
  validateString(playerName, rating, futbinPlayer.weight, 'weight')
  validateString(playerName, rating, futbinPlayer.price, 'price')
}
