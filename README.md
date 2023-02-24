# AutoFut Backend
Backend part of [AutoFut](https://github.com/matkoson/autofut-extension).

### What it does
- runs a locat NodeJS server, which accepts synchronization requests from [AutoFut Chrome Extension](https://github.com/matkoson/autofut-extension), to create a database of owned players.
- runs a [web scrapper cluster](https://github.com/thomasdondorf/puppeteer-cluster) to search for the latest player prices
- passes the extracted HTML to [parser](https://github.com/matkoson/matkoson-parser) for data extraction
- saves the club summary received from the [extension](https://github.com/matkoson/autofut-extension), to be able to update the prices on-demand(`yarn price:update`) and in scheduled intervals(`yarn price:update:interval`)
- generates price reports, displaying the difference in price in comparison to the cheapest player of the same **rating** or the same **type**(combined rarity and quality), to spot potential trading opportunities
- generates player performance reports, to indicate which players should be used most, based on past performance

# Technologies

- Node.js (v16.13.0 or higher)
- TypeScript
- Rollup
- Puppeteer
- Puppeteer-Cluster
- Express
- Prompts
- Commander
- ESlint
- Prettier

