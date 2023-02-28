import Logger from '../logger/index.js'

const TAG = `[🪄  ETTC  🪄]:`
const logger = new Logger(TAG)

export const getEstimatedTimeToCompletion = (
  sameDomainDelay: number,
  numberOfPlayers: number
) => {
  /* in ms */
  const knownTimeToCompletePerPlayer = 275
  /* in ms */
  const estimatedTimeToCompletion =
    (knownTimeToCompletePerPlayer + sameDomainDelay) * numberOfPlayers

  /* in sec */
  const inSeconds = Math.floor((estimatedTimeToCompletion / 1000) % 60)
  /* in min */
  const inMinutes = Math.floor(estimatedTimeToCompletion / 1000 / 60)

  logger.logInfo(TAG, `${inMinutes} minutes ${inSeconds} seconds`)

  return estimatedTimeToCompletion
}
