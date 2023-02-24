import pretty from 'pretty'

import { getTimestamp } from '../utils/index.js'

enum LogLevels {
  ERROR = 0,
  INFO = 1,
  DEBUG = 2,
}

export type LogOptions = 'info' | 'error' | 'debug' | 'success' | 'warn'

const MAX_LOG_LENGTH = 100

class Logger {
  static logLevel: LogLevels = LogLevels.DEBUG
  private static startTime: [number, number] = process.hrtime()

  private static processMessages = function (messages: unknown[]) {
    return [...messages]
      .map((message) => {
        let processedMessage = ''
        if (typeof message === 'string') {
          processedMessage = message
        }

        if (typeof window !== 'undefined' && message instanceof NodeList) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore some issue with iterating over a NodeList, idc
          processedMessage = [...message]
            .map((element) => {
              return element?.toString() || JSON.stringify(message, null, 2)
            })
            .join(' ')
        }

        if (typeof message === 'object') {
          processedMessage = JSON.stringify(message, null, 2)
        }

        if (processedMessage.length > MAX_LOG_LENGTH) {
          processedMessage = `${processedMessage.slice(0, MAX_LOG_LENGTH)}...`
        }

        return processedMessage
      })
      .join(' ')
  }
  static logDebug = (...messages: unknown[]) => {
    if (this.logLevel > 1) {
      const [seconds] = process.hrtime(this.startTime)
      const elapsedTime = `${seconds}s`
      console.log(
        `[🔎 %cDEBUG]: (${elapsedTime}): ${this.processMessages(messages)}`,
        'color: purple; font-size: 20px'
      )
    }
  }

  static logError = (...messages: unknown[]) => {
    const [seconds] = process.hrtime(this.startTime)
    const elapsedTime = `${seconds}s`
    console.log(
      `[🛑 %cERR]: (${elapsedTime}): ${this.processMessages(messages)}`,
      'color: red; font-size: 20px'
    )
    messages.forEach((message) => {
      /* Check if message is Error, if so, log accordingly */
      if (message instanceof Error) {
        console.error(message)
      }
    })
  }

  static logInfo = (...messages: unknown[]) => {
    if (this.logLevel > 0) {
      const [seconds] = process.hrtime(this.startTime)
      const elapsedTime = `${seconds}s`
      console.info(
        `[ℹ️  %cINFO]: (${elapsedTime}): ${this.processMessages(messages)}`,
        'color: blue; font-size: 20px'
      )
    }
  }

  static logSuccess = (...messages: unknown[]) => {
    const [seconds] = process.hrtime(this.startTime)
    const elapsedTime = `${seconds}s`
    console.log(
      `[✅ %cOK  ]: (${elapsedTime}): ${this.processMessages(messages)}`,
      'font-weight: bold; color: green; font-size: 20px'
    )
  }
  static logWarn = (...messages: unknown[]) => {
    const [seconds] = process.hrtime(this.startTime)
    const elapsedTime = `${seconds}s`
    console.warn(
      `[⚠️  %cWARN] (${elapsedTime}): ${this.processMessages(messages)}`,
      'color: orange; font-size: 20px'
    )
  }
  static logHtml = (html: string) => {
    console.log(pretty(html))
  }
  static logWithTimestamp = (
    option: LogOptions,
    title: string,
    message: string
  ) => {
    const logTitle = `[🕖 ${getTimestamp()} 🕝]: ${title}\n`
    switch (option) {
      case 'info':
        Logger.logInfo(`${logTitle}> ${message}`)
        break
      case 'error':
        Logger.logError(`${logTitle}> ${message}`)
        break
      case 'debug':
        Logger.logDebug(`${logTitle}> ${message}`)
        break
      case 'success':
        Logger.logSuccess(`${logTitle}> ${message}`)
        break
      case 'warn':
        Logger.logWarn(`${logTitle}> ${message}`)
        break
      default:
        throw new Error('[📣 LOGGER 📣]: 🔴🔴🔴 Invalid log option!')
    }
  }
}

export default Logger
