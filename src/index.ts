import * as cli from './cli/index.js'
import runAutofutBackend from './server.js'
import Futbin from './Scrapper/Futbin/index.js'
import Logger from './logger/index.js'

export default { Logger, cli, Futbin: Futbin, runAutofutBackend }
