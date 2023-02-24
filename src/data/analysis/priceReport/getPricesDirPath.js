import path from 'path'
import url from 'url'
import fs from 'fs'

const getPriceDirPath = () => {
  /* check if directory for the current day exists, if not, create it. */
  const analysisDirPath = path.join(
    path.dirname(url.fileURLToPath(import.meta.url)),
    `../../../../analysis/prices`
  )

  if (!fs.existsSync(analysisDirPath)) {
    fs.mkdirSync(analysisDirPath)
  }

  return analysisDirPath
}

export default getPriceDirPath
