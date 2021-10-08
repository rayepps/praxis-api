import _ from 'radash'
import config from '../config'
import runtime from './runtime'


export type LogFunc = (arg: any) => void

type LogData = { [key: string]: any } & { message: string }


const log = (func: LogFunc, message: string | LogData, data?: object): void => {
  // eslint-disable-next-line no-extra-boolean-cast
  const payload: object = !!data
    ? { ...data, message }
    : _.isString(message)
      ? { message: message as string }
      : message as LogData
  func({
    source: 'praxis.api',
    rid: runtime.rid(),
    service: config.service,
    function: config.function,
    version: config.version,
    ...payload
  })
}

const Funcs = {
  log: (arg: any) => console.log(arg),
  warn: (arg: any) => console.warn(arg),
  error: (arg: any) => console.error(arg),
  debug: (arg: any) => console.debug(arg),
}

export class Logger {

  log(message: string): void
  log(data: LogData): void
  log(message: string, data: object): void
  log(message: string | LogData, data?: object): void {
    log(Funcs.log, message, data)
  }

  warn(message: string): void
  warn(data: LogData): void
  warn(message: string, data: object): void
  warn(message: string | LogData, data?: object): void {
    log(Funcs.warn, message, data)
  }

  error(message: string): void
  error(data: LogData): void
  error(message: string, data: object): void
  error(message: string | LogData, data?: object): void {
    log(Funcs.error, message, data)
  }

  debug(message: string): void
  debug(data: LogData): void
  debug(message: string, data: object): void
  debug(message: string | LogData, data?: object): void {
    log(Funcs.debug, message, data)
  }

}

export default new Logger()