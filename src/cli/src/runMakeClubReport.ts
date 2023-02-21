import 'tsconfig-paths/register'
import fs from 'fs'

import Club from '../../Club/index.js'

export const runMakeClubReport = async () => {
  const startTime = performance.now()
  /* Get the rawClubSummaryFilename from the command line argument */
  const rawClubSummaryFilename = process.argv[2]

  /* Get the contents of the chosen 'rawClubSummary' version*/
  const rawClubSummary = fs.readFileSync(rawClubSummaryFilename, 'utf8')

  const club = new Club(rawClubSummary)
  const clubReport = await club.makeClubReport(startTime)

  return console.log('[🎉🎉🎉 FINISHED  🎉🎉🎉]: CLI: runMakeClubReport!')
}
