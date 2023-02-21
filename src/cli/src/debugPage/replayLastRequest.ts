import Club from '../../../Club/index.js'

const replayLastRequest = async (rawClubSummary: string) => {
  const startTime = performance.now()
  const club = new Club(rawClubSummary)
  await club.makeClubReport(startTime)
}

export default replayLastRequest
