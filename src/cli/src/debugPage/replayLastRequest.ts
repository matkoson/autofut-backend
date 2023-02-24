import Club from '../../../Club/index.js'

const replayLastRequest = async (futWebClubSummary: string) => {
  const startTime = performance.now()
  const club = new Club(futWebClubSummary)
  await club.makeClubReport(startTime)
}

export default replayLastRequest
