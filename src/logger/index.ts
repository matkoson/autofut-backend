/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */

import pretty from 'pretty'

import { getTimestamp } from '../utils/index.js'

enum LogLevels {
  ERROR = 0,
  INFO = 1,
  DEBUG = 2,
}

export type Log = (
  title: string,
  message: string,
  oveerrideMaxLogLength?: number
) => void
export type ErrorLog = (title: string, err: Error, message?: string) => void

const MAX_LOG_LENGTH = 100

class Logger {
  logLevel: LogLevels = LogLevels.INFO
  private static startTime: [number, number] = process.hrtime()
  TAG: string
  maxLogLength: number

  constructor(tag: string, trimCharsCount = MAX_LOG_LENGTH) {
    this.TAG = tag
    this.maxLogLength = trimCharsCount
  }
  private getElapsedTime = (elapsedSec: number) => {
    /* in sec */
    /* in min */
    const inMinutes = Math.floor(elapsedSec / 60)

    return `${inMinutes}m:${elapsedSec}s`
  }

  private processMessages = (
    messages: unknown[],
    maxLogLength = this.maxLogLength
  ) => {
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

        if (processedMessage.length > maxLogLength) {
          processedMessage = `${processedMessage.slice(0, maxLogLength)}...`
        }

        return processedMessage
      })
      .join(' ')
  }
  logDebug: Log = (title, message, overrideMaxLogLength) => {
    if (this.logLevel > 1) {
      const logTitle =
        title === this.TAG
          ? `[🕖 ${getTimestamp()} 🕝]:${this.TAG}\n`
          : `[🕖 ${getTimestamp()} 🕝]:${this.TAG}${title}\n`
      const [seconds] = process.hrtime(Logger.startTime)
      const elapsedTime = this.getElapsedTime(seconds)
      const logMessage = `${logTitle}> ${message}`
      console.log(
        `[🔎 %cDEBUG]:(${elapsedTime}): ${this.processMessages(
          [logMessage],
          overrideMaxLogLength || this.maxLogLength
        )}`,
        'color: purple; font-size: 20px'
      )
    }
  }

  logError: ErrorLog = (title, err: Error, message?: string) => {
    const logTitle =
      title === this.TAG
        ? `[🕖 ${getTimestamp()} 🕝]:${this.TAG}\n`
        : `[🕖 ${getTimestamp()} 🕝]:${this.TAG}${title}\n`
    const [seconds] = process.hrtime(Logger.startTime)
    const elapsedTime = this.getElapsedTime(seconds)
    const logMessage = `🔴${message}🔴`
    const log = `${logTitle}> ${logMessage}`
    console.log(
      `[🛑 %cERR]:(${elapsedTime}): ${this.processMessages(
        [log],
        this.maxLogLength * 2
      )}`,
      'color: red; font-size: 20px'
    )
    if (err) {
      const error = err as Error
      console.error(error.stack)
    }
  }

  logInfo: Log = (title, message, overrideMaxLogLength) => {
    if (this.logLevel > 0) {
      const logTitle =
        title === this.TAG
          ? `[🕖 ${getTimestamp()} 🕝]:${this.TAG}\n`
          : `[🕖 ${getTimestamp()} 🕝]:${this.TAG}${title}\n`
      const [seconds] = process.hrtime(Logger.startTime)
      const elapsedTime = this.getElapsedTime(seconds)
      const logMessage = `${logTitle}> ${message}`
      console.info(
        `[ℹ️  %cINFO]:(${elapsedTime}):\n${this.processMessages(
          [logMessage],
          overrideMaxLogLength || this.maxLogLength
        )}`,
        'color: blue; font-size: 20px'
      )
    }
  }

  logSuccess: Log = (title, message) => {
    const logTitle =
      title === this.TAG
        ? `[🕖 ${getTimestamp()} 🕝]:${this.TAG}\n`
        : `[🕖 ${getTimestamp()} 🕝]:${this.TAG}${title}\n`
    const [seconds] = process.hrtime(Logger.startTime)
    const elapsedTime = this.getElapsedTime(seconds)
    const logMessage = `🟢${message}🟢`
    const log = `${logTitle}> ${logMessage}`
    console.log(
      `[✅ %cOK  ]:(${elapsedTime}): ${this.processMessages(
        [log],
        this.maxLogLength * 2
      )}`,
      'font-weight: bold; color: green; font-size: 20px'
    )
  }
  logWarn: Log = (title, message, overrideMaxLogLength) => {
    const logTitle =
      title === this.TAG
        ? `[🕖 ${getTimestamp()} 🕝]:${this.TAG}\n`
        : `[🕖 ${getTimestamp()} 🕝]:${this.TAG}${title}\n`
    const [seconds] = process.hrtime(Logger.startTime)
    const elapsedTime = this.getElapsedTime(seconds)
    const logMessage = `🟡${message}🟡`
    const log = `${logTitle}> ${logMessage}\n`
    console.warn(
      `[⚠️  %cWARN]:(${elapsedTime}): ${this.processMessages(
        [log],
        overrideMaxLogLength || this.maxLogLength
      )}`,
      'color: orange; font-size: 20px'
    )
  }
  logHtml = (html: string) => {
    console.log(pretty(html))
  }
}

export default Logger
