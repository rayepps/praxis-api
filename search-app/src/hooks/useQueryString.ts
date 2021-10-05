


// const parseValue = function myself(str: string): boolean | any[] | number | string {
//   if (str === 'true') return true
//   if (str === 'false') return false
//   if (str.startsWith('[') && str.endsWith(']')) {
//     // eslint-disable-next-line no-useless-escape
//     return str.replace(/[\[\]]/g, '').split(',').map(myself)
//   }
//   const num = parseFloat(str)
//   if (!Number.isNaN(num)) return num
//   return str
// }

// const unwrapQuery = (obj: object): object => {
//   return Object.entries(obj).reduce((acc: Record<string, any>, item) => {
//     const [k, v] = item
//     const keys = k.split('.')
//     let value = {
//       [keys[keys.length - 1]]: parseValue(v)
//     } as object
//     for (const key of keys.slice(0, -1).reverse()) {
//       value = { [key]: value }
//     }
//     return mergeDeep(acc, value) as object
//   }, {} as Record<string, object>)
// }

export function useQueryString<T>(): T {
  return {} as T
  // const queryString = window.location.search
  // const params = new URLSearchParams(queryString)
  // const flat = paramsToObject(params) // { 'filter.tags': 'x,y,z' }
  // if (!flat) return {} as T
  // return unwrapQuery(flat) as any as T // { filter: { tags: ['x', 'y', 'z' ]}}
}