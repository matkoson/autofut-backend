import { shallowClusterConfig } from '../scrapper/index.js'

import { ClubPlayer } from './api.js'

export interface ClubReport {
  stats: {
    untradeableCount: number
    tradeableCount: number
    playerCount: number
  }
  playerList: ClubPlayer[]
  tradeableList: ClubPlayer[]
  untradeableList: ClubPlayer[]
  futbinPriceNotUpdated: [string, string][]
  unknownIds: string[]
}

export interface EnhancedClubReport {
  timestamp: string
  successRate: string
  duration: string
  numberOfPlayers: number
  clusterConfig: typeof shallowClusterConfig
  clubReport: ClubReport
}
