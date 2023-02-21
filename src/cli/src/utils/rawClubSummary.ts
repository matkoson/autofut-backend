import fs from 'fs'
import path from 'path'

const root = process.cwd()
export const getLatestRawClubSummaryFilename = () => {
  const latestRawClubSummaryDirPath = './src/data/rawClubSummary/latest'
  const latestRawClubSummaryDir = path.resolve(
    root,
    latestRawClubSummaryDirPath
  )
  const latestRawClubSummaryFile = fs.readdirSync(latestRawClubSummaryDir)[0]

  return path.resolve(latestRawClubSummaryDir, latestRawClubSummaryFile)
}

export const getArchiveRawClubSummaryFilenames = () => {
  const archiveRawClubSummaryDirPath = './src/data/rawClubSummary/archive'
  const archiveRawClubSummaryDir = path.resolve(
    root,
    archiveRawClubSummaryDirPath
  )
  const archiveRawClubSummaryFiles = fs.readdirSync(archiveRawClubSummaryDir)

  return archiveRawClubSummaryFiles.map((file: string) => {
    return {
      title: file,
      value: path.resolve(archiveRawClubSummaryDir, file),
      description: `Archived 'rawClubSummary' file`,
    }
  })
}
