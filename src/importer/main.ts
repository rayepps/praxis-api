import _ from 'radash'
import * as t from '../core/types'
import formatDate from 'date-fns/format'
import path from 'path'
import fs from 'fs'
import makeGraphCMS from '../core/graphcms'
import makeMongo from '../core/mongo'
import model from '../core/model'
import slugger from 'url-slug'
import fmt from '../core/fmt'

const database = {
  companies: [],
  trainings: [],
  events: []
} as {
  companies: Omit<t.CompanyModel, 'trainings'>[]
  trainings: Omit<t.TrainingModel, 'events'>[]
  events: t.EventModel[]
}

const run = async () => {
  const graphcms = makeGraphCMS()
  const mongo = makeMongo()
  const users = await mongo.listUsers({})
  const companies = await graphcms.listCompanies()
  const ray = users.find(u => u.email === 'ray@unishine.dev')

  for (const company of companies.slice(40, 44)) {
    await sleep()

    console.log('\nimporting company: ', company.name)
    const trainings = await graphcms.listTrainingsForCompany(company.id)

    console.log(`found ${trainings.length} trainings for company`)
    const c = map.company(company, users, ray)

    const ts: Omit<t.TrainingModel, 'events'>[] = trainings.map(training => {
      return map.training(training, c, users, ray)
    })

    // Write trainings to database
    database.trainings = [...database.trainings, ...ts]

    // Write company to databse
    database.companies = [...database.companies, c]

    await sleep()
    const events = await graphcms.listEventsForCompany(company.id)

    console.log(`found ${events.length} events for ${company.name}`)

    for (const event of events) {
      const training = ts.find(tra => tra._legacyId === event.training.id)
      if (!training) {
        console.warn(event)
        throw `No training found for event`
      }
      
      const e = map.event(event, training, c, users, ray)
      // Write event to database
      database.events = [...database.events, e]
    }
  }

  console.log(`imported: ${database.companies.length} companies`)
  console.log(`imported: ${database.trainings.length} trainings`)
  console.log(`imported: ${database.events.length} events`)

  await fs.promises.unlink(path.join(__dirname, 'database.json'))
  await fs.promises.writeFile(path.join(__dirname, 'database.json'), JSON.stringify(database, null, 2), 'utf-8')
}

const sleep = async () => {
  return await new Promise(res => setTimeout(res, 1000))
}

run()
  .then(() => {
    console.log('complete!')
    process.exit(0)
  })
  .catch(err => {
    console.error(err)
    process.exit(1)
  })


const map = {
  company: (company: t.Company, users: t.User[], ray: t.User) => {
    const creator = users.find(u => u._legacyId === company.createdBy.id) ?? ray
    const updater = users.find(u => u._legacyId === company.updatedBy.id) ?? ray

    const c: Omit<t.CompanyModel, 'trainings'> = {
      id: model.id('company'),
      published: true,
      name: company.name,
      slug: company.slug ?? slugger(company.name),
      description: '',
      directLink: company.directLink,
      trackedLink: company.externalLink,
      images: [
        {
          id: company.thumbnail.id,
          url: company.thumbnail.url
        }
      ],
      _legacyId: company.id,
      createdAt: new Date(company.createdAt).getTime(),
      updatedAt: new Date(company.updatedAt).getTime(),
      updater: {
        fullName: updater.fullName,
        id: updater.id
      },
      creator: {
        fullName: creator.fullName,
        id: creator.id
      }
    }
    return c
  },
  training: (training: t.Training, company: Omit<t.CompanyModel, 'trainings'>, users: t.User[], ray: t.User) => {
    const creator = users.find(u => u._legacyId === training.createdBy.id) ?? ray
    const updater = users.find(u => u._legacyId === training.updatedBy.id) ?? ray
    const tr: Omit<t.TrainingModel, 'events'> = {
      id: model.id('training'),
      _legacyId: training.id,
      published: true,
      company,
      name: training.name,
      type: training.type,
      schedule: training.appointmentOnly ? 'appointment' : 'event',
      slug: training.slug ?? slugger(`${company.slug}-${training.name}`),
      directLink: training.directLink,
      trackedLink: training.externalLink,
      priceUnit: training.priceUnit === 'per_hour' ? 'hour' : 'course',
      price: training.price * 100, // convert to LCD (cents)
      displayPrice: fmt.price(training.price),
      tags: training.tags.map(tag => ({
        label: tag.name,
        slug: tag.slug
      })),
      description: (training.description as any as { markdown: string }).markdown,
      images: training.gallery.map(img => ({
        id: img.id,
        url: img.url
      })),
      location: !training.location
        ? null
        : {
            longitude: training.location.longitude,
            latitude: training.location.latitude,
            city: training.city,
            state: training.state,
            zip: null
          },
      createdAt: new Date(training.createdAt).getTime(),
      updatedAt: new Date(training.updatedAt).getTime(),
      updater: {
        fullName: updater.fullName,
        id: updater.id
      },
      creator: {
        fullName: creator.fullName,
        id: creator.id
      }
    }
    return tr
  },
  event: (event: t.Event, training: Omit<t.TrainingModel, 'events'>, company: Omit<t.CompanyModel, 'trainings'>, users: t.User[], ray: t.User) => {
    const creator = users.find(u => u._legacyId === event.createdBy.id) ?? ray
    const updater = users.find(u => u._legacyId === event.updatedBy.id) ?? ray
    const e: t.EventModel = {
      id: model.id('event'),
      _legacyId: event.id,
      training,
      slug: event.slug ?? slugger([
        company.slug,
        training.slug,
        training.location.city,
        training.location.state,
        formatDate(new Date(event.startDate), 'dd-mm-yyyy'),
        formatDate(new Date(event.startDate), 'dd-mm-yyyy')
      ].join('-')),
      soldOut: event.soldOut,
      start: new Date(event.startDate).getTime(),
      end: new Date(event.endDate).getTime(),
      directLink: event.directLink,
      trackedLink: event.externalLink,
      images: event.images.map(img => ({
        id: img.id,
        url: img.url
      })),
      location: !event.location
        ? null
        : {
            longitude: event.location.longitude,
            latitude: event.location.latitude,
            city: event.city,
            state: event.state,
            zip: null
          },
      published: true,
      createdAt: new Date(event.createdAt).getTime(),
      updatedAt: new Date(event.updatedAt).getTime(),
      updater: {
        fullName: updater.fullName,
        id: updater.id
      },
      creator: {
        fullName: creator.fullName,
        id: creator.id
      }
    }
    return e
  }
}