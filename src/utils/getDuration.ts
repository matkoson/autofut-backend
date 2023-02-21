import Logger from '../logger/index.js'

const { logInfo } = Logger

export const getDuration = (startTime: number, endTime: number) => {
  /* in ms*/
  const duration = endTime - startTime
  /* in sec */
  const inSeconds = Math.floor((duration / 1000) % 60)
  /* in min */
  const inMinutes = Math.floor(duration / 1000 / 60)

  logInfo(
    `[⏱  DURATION]: Response took ${inMinutes} minutes, ${inSeconds} seconds`
  )
  return `${inMinutes} minutes, ${inSeconds} seconds`
}
