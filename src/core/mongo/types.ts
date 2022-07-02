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

export type CompanyDocument = MongoDocument & Omit<t.CompanyModel, 'trainings'>

export type TrainingDocument = MongoDocument & Omit<t.TrainingModel, 'events'> & {
  _companyId: ObjectId
}

export type EventDocument = MongoDocument & t.EventModel & {
  _trainingId: ObjectId
  _companyId: ObjectId
  _tags: Record<string, true> /** <tag.slug, true> **/
}