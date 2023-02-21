import FutbinScrapper from './scrapper/Futbin/index.js'
import * as cli from './cli/index.js'
import runAutofutBackend from './server.js'

export default { cli, Futbin: FutbinScrapper, runAutofutBackend }
