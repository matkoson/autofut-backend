/* eslint-disable func-style */

import { FutbinStats } from '../../Scrapper/FutbinParser/types.js'

import { validateArrayOfType, validateString } from './index.js'

export function validateFutbinStats(
  futbinStats: FutbinStats
): asserts futbinStats is FutbinStats {
  validateString(futbinStats.price, 'price')
  validateString(futbinStats.prevPrices, 'prevPrices')
  validateString(futbinStats.prp, 'prp')
  validateString(futbinStats.priceRange, 'priceRange')
  validateString(futbinStats.playerFutbinId, 'playerFutbinId')
  validateString(futbinStats.playerFutbinUrl, 'playerFutbinUrl')
  validateString(futbinStats.firstName, 'firstName')
  validateString(futbinStats.lastName, 'lastName')
  validateString(futbinStats.clubName, 'clubName')
  validateString(futbinStats.nationName, 'nationName')
  validateString(futbinStats.leagueName, 'leagueName')
  // validateString(futbinStats.rating, 'rating')
  // validateString(futbinStats.preferredPosition, 'preferredPosition')
  validateArrayOfType<string>(
    futbinStats.alternativePositions,
    'alternativePositions',
    'string'
  )
  validateString(futbinStats.revision, 'revision')
  validateString(futbinStats.accelerationType, 'accelerationType')
  validateString(futbinStats.skillMovesLevel, 'skillMovesLevel')
  validateString(futbinStats.weakFootLevel, 'weakFootLevel')
  validateString(futbinStats.attackingWorkRate, 'workRates')
  validateString(futbinStats.defensiveWorkRate, 'workRates')
  validateString(futbinStats.PACE, 'pace')
  validateString(futbinStats.SHOOTING, 'shooting')
  validateString(futbinStats.PASSING, 'passing')
  validateString(futbinStats.DRIBBLING, 'dribbling')
  validateString(futbinStats.DEFENDING, 'defending')
  validateString(futbinStats.PHYSICALITY, 'physicality')
  validateString(futbinStats.height, 'height')
  validateString(futbinStats.bodyType, 'bodyType')
  validateString(futbinStats.weight, 'weight')
  validateString(futbinStats.price, 'price')
}


