# autofut-backend
Backend part of [AutoFut Extension](https://github.com/matkoson/autofut-extension).

### What it does
- runs a locat NodeJS server, which accepts synchronization requests from [AutoFut Chrome Extension](https://github.com/matkoson/autofut-extension), to create a database of owned players.
- runs a web scrapper with Puppeteer-Cluster to search for the latest player prices
- passes the extracted HTML to [parser](https://github.com/matkoson/matkoson-parser) for data extraction
- saves the club summary received from the [extension](https://github.com/matkoson/autofut-extension), to be able to update the prices on-demand and in scheduled intervals(`yarn price:update')

Technologies used
The following technologies are used in this project:

- Node.js (v16.13.0 or higher)
- TypeScript
- Rollup
- Puppeteer
- Hast
- Express
- Prompts
- eslint
- Prettier


