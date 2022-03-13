import _ from 'radash'
import * as uuid from 'uuid'
import type { Props, ApiFunction } from '@exobase/core'
import { CacheClient } from '../cache'

export type Config<T = any, R = any> = {
  /**
   * Set the specified expire time, in seconds
   */
  key: string
  ttl: number
  argsToIdentity: (args: T) => any
  responseToCache: (response: R) => string
  cacheToResponse: (cached: string) => R
}

const configDefaults: Partial<Config> = {
  ttl: 60 * 60, // 1 hour in seconds
  argsToIdentity: a => a,
  responseToCache: r => JSON.stringify(r),
  cacheToResponse: c => JSON.parse(c)
}

const hash = (obj: object) => {
  return uuid.v5(
    JSON.stringify(
      _.mapValues(obj, (value: any) => {
        if (value === null) return 'h.__null__'
        if (value === undefined) return 'h.__undefined__'
        return value
      })
    ),
    uuid.v5.DNS
  )
}

const flatten = (obj: any, prefix: string | null = null) => {
  return Object.keys(obj).reduce((acc, key) => {
    const k = !prefix ? key : `${prefix}.${key}`
    return !obj[key] || typeof obj[key] !== 'object'
      ? { ...acc, [k]: obj[key] }
      : { ...acc, ...flatten(obj[key], k) }
  }, {})
}

export async function withCachedResponse(func: ApiFunction, config: Config, props: Props<any, { cache: CacheClient }>) {
  const skipCacheHeader = props.req.headers['x-skip-cache']
  if (skipCacheHeader === 'yes') {
    console.debug('Skipping cache per X-Skip-Cache header')
    return await func(props)
  }
  const key = `${config.key}.${hash(flatten(config.argsToIdentity(props.args)))}`
  const cached = await props.services.cache.get(key)
  if (cached) {
    console.debug(`Cache hit for key: ${key}`)
    return config.cacheToResponse(cached)
  }
  console.debug(`Cache miss key: ${key}`)
  const response = await func(props)
  await props.services.cache.set(key, config.responseToCache(response), { ttl: config.ttl })
  return response
}

export const useCachedResponse =
  <TArgs, TResponse>(config: Partial<Config<TArgs, TResponse>> & { key: string }) =>
  (func: ApiFunction) => {
    return _.partial(withCachedResponse, func, { ...configDefaults, ...config })
  }
