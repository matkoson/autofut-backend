import makePriceReport from '../../../data/analysis/priceReport/makePriceReport.js'

/* Get node arguments and pass those to the function. */
const args = process.argv.slice(2)
console.log(`[🎼  PRICES REPORT 🎼]:\n>Arguments: ${args}`)

makePriceReport(Boolean(args[0]))
