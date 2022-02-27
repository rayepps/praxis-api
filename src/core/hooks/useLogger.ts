import _ from 'radash'
import { Log, Severity, CoralogixLogger, LoggerConfig } from 'coralogix-logger'
import config from '../config'

//
// logger intercepts calls to console.log and sends to coralogix.
// only supports the following formats:
//
// console.log('message')
// console.log('message: ', 'value')
// console.log('message', { ... })
// console.log({ ... })
//

declare global {
  var _coralogixLogger: CoralogixLogger
}

type AnyFunc = (...args: any[]) => any

const argsToText = (args: any[]): any => {
  if (!args || args.length === 0) {
    return ''
  }
  // case: console.log('message')
  if (args.length === 1 && _.isString(args[0])) {
    return { message: args[0] }
  }
  // case: console.log({ ... })
  if (args.length === 1 && _.isObject(args[0])) {
    return args[0]
  }
  // case: console.log('message: ', 'value')
  if (args.length === 1 && _.isString(args[2])) {
    return {
      message: `${args[0]} ${args[1]}`
    }
  }
  // case: console.log('message', { ... })
  if (args.length === 1 && _.isObject(args[2])) {
    return {
      message: args[0],
      ...args[2]
    }
  }
  return { args }
}

const getLogger = () => {
  if (!global._coralogixLogger) {
    const lc = new LoggerConfig({
      privateKey: config.coralogixKey,
      applicationName: config.coralogixApplicationName,
      subsystemName: config.coralogixSubsystemName
    })
    CoralogixLogger.configure(lc)
    global._coralogixLogger = new CoralogixLogger(config.coralogixLoggerName)
  }
  return global._coralogixLogger
}

export const initLogger = () => {
  const logger = getLogger()

  const sendLog = (severity: Severity, args: any[]) => {
    process.stdout.write('x--> sending log to coralogix')
    logger.addLog(
      new Log({
        severity,
        text: argsToText(args)
      })
    )
  }

  const intercept = (severity: Severity, original: AnyFunc): AnyFunc => {
    if ((original as any).__hook === 'log.override') return original
    function logOverride(...args: any[]) {
      if (!args || args.length === 0) return
      sendLog(severity, args)
      original.apply(console, args)
    }
    logOverride.__hook = 'log.override'
    return logOverride
  }

  console.log = intercept(Severity.info, console.log)
  console.error = intercept(Severity.error, console.error)
  console.warn = intercept(Severity.warning, console.warn)
  console.debug = intercept(Severity.debug, console.debug)
}

/**
 * By exobase definitions this is a wierd hook because
 * its not a root hook or standard hook. Its used as a
 * root hook but only inits the logger and passes on the
 * next function which is the real root hook.
 */
export const useLogger = () => (func: AnyFunc) => {
  if (config.env !== 'local') {
    initLogger()
  }
  return func
}
