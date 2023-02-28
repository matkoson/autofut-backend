import { FutbinPriceBoxData } from '../types.js'

export const defaultPriceBoxData: FutbinPriceBoxData = {
  price: null,
  prevPrices: null,
  /* PRP gives you the indication of where the player price stands between the range, minimum range, maximum range or in-between. Once you have that information you can find profitable players you can trade. */
  prp: null,
  priceRange: null,
}
