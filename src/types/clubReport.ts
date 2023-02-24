import { shallowClusterConfig } from '../Scrapper/index.js'

import { ClubPlayer } from './api.js'

export interface ClubReport {
  stats: {
    untradeableCount: number
    tradeableCount: number
    playerCount: number
  }
  clubPlayersMap: { [key: string]: ClubPlayer }
  clubPlayersList: ClubPlayer[]
  error: {
    futbinPriceNotUpdated: [string, string][]
    unknownIds: string[]
  }
}

export interface EnhancedClubReport {
  timestamp: string
  successRate: string
  duration: string
  numberOfPlayers: number
  clusterConfig: typeof shallowClusterConfig
  clubReport: ClubReport
}
