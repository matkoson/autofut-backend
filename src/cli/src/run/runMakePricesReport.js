import index from '../../../data/analysis/priceReport/index.js'

/* Get node arguments and pass those to the function. */
const args = process.argv.slice(2)
console.log(`[🎼  PRICES REPORT 🎼]:\n>Arguments: ${args}`)

index(Boolean(args[0]))
