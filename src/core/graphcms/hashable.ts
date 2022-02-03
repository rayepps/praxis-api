import _ from 'radash'
import * as uuid from 'uuid'
import * as t from '../types'


interface HashableObject {
  hash: t.Hash
}

type Identifier<T> = (obj: T) => object

const hash = (obj: object) => {
  return uuid.v5(
    JSON.stringify(
      _.mapValues(obj, (value: any) => {
        if (value === null) return 'h.__null__'
        if (value === undefined) return 'h.__undefined__'
        return value
      })
    ), uuid.v5.DNS)
}

export default class Hashable {
  static hasChanged<T extends HashableObject>(obj: T, identifier: Identifier<T>): boolean {
    if (!obj.hash) {
      return true
    }
    const identity = identifier(obj)
    return hash(identity) !== obj.hash.raw
  }
  static hash<T extends HashableObject>(obj: T, identifier: Identifier<T>): t.Hash {
    const identity = identifier(obj)
    return {
      raw: hash(identity),
      fields: Object.keys(identity)
    }
  }
}