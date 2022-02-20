import _ from 'radash'
import config from '../core/config'
import axios from 'axios'
import csv from 'csvtojson'
import { gql, GraphQLClient } from 'graphql-request'
import { GeoClient } from '../core/geo/client'
import NodeGeocoder from 'node-geocoder'

const DEBUG = false

const rest = (ms: number = 1000): Promise<void> => new Promise(res => setTimeout(res, ms))

// - companies
// - leaders -> instructors
// - trainings
// - events
const csvFile = (name: string) => {
  return `${__dirname}/exported/${name}.csv`
}

const slug = (str: string) => {
  return str.toLowerCase().replace(/\s/g, '').replace(/[^a-z0-9]/g, '-')
}

const client = new GraphQLClient(config.graphcmsApiUrl, {
  headers: {
    authorization: `Bearer ${config.graphcmsApiToken}`
  }
})

const geo = new GeoClient(
  NodeGeocoder({
    provider: 'google',
    apiKey: config.googleGeocodingApiKey
  })
)

//
//
//  KICKOFF ------>>>
//
//

async function run() {
  const companies: CompanyRow[] = await csv().fromFile(csvFile('companies'))
  const trainings: TrainingRow[] = await csv().fromFile(csvFile('trainings'))
  const events: EventRow[] = await csv().fromFile(csvFile('events'))
  for (const company of companies.slice(23, 24)) {
    await rest()

    // Create the company
    const companyId = await createCompany(company)

    for (const training of trainings.filter(t => t.company === company.slug)) {
      await rest()

      // Create the trainings for the company
      const trainingId = await createTraining(training, companyId, company.key)

      for (const event of events.filter(e => e.training === training.slug)) {
        await rest()
        await createEvent(event, trainingId)
      }

    }


  }
}

//
//
//  COMPANY
//
//

type CompanyRow = {
  name: string
  slug: string
  collectionId: string
  itemId: string
  createdOn: string
  updatedOn: string
  publishedOn: string
  url: string
  leadership: string
  description: string
  logo: string
  key: string
}

async function createCompany(data: CompanyRow) {

  console.log('Creating company: ', data.name)

  const thumbnailId = await createAsset(data.logo)

  const mutation = gql`
    mutation addCompany($data: CompanyCreateInput!) {
      createCompany(data: $data) {
        id
      }
    }
  `

  const input = {
    name: data.name,
    key: data.key,
    link: data.url,
    description: data.description,
    slug: slug(`${data.key}-${data.name}`),
    thumbnail: {
      connect: {
        id: thumbnailId
      }
    }
  }

  console.log(JSON.stringify(input, null, 4))

  if (DEBUG) {
    return 'company1'
  }

  const response = await client.request<{ createCompany: { id: string } }>(mutation, {
    data: input
  })

  return response.createCompany.id
}

//
//
//  ASSETS
//
//

type FileStackResponse = {
  container: string
  filename: string
  handle: string
  key: string
  size: number
  type: "image/png"
  url: string
}

type FileStackMetadataResponse = {
  display_name: string
  filename: string
  is_dir: false
  link_path: string
  metadata: {
    size: number
    width: number
    height: number
  }
  modified: string
  size: number
  thumb_exists: true
  thumbnail: string
  type: string
}

