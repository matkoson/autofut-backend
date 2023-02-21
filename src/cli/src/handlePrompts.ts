import { execSync } from 'child_process'

const root = process.cwd()

const handlePrompts = (response: { [key: string]: string }) => {
  const { command } = response
  console.log('command', command)
  switch (command) {
    case 'makeClubReport':
      const command = `ts-node -P ${root}/cli/src/runMakeClubReport.ts ${response.club}`
      execSync(command, { stdio: 'inherit' })
      break
    default:
      throw new Error("Couldn't find handler for command!")
  }
}

export default handlePrompts
