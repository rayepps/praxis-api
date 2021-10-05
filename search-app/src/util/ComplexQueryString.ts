import flat from 'flat'

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
  return flat.unflatten(params) as T
}

export default {
  serialize,
  deserialize
}