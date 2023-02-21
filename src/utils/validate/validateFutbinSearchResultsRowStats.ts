/* eslint-disable func-style */

import {
  FutbinSearchResultsRowStats,
  // ValidFutbinSearchResultsRowStats,
} from '@matkoson/parser'

import { validateArrayOfType, validateString } from './index.js'

export function validateFutbinSearchResultsRowStats(
  futbinStats: FutbinSearchResultsRowStats
): asserts futbinStats is FutbinSearchResultsRowStats {
  validateString(futbinStats.playerFutbinUrl, 'playerFutbinUrl')
  validateString(futbinStats.playerFutbinId, 'playerFutbinId')
  validateString(futbinStats.firstName, 'firstName')
  validateString(futbinStats.lastName, 'lastName')
  validateString(futbinStats.clubName, 'clubName')
  validateString(futbinStats.nationName, 'nationName')
  validateString(futbinStats.leagueName, 'leagueName')
  validateString(futbinStats.rating, 'rating')
  validateString(futbinStats.preferredPosition, 'preferredPosition')
  validateArrayOfType<string>(
    futbinStats.alternativePositions,
    'alternativePositions',
    'string'
  )
  validateString(futbinStats.revision, 'revision')
  validateString(futbinStats.accelerationType, 'accelerationType')
  validateString(futbinStats.price, 'price')
  validateString(futbinStats.skillMovesLevel, 'skillMovesLevel')
  validateString(futbinStats.weakFootLevel, 'weakFootLevel')
  validateString(futbinStats?.workRates?.attacking, 'workRates')
  validateString(futbinStats?.workRates?.defensive, 'workRates')
  validateString(futbinStats.pace, 'pace')
  validateString(futbinStats.shooting, 'shooting')
  validateString(futbinStats.passing, 'passing')
  validateString(futbinStats.dribbling, 'dribbling')
  validateString(futbinStats.defending, 'defending')
  validateString(futbinStats.physicality, 'physicality')
  validateString(futbinStats.height, 'height')
  validateString(futbinStats.bodyType, 'bodyType')
  validateString(futbinStats.weight, 'weight')
}
