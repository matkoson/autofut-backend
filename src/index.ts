import * as cli from './cli/index.js'
import runAutofutBackend from './server.js'
import FutbinScrapper from './Scrapper/FutbinParser/index.js'
import Logger from './logger/index.js'

export default { Logger, cli, Futbin: FutbinScrapper, runAutofutBackend }
