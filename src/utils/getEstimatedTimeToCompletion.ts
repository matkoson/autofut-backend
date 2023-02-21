import Logger from '../logger/index.js'

const { logInfo } = Logger

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

  logInfo(`[🪄 ETTC]: ${inMinutes} minutes ${inSeconds} seconds`)

  return estimatedTimeToCompletion
}
