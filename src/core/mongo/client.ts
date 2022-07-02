import _ from 'radash'
import * as Mongo from 'mongodb'
import * as t from '../types'
import * as mappers from './mappers'
import { addItem, findItem, findManyItems, updateOne } from './methods'

/**
 * Mongo Id
 */
const mid = (id: t.Id<any>) => {
  return new Mongo.ObjectId(id.replace(/px\.(.+?)\./, ''))
}

/**
 * Strip Id Prefix
 */
const deprefix = (id: t.Id<any>) => id.replace(/px\.(.+?)\./, '')

const createMongoClient = (client: Mongo.MongoClient) => {
  const db = client.connect().then(c => c.db('main'))
  return {
    //
    // USERS
    //
    findUserByEmail: findItem({
      db,
      collection: 'users',
      toQuery: ({ email }: { email: string }) => ({
        email
      }),
      toModel: mappers.User.toModel
    }),
    listUsers: findManyItems({
      db,
      collection: 'users',
      toQuery: () => {},
      toModel: mappers.User.toModel
    }),

    //
    // CONTACTS
    //
    addContact: addItem({
      db,
      collection: 'contacts',
      toDocument: (contact: t.Contact): t.ContactDocument => ({
        ...contact,
        _id: mid(contact.id),
        tag_map: _.objectify(
          contact.tags,
          t => t.replace(/\./g, '_dot_'),
          t => true
        )
      })
    }),
    findContactsWithTag: findManyItems({
      db,
      collection: 'contacts',
      toQuery: ({ tag }: { tag: t.ContactTag }) => ({
        [`tag_map.${tag.replace(/\./g, '_dot_')}`]: true
      }),
      toModel: mappers.Contact.toModel
    }),
    findContactById: findItem({
      db,
      collection: 'contacts',
      toQuery: ({ id }: { id: t.Id<'contact'> }) => ({
        _id: mid(id)
      }),
      toModel: mappers.Contact.toModel
    }),
    updateContactTags: updateOne({
      db,
      collection: 'contacts',
      toQuery: ({ id }: { id: t.Id<'contact'>; tags: t.ContactTag[] }) => ({
        _id: mid(id)
      }),
      toUpdate: ({ tags }) => ({
        $set: {
          tag_map: _.objectify(
            tags,
            t => t,
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
    }),

    //
    // COMPANY
    //
    addCompany: addItem({
      db,
      collection: 'companies',
      toDocument: (company: t.CompanyModel): t.CompanyDocument => ({
        _id: mid(company.id),
        ..._.shake<'trainings', t.CompanyModel>({
          ...company,
          trainings: undefined
        })
      })
    }),
    findCompanyById: findItem({
      db,
      collection: 'companies',
      toQuery: ({ id }: { id: t.Id<'company'> }) => ({
        _id: mid(id)
      }),
      toModel: mappers.Company.toModel
    }),
    updateCompany: updateOne({
      db,
      collection: 'companies',
      toQuery: ({ id }: { id: t.Id<'company'>; patch: Partial<t.CompanyModel> }) => ({
        _id: mid(id)
      }),
      toUpdate: ({ patch }) => ({
        $push: {
          ..._.shake<'trainings', Partial<t.CompanyModel>>({
            ...patch,
            trainings: undefined
          })
        }
      })
    }),
    
    //
    // TRAINING
    //
    addTraining: addItem({
      db,
      collection: 'trainings',
      toDocument: (training: t.TrainingModel): t.TrainingDocument => ({
        _id: mid(training.id),
        _companyId: mid(training.company.id),
        ..._.shake<'events', t.TrainingModel>({
          ...training,
          events: undefined
        })
      })
    }),
    findTrainingById: findItem({
      db,
      collection: 'trainings',
      toQuery: ({ id }: { id: t.Id<'training'> }) => ({
        _id: mid(id)
      }),
      toModel: mappers.Training.toModel
    }),
    updateTraining: updateOne({
      db,
      collection: 'trainings',
      toQuery: ({ id }: { id: t.Id<'company'>; patch: Partial<t.TrainingModel> }) => ({
        _id: mid(id)
      }),
      toUpdate: ({ patch }) => ({
        $push: {
          ...patch,
          events: undefined,
          _companyId: patch.company ? mid(patch.company.id) : undefined
        }
      })
    }),
    
    //
    // EVENTS
    //
    addEvent: addItem({
      db,
      collection: 'events',
      toDocument: (event: t.EventModel): t.EventDocument => ({
        _id: mid(event.id),
        _companyId: mid(event.training.company.id),
        _trainingId: mid(event.training.id),
        _tags: _.objectify(event.training.tags, t => t.slug, t => true),
        ...event
      })
    }),
    findEventById: findItem({
      db,
      collection: 'events',
      toQuery: ({ id }: { id: t.Id<'event'> }) => ({
        _id: mid(id)
      }),
      toModel: mappers.Event.toModel
    }),
    findEventBySlug: findItem({
      db,
      collection: 'events',
      toQuery: ({ slug }: { slug: string }) => ({
        slug
      }),
      toModel: mappers.Event.toModel
    }),
    updateEvent: updateOne({
      db,
      collection: 'events',
      toQuery: ({ id }: { id: t.Id<'company'>; patch: Partial<t.EventModel> }) => ({
        _id: mid(id)
      }),
      toUpdate: ({ patch }) => ({
        $push: {
          ...patch,
          _companyId: patch.training ? mid(patch.training.company.id) : undefined,
          _trainingId: patch.training ? mid(patch.training.id) : undefined,
          _tags: patch.training ? _.objectify(patch.training.tags, t => t.slug, t => true) : undefined,
        }
      })
    }),
    searchEvents: findManyItems({
      db,
      collection: 'events',
      toQuery: ({
        type,
        tags,
        state,
        city,
        companyId,
        date,
        near
      }: {
        pageSize: number
        page: number
        order?: t.EventSearchOrder
        type?: t.TrainingType
        tags?: string[]
        state?: string
        city?: string
        companyId?: t.Id<'company'>
        date?: string | `${string}-${string}`
        near?: {
          latitude: number
          longitude: number
          proximity: number
        }
      }) =>
        _.shake({
          _location: !near
            ? undefined
            : {
                $near: {
                  $geometry: {
                    type: 'Point',
                    coordinates: [near.latitude, near.longitude]
                  },
                  $maxDistance: near.proximity
                }
              },
          _userId: !posterId ? undefined : mid(posterId),
          _categoryId: !categoryId ? undefined : mid(categoryId),
          _text: !keywords
            ? undefined
            : {
                $regex: keywords.split(' ').join('|'),
                $options: 'i'
              }
        }),
      toOptions: args => ({
        skip: args.page > 0 ? args.page * args.pageSize : undefined,
        limit: args.pageSize,
        sort: (() => {
          console.log('SORT: ', args.order)
          if (!args.order) return undefined
          const [field, dir] = args.order.split(':') as ['price' | 'created-at' | 'date', 'asc' | 'desc']
          const dirNum = dir === 'asc' ? -1 : 1
          if (field === 'price') {
            return { price: dirNum }
          }
          if (field === 'created-at') {
            return { start: dirNum }
          }
          if (field === 'date') {
            return { start: dirNum }
          }
        })()
      }),
      toModel: mappers.Event.toModel
    }),
  }
}

export default createMongoClient

export type MongoClient = ReturnType<typeof createMongoClient>
