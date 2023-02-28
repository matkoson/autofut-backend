import { FutbinPlayer } from '../Scrapper/Futbin/types.js'

export type FutWebClubSummaryItem = {
  assetId: number
  /* Assists for my club. */
  assists: number
  attackingworkrate: number
  attributeArray: number[]
  cardsubtypeid: number
  contract: number
  defendingworkrate: number
  discardValue: number
  formation: string
  guidAssetId: string
  id: number
  injuryGames: number
  injuryType: string
  itemState: string
  itemType: string
  lastSalePrice: number
  leagueId: number
  /* Assists for all clubs, not interesting. */
  lifetimeAssists: number
  /* Stats for all clubs: ["Games Played", "Goals Scored", "Yellow Cards", "Red Cards", ?] */
  lifetimeStatsArray: number[]
  loans: number
  loyaltyBonus: number
  marketDataMaxPrice: number
  marketDataMinPrice: number
  nation: number
  owners: number
  pile: number
  playStyle: number
  possiblePositions: string[]
  preferredPosition: string
  preferredfoot: number
  rareflag: number
  rating: number
  resourceGameYear: number
  resourceId: number
  /* Stats for my club: ["Games Played", "Goals Scored", "Yellow Cards", "Red Cards", ?] */
  statsArray: number[]
  teamid: number
  timestamp: number
  untradeable: boolean
  weakfootabilitytypecode: number
}

/* At the point this type is used, the player is not yet identified. We get to know his name once 'lookupPlayer' function returns a match. */
export type UnknownClubPlayer = {
  id: string
  isUntradeable: boolean
  isLoaned: boolean
  performance: {
    assists: number
    injuryGames: number
    gamesPlayed: number
    goalsScored: number
    yellowCards: number
    redCards: number
  }
  inGameStats: {
    rating: number
    playStyle: number
    possiblePositions: string[]
    preferredPosition: string
    preferredFoot: number
    workRate: {
      attacking: number
      defending: number
    }
    weakFootAbilityType: number
  }
  detailedInfo: {
    itemType: string
    contract: number
    cardSubTypeId: number
    formation: string
    itemState: string
    leagueId: number
    loans: number
    loyaltyBonus: number
    nation: number
    rareFlag: number
    teamId: number
  }
  playerValue: {
    discardValue: number | null
    lastSalePrice: number | null
    marketDataMaxPrice: number | null
    marketDataMinPrice: number | null
  }
}

export type UnknownClubPlayerMap = {
  [id: string]: UnknownClubPlayer
}

export type UnknownClubPlayerList = UnknownClubPlayer[]

export type PlayerIdentity = {
  firstName: string
  lastName: string
  rating: string
  futbinId: string
}

export type FutbinPrices = {
  [key: string]: {
    prices: {
      ps: {
        LCPrice: string
        LCPrice2: string
        LCPrice3: string
        LCPrice4: string
        LCPrice5: string
        updated: string
        MinPrice: string
        MaxPrice: string
        PRP: string
        LCPClosing: string
      }
    }
  }
}

export type ClubPlayer = {
  id: string
  identity: PlayerIdentity
  isUntradeable: boolean
  futbin: FutbinPlayer
  details: Omit<UnknownClubPlayer, 'isUntradeable'>
}

/*
* example:
* {
  "177388": {
  "prices": {
    "ps": {
      "LCPrice": "950",
        "LCPrice2": "950",
        "LCPrice3": "950",
        "LCPrice4": "950",
        "LCPrice5": "950",
        "updated": "12 mins ago",
        "MinPrice": "700",
        "MaxPrice": "10,000",
        "PRP": "2",
        "LCPClosing": 1100
    },
    "pc": {
      "LCPrice": "900",
        "LCPrice2": "900",
        "LCPrice3": "950",
        "LCPrice4": "950",
        "LCPrice5": "1,000",
        "updated": "40 mins ago",
        "MinPrice": "700",
        "MaxPrice": "10,000",
        "PRP": "2",
        "LCPClosing": 1000
    }
  }
}
}
*/

export type FutWebClubSummary = {
  itemData: FutWebClubSummaryItem[]
}

export type ClubPlayerList = {
  [key: string]: Omit<FutWebClubSummaryItem, 'assetId'>
}

export type ClubSummary = {
  map: UnknownClubPlayerMap
  list: UnknownClubPlayerList
}
