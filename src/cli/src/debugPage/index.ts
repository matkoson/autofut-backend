import FutbinScrapper from '../../../Scrapper/FutbinParser/index.js'

import { initPuppeteer } from './initPuppeteer.js'

const debugPage = async (
  firstName: string,
  lastName: string,
  rating: string
) => {
  const { page, browser } = await initPuppeteer()
  const url = `https://www.futbin.com/players?page=1&search=%27${firstName}%20${lastName}%27`

  const futbinScrapper = new FutbinScrapper(
    `${firstName} ${lastName}`,
    rating,
    page,
    url
  )
  const futbinStats = await futbinScrapper.extract()
  console.info('[🎎  DP]: Logging debug info...')
  // futbinScrapper.logDebug('textStructure')

  browser.close()

  return futbinStats
}

export default debugPage
