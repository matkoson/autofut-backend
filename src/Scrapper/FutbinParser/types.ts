export type FutbinOtherStatsData = {
  playerFutbinUrl: string | null
  quality: string | null
  rarity: string | null
}
export type FutbinPriceBoxData = {
  price: string | null
  prevPrices: string | null
  /* PRP gives you the indication of where the player price stands between the range, minimum range, maximum range or in-between. Once you have that information you can find profitable players you can trade. */
  prp: string | null
  priceRange: string | null
}
export type FutbinInnerStatsData = {
  /**/
  PACE: string | null
  SHOOTING: string | null
  PASSING: string | null
  DRIBBLING: string | null
  DEFENDING: string | null
  PHYSICALITY: string | null
  /**/
  acceleration: string | null
  sprintSpeed: string | null
  positioning: string | null
  finishing: string | null
  shotPower: string | null
  longShots: string | null
  volleys: string | null
  penalties: string | null
  vision: string | null
  crossing: string | null
  freeKickAccuracy: string | null
  shortPassing: string | null
  longPassing: string | null
  curve: string | null
  agility: string | null
  balance: string | null
  reactions: string | null
  ballControl: string | null
  composure: string | null
  interceptions: string | null
  headingAccuracy: string | null
  standingTackle: string | null
  slidingTackle: string | null
  jumping: string | null
  stamina: string | null
  strength: string | null
  aggression: string | null
}

export type FutbinInfoTableData = {
  firstName: string | null
  alternativePositions: string
  lastName: string | null
  fullName: string | null
  accelerationType: string | null
  clubName: string | null
  nationName: string | null
  leagueName: string | null
  skillMovesLevel: string | null
  weakFootLevel: string | null
  foot: string | null

  height: string | null
  weight: string | null
  revision: string | null
  attackingWorkRate: string | null
  defensiveWorkRate: string | null
  /* If is part of promo or smth. */
  origin: string | null
  bodyType: string | null
  age: string | null
  playerFutbinId: string | null
  clubId: string | null
  leagueId: string | null
}

export type FutbinStats = FutbinPriceBoxData &
  FutbinInfoTableData &
  FutbinInnerStatsData &
  FutbinOtherStatsData
