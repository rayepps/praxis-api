import _ from 'radash'
import flat from 'flat'

const typify = (obj: Record<string, any>): Record<string, any> => {
  const toType = (value: any): any => {
    if (value === 'true') return true
    if (value === 'false') return false
    if (_.isArray(value)) return (value as any[]).map(toType)
    if (_.isObject(value)) return typify(value)
    const num = parseInt(value)
    if (!Number.isNaN(num)) return num
    return value
  }
  return Object.entries(obj).reduce((acc, [key, value]) => ({
    ...acc,
    [key]: toType(value)
  }), {} as Record<string, any>)
}

/**
 * Converts an object into a complex query
 * string. Does not handle arrays of objects.
 */
const serialize = (obj: any): string => {
  const props = flat.flatten(obj) as Record<string, any>
  return new URLSearchParams(props).toString()
}

/**
 * Converts a query string that was created by
 * the serialize function back into the original
 * object
 */
const deserialize = <T>(qs: string): T => {
  const urlSearchParams = new URLSearchParams(qs)
  const params = Object.fromEntries(urlSearchParams.entries())
  const data = flat.unflatten(params)
  return typify(data as any) as T
}

export default {
  serialize,
  deserialize
}