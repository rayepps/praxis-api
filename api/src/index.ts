/* eslint-disable @typescript-eslint/no-var-requires */
import config from './config'

const func = require(`./services/${config.service}/${config.function}.js`)

export const handler = func.default
