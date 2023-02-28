const getCheapestByRating = (rating, name) => {
  const cheapestMap = {
    /* 400 */
    80: '550',
    /* 750 */
    81: '650',
    /* 1400 */
    82: '1100',
    /* 2500 */
    83: '2400',
    /* 4800 */
    84: '5000',
    /* 11,750 */
    85: '12750',
    /* 15,000 */
    86: '18250',
    /* 19,500 */
    87: '25250',
    /* 28,250 */
    88: '36750',
    /* 37,750 */
    89: '49000',
    /* 51,000 */
    90: '60000',
    /* 59,500 */
    91: '73500',
    /* 155,000 */
    92: '146000',
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
