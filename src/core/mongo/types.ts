import * as t from '../model/types'
import type { ObjectId } from 'mongodb'

export interface MongoDocument {
  _id: ObjectId
}

// When writing to mongo document we map
// the tags[] array to an object keyed by
// the tag name so we can do fast/easy
// collection queries by tag.
export type ContactDocument = MongoDocument & t.Contact & {
  tag_map: { [tag: string]: true }
}

export type UserDocument = MongoDocument & t.User