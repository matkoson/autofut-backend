import { FutbinOtherStatsData, FutbinStats } from './types.js'
import { defaultPriceBoxData } from './PriceBox/default.js'
import { defaultInfoTableData } from './InfoTable/default.js'
import { defaultInnerStatsData } from './InnerStats/default.js'

const defaultOtherFutbinStatsData: FutbinOtherStatsData = {
  playerFutbinUrl: null,
  quality: null,
  rarity: null,
}

export const defaultFutbinStatsData: FutbinStats = {
  ...defaultOtherFutbinStatsData,
  ...defaultPriceBoxData,
  ...defaultInfoTableData,
  ...defaultInnerStatsData,
  playerFutbinUrl: null,
}
