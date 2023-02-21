import { saveReport } from '../data/clubReport/utils/saveData.js'
import { shallowClusterConfig } from '../scrapper/index.js'
import { getTimestamp } from '../utils/index.js'
import { ClubReport } from '../types/clubReport.js'
import Logger from '../logger/index.js'

const { logInfo } = Logger

const prepareReport = (clubReport: ClubReport, duration: string) => {
  const successRate = `${Math.round(
    (clubReport.playerList.length /
      (clubReport.playerList.length +
        clubReport.futbinPriceNotUpdated.length)) *
      100
  )}%`

  logInfo(`[👍 SUCCESS RATE]: ${successRate}%`)

  const enhancedClubReport = {
    timestamp: getTimestamp(),
    successRate,
    duration,
    numberOfPlayers: clubReport.playerList.length,
    clusterConfig: shallowClusterConfig,
    clubReport,
  }

  saveReport(enhancedClubReport)

  return enhancedClubReport
}

export default prepareReport
