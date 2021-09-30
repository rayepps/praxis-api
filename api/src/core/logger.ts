import config from '../config'

/**
 * Debug log level will log everything
 * Silent log level will log nothing
 * Default log level will log warnings and errors
 */
export enum LogLevel {
    silent = 'silent',
    default = 'default',
    verbose = 'verbose',
    debug = 'debug'
}

export type LogFunc = (...args: any) => void

export class Logger {

    level: LogLevel
    log: LogFunc
    warn: LogFunc
    error: LogFunc
    debug: LogFunc

    constructor(logLevel?: LogLevel) {
        const level = logLevel ?? LogLevel.default
        const shouldDebug = level === LogLevel.debug
        const shouldLog = [LogLevel.debug, LogLevel.verbose].includes(level)
        const shouldWarn = [LogLevel.debug, LogLevel.verbose, LogLevel.default].includes(level)
        const shouldError = level !== LogLevel.silent

        const pass = () => { }

        this.debug = shouldDebug ? console.log : pass
        this.log = shouldLog ? console.log : pass
        this.warn = shouldWarn ? console.warn : pass
        this.error = shouldError ? console.error : pass
        this.level = level
    }
}

const logger = config.logLevel ? new Logger(config.logLevel as LogLevel) : new Logger()

export default logger