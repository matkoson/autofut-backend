import path from 'path'
import url from 'url'
import fs from 'fs'

const getReportDateFile = (reportDate) => {
  /* check if directory for the current day exists, if not, create it. */
  const todayDateReportPath = path.join(
    path.dirname(url.fileURLToPath(import.meta.url)),
    `../../../analysis/prices/${reportDate}`
  )
  if (!fs.existsSync(todayDateReportPath)) {
    fs.mkdirSync(todayDateReportPath)
  }

  return todayDateReportPath
}

export default getReportDateFile
