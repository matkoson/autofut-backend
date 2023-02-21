// import { validateFutbinPriceResponse } from '@utils'
//
// const handleFutbinResponse = (
//   response: unknown,
//   playerId: string,
//   playerName: string
// ) => {
//   validateFutbinPriceResponse(response)
//   logInfo(
//     `Futbin response for player: id: ${playerId}, name: ${playerName}`,
//     response
//   )
//
//   const playerPrices = response[playerId].prices.ps
//   const clubPlayer = clubPlayers[playerId]
//
//   clubPlayer.details.price.futbin = {
//     latest: playerPrices.LCPrice,
//     minPrice: playerPrices.MinPrice,
//     maxPrice: playerPrices.MaxPrice,
//     lastUpdate: playerPrices.updated,
//     prp: playerPrices.PRP,
//   }
//
//   logSuccess(
//     `Updated futbin prices for player: '${clubPlayerFullName}' with id: '${playerId}'`
//   )
// }
