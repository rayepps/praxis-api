import _ from 'radash'

function mergeDeep(target: Record<string, any>, ...sources: Record<string, any>[]): object {
    if (!sources.length) return target
    const source = sources.shift()
  
    if (_.isObject(target) && _.isObject(source)) {
      for (const key in source) {
        if (_.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} })
          mergeDeep(target[key], source[key])
        } else {
          Object.assign(target, { [key]: source[key] })
        }
      }
    }
    return mergeDeep(target, ...sources)
  }

const paramsToObject = (entries: any) => {
    const result: { [key: string]: string } = {}
    for (const entry of entries) {
        const [key, value] = entry as [string, string]
        result[key] = value
    }
    return result
}

const parseValue = function myself(str: string): boolean | any[] | number | string {
    if (str === 'true') return true
    if (str === 'false') return false
    if (str.startsWith('[') && str.endsWith(']')) {
        // eslint-disable-next-line no-useless-escape
        return str.replace(/[\[\]]/g, '').split(',').map(myself)
    }
    const num = parseFloat(str)
    if (!Number.isNaN(num)) return num
    return str
}

const unwrapQuery = (obj: object): object => {
    return Object.entries(obj).reduce((acc: Record<string, any>, item) => {
        const [k, v] = item
        const keys = k.split('.')
        let value = {
            [keys[keys.length-1]]: parseValue(v)
        } as object
        for (const key of keys.slice(0, -1).reverse()) {
            value = { [key]: value }
        }
        return mergeDeep(acc, value) as object
    }, {} as Record<string, object>)
}

export function useQueryString<T>(): T {
    const queryString = window.location.search
    const params = new URLSearchParams(queryString)
    const flat = paramsToObject(params) // { 'filter.tags': 'x,y,z' }
    if (!flat) return {} as T
    return unwrapQuery(flat) as any as T // { filter: { tags: ['x', 'y', 'z' ]}}
}