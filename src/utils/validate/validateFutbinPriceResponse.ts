/* eslint-disable func-style*/
/* Assert functions can't be created in TS using arrow functions */

// eslint-disable-next-line complexity

import { FutbinPrices } from '../../types/index.js'

export function validateFutbinPriceResponse(
  response: unknown
): asserts response is FutbinPrices {
  if (typeof response !== 'object') {
    throw new Error(
      `expected FutbinPrice object shape, but isn't an object: ${response}`
    )
  }
  if (!response || typeof response !== 'object') {
    throw new Error(
      `expected FutbinPrice object shape, but got ${typeof response}: ${response}`
    )
  }

  const objCast = response as FutbinPrices

  for (const key in objCast) {
    if (typeof objCast[key] !== 'string') {
      throw new Error(
        `expected FutbinPrice object shape, but got ${typeof objCast[key]}: ${
          objCast[key]
        }`
      )
    }

    const value = objCast[key]

    if (
      typeof value !== 'object' ||
      !value.hasOwnProperty('prices') ||
      typeof value.prices !== 'object'
    ) {
      throw new Error(
        `expected FutbinPrice object shape, but got ${typeof value}: ${value}`
      )
    }

    const { prices } = value

    if (!prices.hasOwnProperty('ps') || typeof prices.ps !== 'object') {
      throw new Error(
        `expected FutbinPrice object shape, but got ${typeof prices.ps}: ${
          prices.ps
        }`
      )
    }
  }
}
