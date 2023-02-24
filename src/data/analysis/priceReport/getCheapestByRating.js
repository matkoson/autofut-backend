const getCheapestByRating = (rating, name) => {
  const cheapestMap = {
    80: '400',
    81: '750',
    82: '1400',
    83: '2500',
    84: '4800',
    85: '11750',
    86: '15000',
    87: '19500',
    88: '28250',
    89: '37750',
    90: '51000',
    91: '59500',
    92: '155000',
  }

  const cheapestForRating = cheapestMap[rating] || null

  if (!cheapestForRating) {
    return { log: `[${rating}=❓]`, value: null }
  }

  console.info(
    `[GET_CHEAPEST_BY_RATING]: player: ${name}: ${rating}=${cheapestMap[rating]}]`
  )

  return {
    log: `[💯'${rating}'='${cheapestMap[rating]}'€]:`,
    value: Number(cheapestMap[rating]),
  }
}

export default getCheapestByRating
