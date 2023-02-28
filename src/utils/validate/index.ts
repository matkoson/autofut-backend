/* eslint-disable max-params */
/* eslint-disable func-style*/
import Logger from '../../logger/index.js'

const TAG = '[☑️ VALIDATE ☑️]:'
const logger = new Logger(TAG)

export function createValidationError(field: string, message: string): Error {
  const error = new Error(message)
  logger.logError(`[☑️ VALIDATION FAILED 🔴]:`, error as Error, field)
  error.name = 'ValidationError'
  return error
}
export function validateString(
  playerName: string,
  rating: string,
  value: unknown,
  field: string
): asserts value is string {
  if (typeof value !== 'string') {
    throw createValidationError(
      field,
      `(${playerName})(${rating}):${field}: expected string but got ${typeof value}: ${value}`
    )
  }
}
