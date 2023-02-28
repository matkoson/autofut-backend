import express from 'express'
import cors from 'cors'

import Club from './Club/index.js'
import { getDuration } from './utils/index.js'
import Logger from './logger/index.js'

const TAG = '[📟 SERVER  📟]:'
const { logInfo, logDebug, logError, logSuccess } = new Logger(TAG)

const runAutofutBackend = () => {
  const app = express()
  const port = 1939

  const corsOptions = {
    origin: ['https://www.ea.com'],
  }

  app.use(express.json())
  app.use(cors(corsOptions))

  logDebug(TAG, 'Starting backend...')

  app.post(
    '/sync_club',
    async (req: express.Request, res: express.Response) => {
      logInfo(TAG, "Received request: POST: '/sync_club'")
      const { rawClubSummary: futWebSummary, dis } = req.body || {}

      if (!futWebSummary || !dis) {
        logInfo(
          '[PATH=/sync_club]',
          'Missing parameters: `rawClubSummary`, `dis`'
        )
        res.status(400).json({
          error: 'Missing parameters: `rawClubSummary`, `dis`',
        })
        return
      }

      const startTime = performance.now()

      try {
        const club = new Club(futWebSummary)
        const clubReport = await club.makeClubReport(startTime)

        logSuccess(
          `[🎉🎉🎉 FINISHED RESPONDING 🎉🎉🎉]:`,
          `RES: /sync_club: returning club players list!`
        )

        res.status(200).json({
          ...clubReport,
          error: null,
        })
      } catch (err) {
        logError(
          `[📟 SERVER]:`,
          err as Error,
          `RES: /sync_club: returning error!`
        )
        const duration = getDuration(startTime, performance.now())
        logInfo(`[⏱  DURATION]:`, `'RES' took: ${duration}`)

        res.status(500).json({
          duration,
          clubReport: null,
          numberOfPlayers: null,
          successRate: null,
          clusterConfig: null,
          error: err,
        })
      }
    }
  )

  app.listen(port, () => {
    logInfo(TAG, `Backend listening on port ${port}`)
  })
}

export default runAutofutBackend
