import { program } from 'commander'

program
  .version('0.1.0')
  .option('-p, --peppers', 'Add peppers')
  .option('-P, --pineapple', 'Add pineapple')
  .option('-b, --bbq-sauce', 'Add BBQ sauce')
  .option(
    '-c, --cheese [type]',
    'Add the specified type of cheese [marble]',
    'marble'
  )
  .parse(process.argv)

export default program
