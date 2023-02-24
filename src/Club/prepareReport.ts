import { getTimestamp } from '../utils/index.js'
import { ClubReport } from '../types/clubReport.js'
import { shallowClusterConfig } from '../Scrapper/index.js'

const prepareReport = (clubReport: ClubReport, duration: string) => {
  // const successRate = `${Math.round(
  //   (clubReport.playerList.length /
  //     (clubReport.playerList.length +
  //       clubReport.futbinPriceNotUpdated.length)) *
  //     100
  // )}%`

  // logInfo(`[👍 SUCCESS RATE]: ${successRate}%`)

  const enhancedClubReport = {
    timestamp: getTimestamp(),
    successRate: '',
    duration,
    numberOfPlayers: clubReport.clubPlayersList.length,
    clusterConfig: shallowClusterConfig,
    clubReport,
  }

  return enhancedClubReport
}

export default prepareReport
