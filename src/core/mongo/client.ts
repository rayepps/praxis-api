import _ from 'radash'
import * as Mongo from 'mongodb'
import * as t from '../types'
import * as mappers from './mappers'
import { addItem, findItem, findManyItems, updateOne } from './methods'

const mid = (fullId: t.Id) => {
  return new Mongo.ObjectId(fullId.replace(/px\.(.+?)\./, ''))
}

const createMongoClient = (client: Mongo.MongoClient) => {
  const db = client.connect().then(c => c.db('main'))
  return {
    //
    // CONTACTS
    //
    addContact: addItem({
      db,
      collection: 'contacts',
      toDocument: (contact: t.Contact): t.ContactDocument => ({
        ...contact,
        _id: mid(contact.id),
        tag_map: _.mapKeys(
          _.mapValues(
            _.objectify(contact.tags, t => t),
            _t => true
          ),
          key => key.replace(/\./g, '_dot_')
        )
      })
    }),
    findContactsWithTag: findManyItems({
      db,
      collection: 'contacts',
      toQuery: ({ tag }: { tag: t.ContactTag }) => ({
        [`tag_map.${tag.replace(/\./g, '_dot_')}`]: true
      }),
      toModel: mappers.Contact.fromDocument
    }),
    findContactById: findItem({
      db,
      collection: 'contacts',
      toQuery: ({ id }: { id: t.Id<'contact'> }) => ({
        _id: mid(id)
      }),
      toModel: mappers.Contact.fromDocument
    }),
    updateContactTags: updateOne({
      db,
      collection: 'contacts',
      toQuery: ({ id }: { id: t.Id<'contact'>; tags: t.ContactTag[] }) => ({
        _id: mid(id)
      }),
      toUpdate: ({ tags }) => ({
        $set: {
          tag_map: _.mapValues(
            _.objectify(tags, t => t),
            t => true
          ),
          tags
        }
      })
    }),
    addContactSupression: updateOne({
      db,
      collection: 'contacts',
      toQuery: ({ id }: { id: t.Id<'contact'>; supression: t.ContactSupression }) => ({
        _id: mid(id)
      }),
      toUpdate: ({ supression }) => ({
        $push: {
          supressions: supression
        }
      })
    })
  }
}

export default createMongoClient

export type MongoClient = ReturnType<typeof createMongoClient>
