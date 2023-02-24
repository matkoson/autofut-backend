import fs from 'fs'
import path from 'path'

const root = process.cwd()
export const getLatestFutWebClubSummaryFilename = () => {
  const latestFutWebClubSummaryDirPath = './src/data/futWebClubSummary/latest'
  const latestFutWebClubSummaryDir = path.resolve(
    root,
    latestFutWebClubSummaryDirPath
  )
  const latestFutWebClubSummaryFile = fs.readdirSync(
    latestFutWebClubSummaryDir
  )[0]

  return path.resolve(latestFutWebClubSummaryDir, latestFutWebClubSummaryFile)
}

export const getArchivedFutWebClubSummaryFilenames = () => {
  const archiveFutWebClubSummaryDirPath = './src/data/futWebClubSummary/archive'
  const archiveFutWebClubSummaryDir = path.resolve(
    root,
    archiveFutWebClubSummaryDirPath
  )
  const archiveFutWebClubSummaryFiles = fs.readdirSync(
    archiveFutWebClubSummaryDir
  )

  return archiveFutWebClubSummaryFiles.map((file: string) => {
    return {
      title: file,
      value: path.resolve(archiveFutWebClubSummaryDir, file),
      description: `Archived 'futWebClubSummary' file`,
    }
  })
}
