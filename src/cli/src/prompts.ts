import path from 'path'

import prompts, { Choice, PromptObject } from 'prompts'

import handlePrompts from './handlePrompts.js'
import {
  getArchiveRawClubSummaryFilenames,
  getLatestRawClubSummaryFilename,
} from './utils/index.js'

const prompt = async () => {
  const questions = [
    {
      type: 'select',
      message:
        'Welcome to AutoFut Backend CLI! Select the command you want to run',
      name: 'command',
      choices: [{ title: 'makeClubReport', value: 'makeClubReport' }],
    },
    {
      type: 'select',
      message: (prev: string) => {
        switch (prev) {
          case 'makeClubReport':
            return `Select the 'rawClubSummary' file version you want to use`
          default:
            return ''
        }
      },
      name: (prev: string) => {
        switch (prev) {
          case 'makeClubReport':
            return 'makeClubReport'
          default:
            return ''
        }
      },
      choices: (prev: string) => {
        switch (prev) {
          case 'makeClubReport':
            const latestRawClubSummaryFilename =
              getLatestRawClubSummaryFilename()
            const archiveRawClubSummaryFilenames =
              getArchiveRawClubSummaryFilenames()

            return [
              {
                title: `[LATEST]: ${path.basename(
                  latestRawClubSummaryFilename
                )}`,
                value: latestRawClubSummaryFilename,
                description: `Latest 'rawClubSummary' available`,
              },
              ...archiveRawClubSummaryFilenames,
            ] as const
          default:
            throw new Error("Couldn't find choices for second prompt!")
        }
      },
    },
  ] as PromptObject<string>[]

  const response = await prompts([...questions])

  console.log('response', response)

  handlePrompts(response)
}

export default prompt
