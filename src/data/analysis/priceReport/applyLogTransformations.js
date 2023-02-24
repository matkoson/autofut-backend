const applyLogTransformations = (entries) => {
  const transformedEntries = entries.slice()

  const sortByDiff = true

  if (sortByDiff) {
    // eslint-disable-next-line id-length
    transformedEntries.sort((a, b) => {
      /* return:
       * > 0 if a should come after b
       * < 0 if a should come before b
       * */
      /*
       * if no DQR, place it first
       *  */
      if (!a.DQR) {
        return 1
      }
      if (!b.DQR) {
        return -1
      }
      /* The compared value with the higher DQR, get sorted last. */
      if (a.DQR > b.DQR) {
        return 1
      } else if (a.DQR < b.DQR) {
        return -1
      }
      /* if DQR is equal, leave the order as it was */
      return 0
    })

    // return entries.join('\n')
  }

  return entries
}

export default applyLogTransformations