async function createAsset(inputUrl: string): Promise<string> {

  console.log('Creating asset: ', inputUrl)

  const url = inputUrl.trim()

  const fileStackApiKey = 'AnAXRoliZQTGfeNBqIP1wz'
  const fileStackPath = 'cku61s35n249z01xn3gsr4cys/cku61s35o24a301xn0aw52sx0/'

  const { data: metadata } = await axios.post<FileStackMetadataResponse>('https://cloud.filestackapi.com/metadata', {
    "apikey": fileStackApiKey,
    url
  })

  const { data: asset } = await axios.post<FileStackResponse>('https://process.filestackapi.com/process', {
    "apikey": fileStackApiKey,
    "sources": [
      url
    ],
    "tasks": [{
      "name": "store",
      "params": {
        "path": fileStackPath
      }
    }]
  })

  const mutation = gql`
    mutation addAsset($data: AssetCreateInput!) {
      createAsset(data: $data) {
        id
      }
    }
  `

  const input = {
    fileName: metadata.filename,
    handle: asset.handle,
    height: metadata.metadata.height,
    mimeType: metadata.type,
    size: metadata.size,
    width: metadata.metadata.width
  }

  console.log(JSON.stringify(input, null, 4))

  if (DEBUG) {
    return 'asset1'
  }

  const response = await client.request<{ createAsset: { id: string } }>(mutation, {
    data: input
  })

  return response.createAsset.id
}


//
//
//  TRAININGS
//
//

type TrainingRow = {
  name: string
  slug: string
  collectionId: string
  itemId: string
  createdOn: string
  updatedOn: string
  publishedOn: string
  displayName: string
  thumbnail: string
  galleryImages: string
  content: string
  type: string
  link: string
  company: string
  tags: string
  price: string
  membershipPrice: string
}

async function createTraining(data: TrainingRow, companyId: String, companyKey: string) {

  console.log('Creating training: ', data.displayName)

  const imageLinks = _.unique([
    ...(data.galleryImages ?? '').split(';'),
    data.thumbnail
  ]).filter(i => !!i)

  const galleryAssets = await _.asyncMap<string, { link: string, assetId: string }>(imageLinks)(async (link) => {
    const assetId = await createAsset(link)
    return {
      link,
      assetId
    }
  })

  const tags = data.tags.split(';').filter(t => !!t).map(t => t.trim())

  const mutation = gql`
    mutation addTraining($data: TrainingCreateInput!) {
      createTraining(data: $data) {
        id
      }
    }
  `

  const input = {
    name: data.displayName,
    link: data.link,
    slug: slug(`${companyKey}-${data.name}`),
    price: !data.price ? 0 : parseInt(data.price.replace(/[\$\,]/g, '')),
    description: {
      children: []
    },
    gallery: {
      connect: galleryAssets.map(asset => ({
        id: asset.assetId
      }))
    },
    type: data.type,
    company: {
      connect: {
        id: companyId
      }
    },
    tags: {
      connect: tags.map(tag => ({
        slug: tag
      }))
    }
  }

  console.log(JSON.stringify(input, null, 4))

  if (DEBUG) {
    return 'training1'
  }

  const response = await client.request<{ createTraining: { id: string } }>(mutation, {
    data: input
  })

  return response.createTraining.id
}


//
//
//  EVENT
//
//

type EventRow = {
  name: string
  slug: string
  collectionId: string
  itemId: string
  createdOn: string
  updatedOn: string
  publishedOn: string
  startDate: string
  endDate: string
  month: string
  location: string
  link: string
  company: string
  leader: string
  leaderUnknown: string
  training: string
  isOneDayEvent: boolean
}

const createEvent = async (data: EventRow, trainingId: string) => {
  console.log(`Creating event: ${data.name} in ${data.location} on ${data.startDate}`)

  const location = await geo.lookupAddress(data.location)

  const mutation = gql`
    mutation addEvent($data: EventCreateInput!) {
      createEvent(data: $data) {
        id
      }
    }
  `

  const input = {
    startDate: data.startDate ? new Date(data.startDate).toISOString() : null,
    endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
    link: data.link,
    location: {
      longitude: location.lon,
      latitude: location.lat
    },
    training: {
      connect: {
        id: trainingId
      }
    }
  }

  console.log(JSON.stringify(input, null, 4))

  if (DEBUG) {
    return 'event1'
  }

  const response = await client.request<{ createEvent: { id: string } }>(mutation, {
    data: input
  })

  return response.createEvent.id
}


run().then(() => {
  console.log('all done!')
}).catch(err => {
  console.error(err)
})
