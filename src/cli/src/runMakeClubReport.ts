import 'tsconfig-paths/register'
import fs from 'fs'

import Club from '../../Club/index.js'
import Logger from '../../logger/index.js'

const TAG = '[🏎 RUN_MAKE_CLUB_REPORT  🏎]:'
const logger = new Logger(TAG)

export const runMakeClubReport = async () => {
  const startTime = performance.now()
  /* Get the rawClubSummaryFilename from the command line argument */
  const futWebClubSummaryFilename = process.argv[2]

  /* Get the contents of the chosen 'rawClubSummary' version*/
  const futWebClubSummary = fs.readFileSync(futWebClubSummaryFilename, 'utf8')

  const club = new Club(futWebClubSummary)
  const clubReport = await club.makeClubReport(startTime)

  logger.logSuccess('[🎉🎉🎉 FINISHED  🎉🎉🎉]:', `[CLI]: runMakeClubReport!`)
}
