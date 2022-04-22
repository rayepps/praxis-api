import { gql, GraphQLClient } from 'graphql-request'
import * as t from '../types'
import { slugger } from '../model'
import { ENRICHMENT_VERSION } from '../const'
import addDays from 'date-fns/addDays'
import parseDate from 'date-fns/parse'

/**
 * Graphql Object Notation
 * Takes in json object and gives back Graph QL
 * friendly query object. In simple terms, gives
 * back the json object stringified without quotes
 * around the keys.
 *
 * in: { "name": "ray" }
 * out: "{ name: \"ray\" }"
 */
// const gon = (obj: object) => {
//   return JSON.stringify(obj, null, 2).replace(
//     /\"([A-Za-z_0-9]+)\"\:/g, (_match, name) => `${name}:`
//   )
// }

// type ItemType = 'company' | 'event' | 'training'

export class GraphCMS {
  constructor(private client: GraphQLClient) {}

  async findTraining(id: string): Promise<t.Training> {
    const query = gql`
      query findTrainingById {
        training(where: {
          id: "${id}"
        }) {
          id
          slug
          type
          name
          directLink
          externalLink
          price
          displayPrice
          priceUnit
          city
          state
          appointmentOnly
          location {
            latitude
            longitude
          }
          company {
            id
            name
            directLink
            externalLink
            thumbnail {
              id
              url
            }
          }
          gallery {
            id
          }
          tags {
            id
            name
            slug
          }
          thumbnail {
            url
          }
          hash
        }
      }
    `
    const response = await this.client.request<{ training: t.Training }>(query)
    return response.training
  }

  async findTrainingAuthor(id: string): Promise<t.Author> {
    const query = gql`
      query findTrainingAuthor {
        training(where: {
          id: "${id}"
        }) {
          updatedBy {
            id
            name
          }
        }
      }
    `
    const response = await this.client.request<{ training: Partial<t.Training> }>(query)
    return response.training.updatedBy
  }

  async findEventsInThePast(): Promise<t.Event[]> {
    const query = gql`
      query FindPastEvents($where: EventWhereInput!) {
        events(where: $where) {
          id
          startDate
          endDate
        }
      }
    `
    const response = await this.client.request<{ events: t.Event[] }>(query, {
      where: {
        startDate_lt: new Date().toISOString()
      }
    })
    return response.events
  }

  async unpublishEvent(event: t.Event): Promise<void> {
    const mutation = gql`
      mutation UnpublishEvent {
        unpublishEvent(where: {
          id: "${event.id}"
        }) {
          id
        }
      }
    `
    await this.client.request(mutation)
  }

  async findEventBySlug(slug: string): Promise<t.Event> {
    const query = gql`
      query findEvent {
        event(where: {
          slug: "${slug}"
        }) {
          id
          createdAt
          startDate
          endDate
          city
          state
          directLink
          externalLink
          soldOut
          images {
            url
          }
          training {
            id
            slug
            price
            displayPrice
            name
            tags {
              id
              slug
              name
            }
            description {
              markdown
              html
            }
            thumbnail {
              url
            }
            gallery {
              url
            }
            company {
              name
              slug
              directLink
              externalLink
              thumbnail {
                url
              }
            }
          }
          location {
            latitude
            longitude
          }
          hash
          updatedBy {
            id
            name
          }
        }
      }
    `
    const response = await this.client.request<{ event: t.Event }>(query)
    return response.event
  }

  async findEvent(id: string): Promise<t.Event> {
    const query = gql`
      query findEvent {
        event(where: {
          id: "${id}"
        }) {
          id
          createdAt
          startDate
          endDate
          city
          state
          directLink
          externalLink
          soldOut
          images {
            url
          }
          training {
            id
            slug
            price
            displayPrice
            name
            priceUnit
            tags {
              id
              slug
              name
            }
            description {
              markdown
              html
            }
            thumbnail {
              url
            }
            gallery {
              url
            }
            company {
              name
              slug
              directLink
              externalLink
              thumbnail {
                url
              }
            }
          }
          location {
            latitude
            longitude
          }
          hash
          updatedBy {
            id
            name
          }
        }
      }
    `
    const response = await this.client.request<{ event: t.Event }>(query)
    return response.event
  }

  async updateEvent(id: string, patch: Partial<t.Event>): Promise<void> {
    const mutation = gql`
      mutation UpdateEvent($data: EventUpdateInput!) {
        updateEvent(where: {
          id: "${id}"
        }, data: $data) {
          id
        }
      }
    `
    await this.client.request(mutation, {
      data: patch
    })
  }

  async findEventAuthor(id: string): Promise<t.Author> {
    const query = gql`
      query findEventAuthor {
        event(where: {
          id: "${id}"
        }) {
          updatedBy {
            id
            name
          }
        }
      }
    `
    const response = await this.client.request<{ event: Partial<t.Event> }>(query)
    return response.event.updatedBy
  }

  async enrichEvent(id: string, data: Partial<t.Event>): Promise<void> {
    const mutation = gql`
      mutation EnrichEvent($data: EventUpdateInput!) {
        updateEvent(
          where: {
            id: "${id}"
          }, 
          data: $data
        ) {
          id
        }
      }
    `
    await this.client.request(mutation, {
      data: {
        ...data,
        enrichmentVersion: ENRICHMENT_VERSION,
        enrichedAt: new Date().toISOString()
      }
    })
  }

  async enrichTraining(id: string, patch: Partial<t.Training>): Promise<void> {
    const mutation = gql`
      mutation enrichTraining($data: TrainingUpdateInput!) {
        updateTraining(
          where: {
            id: "${id}"
          }
          data: $data
        ) {
          id
        }
      }
    `
    const data: any = patch
    if (patch.gallery) {
      data.gallery = {
        connect: patch.gallery.map(asset => ({
          where: {
            id: asset.id
          }
        }))
      }
    }
    if (patch.thumbnail) {
      data.thumbnail = {
        connect: {
          id: patch.thumbnail.id
        }
      }
    }
    await this.client.request(mutation, {
      data: {
        ...data,
        enrichmentVersion: ENRICHMENT_VERSION,
        enrichedAt: new Date().toISOString()
      }
    })
  }

  async listCitiesInState(state: t.USState): Promise<string[]> {
    const query = gql`
      query ListLocationsInState {
        locationMappings(where:{
          state: ${state}
        }) {
          city
        }
      }
    `
    const response = await this.client.request<{ locationMappings: t.LocationMapping[] }>(query)
    return response.locationMappings.map(lm => lm.city)
  }

  async findLocationMapping(state: t.USState, city: string): Promise<t.LocationMapping> {
    const query = gql`
      query findLocationMapping {
        locationMapping(where: {
          slug: "${slugger(state, city)}"
        }) {
          city
          state
          slug
        }
      }
    `
    const response = await this.client.request<{ locationMapping: t.LocationMapping }>(query)
    return response.locationMapping
  }

  async createLocationMapping(event: t.Event): Promise<void> {
    const mutation = gql`
      mutation MakeLocationMapping($data: LocationMappingCreateInput!) {
        createLocationMapping(data: $data) {
          id
        }
      }
    `
    await this.client.request(mutation, {
      data: {
        city: event.city,
        state: event.state,
        slug: slugger(event.state, event.city),
        events: {
          connect: [
            {
              id: event.id
            }
          ]
        }
      }
    })
  }

  async connectToLocationMapping(event: t.Event): Promise<void> {
    const locationMapping = await this.findLocationMapping(event.state, event.city)
    if (!locationMapping) {
      // Create a new one
      await this.createLocationMapping(event)
      return
    }
    // Connect to the existing one
    const mutation = gql`
      mutation UpdateLocationMapping($data: LocationMappingUpdateInput!) {
        updateLocationMapping(where: {
          slug: "${slugger(event.state, event.city)}"
        }, data: $data) {
          id
        }
      }
    `
    await this.client.request(mutation, {
      data: {
        events: {
          connect: [
            {
              where: {
                id: event.id
              }
            }
          ]
        }
      }
    })
  }

  async disconnectFromLocationMapping(event: t.Event): Promise<void> {
    const mutation = gql`
      mutation RemoveLocationMapping($data: LocationMappingUpdateInput!) {
        updateLocationMapping(where: {
          slug: "${slugger(event.state, event.city)}"
        }, data: $data) {
          id
        }
      }
    `
    await this.client.request(mutation, {
      data: {
        events: {
          disconnect: [
            {
              id: event.id
            }
          ]
        }
      }
    })
  }

  async listCompanies(): Promise<t.Company[]> {
    const query = gql`
      query listCompanies {
        companies {
          id
          name
          slug
          thumbnail {
            url
          }
        }
      }
    `
    const response = await this.client.request<{ companies: t.Company[] }>(query)
    return response.companies
  }

  async findCompany(id: string): Promise<t.Company> {
    const query = gql`
      query FindCompanyById {
        company(where: {
          id: "${id}"
        }) {
          id
          slug
          name
          directLink
          externalLink
          thumbnail {
            id
            url
          }
          hash
        }
      }
    `
    const response = await this.client.request<{ company: t.Company }>(query)
    return response.company
  }

  async enrichCompany(id: string, data: Partial<t.Company>): Promise<void> {
    const mutation = gql`
      mutation EnrichCompany($data: CompanyUpdateInput!) {
        updateCompany(
          where: {
            id: "${id}"
          }, 
          data: $data
        ) {
          id
        }
      }
    `
    await this.client.request(mutation, {
      data: {
        ...data,
        enrichmentVersion: ENRICHMENT_VERSION,
        enrichedAt: new Date().toISOString()
      }
    })
  }

  async updateCompany(id: string, data: Partial<t.Company>): Promise<void> {
    const mutation = gql`
      mutation UpdateCompany($data: CompanyUpdateInput!) {
        updateCompany(
          where: {
            id: "${id}"
          }, 
          data: $data
        ) {
          id
        }
      }
    `
    await this.client.request(mutation, {
      data
    })
  }

  async listTags(): Promise<t.Tag[]> {
    const query = gql`
      query listTags {
        tags {
          id
          slug
          name
        }
      }
    `
    const response = await this.client.request<{ tags: t.Tag[] }>(query)
    return response.tags
  }

  async searchEvents(search: {
    pageSize: number
    page: number
    order?: t.EventSearchOrder
    type?: t.TrainingType
    tags?: string[]
    state?: string
    city?: string
    company?: string
    date?: string | `${string}-${string}`
  }): Promise<{
    events: t.Event[]
    total: number
  }> {
    const query = gql`
      query searchEvents(
        $first: Int
        $skip: Int
        $stage: Stage!
        $where: EventWhereInput
        $orderBy: EventOrderByInput
      ) {
        page: eventsConnection(first: $first, skip: $skip, stage: $stage, where: $where, orderBy: $orderBy) {
          edges {
            node {
              id
              createdAt
              startDate
              endDate
              city
              state
              directLink
              externalLink
              soldOut
              slug
              images {
                url
              }
              training {
                id
                slug
                price
                displayPrice
                name
                tags {
                  id
                  slug
                  name
                }
                description {
                  markdown
                  html
                }
                thumbnail {
                  url
                }
                gallery {
                  url
                }
                company {
                  name
                  slug
                  directLink
                  externalLink
                  thumbnail {
                    url
                  }
                }
              }
            }
          }
          aggregate {
            count
          }
        }
      }
    `

    const makeVariables = (): object => {
      const vars = {
        first: search.pageSize,
        skip: search.pageSize * (search.page - 1),
        stage: 'PUBLISHED',
        where: {
          AND: []
        },
        orderBy: null // set below
      }

      if (search.order) {
        const [priceOrDate, ascOrDesc] = search.order.split(':')
        const orderField = priceOrDate === 'date' ? 'startDate' : 'trainingPrice'
        vars.orderBy = `${orderField}_${ascOrDesc.toUpperCase()}`
      }

      if (search.tags) {
        vars.where.AND.push({
          training: {
            tags_some: {
              slug_in: search.tags
            }
          }
        })
      }

      if (search.type) {
        vars.where.AND.push({
          training: {
            type: search.type
          }
        })
      }

      if (search.state) {
        vars.where.AND.push({
          state: search.state
        })
      }

      if (search.company) {
        vars.where.AND.push({
          training: {
            company: {
              slug: search.company
            }
          }
        })
      }

      if (search.date) {
        const [fromStr, toStr] = search.date?.includes('-')
          ? search.date?.split('-') ?? ['', '']
          : [search.date ?? '', search.date ?? '']
        const fromDate = parseDate(fromStr, 'dd.MM.yyyy', new Date())
        const toDate = parseDate(toStr, 'dd.MM.yyyy', new Date())
        vars.where.AND.push({
          startDate_gt: addDays(fromDate, -1).toISOString(),
          startDate_lt: addDays(toDate, 1).toISOString()
        })
      }

      return vars
    }
    const response = await this.client.request<SearchEventsResponse>(query, makeVariables())
    return {
      events: response.page.edges.map(e => e.node),
      total: response.page.aggregate.count
    }
  }

  async searchTrainings(search: {
    pageSize: number
    page: number
    order?: t.TrainingSearchOrder
    type?: t.TrainingType
    tags?: string[]
    state?: string
    city?: string
    company?: string
    appointmentOnly?: boolean
  }): Promise<{
    trainings: t.Training[]
    total: number
  }> {
    const query = gql`
      query searchTrainings(
        $first: Int
        $skip: Int
        $stage: Stage!
        $where: TrainingWhereInput
        $orderBy: TrainingOrderByInput
      ) {
        page: trainingsConnection(first: $first, skip: $skip, stage: $stage, where: $where, orderBy: $orderBy) {
          edges {
            node {
              id
              slug
              type
              name
              directLink
              externalLink
              price
              displayPrice
              priceUnit
              appointmentOnly
              city
              state
              description {
                markdown
                html
              }
              location {
                latitude
                longitude
              }
              company {
                id
                name
                directLink
                externalLink
                thumbnail {
                  id
                  url
                }
              }
              gallery {
                id
                url
              }
              tags {
                id
                name
                slug
              }
              thumbnail {
                url
              }
              hash
            }
          }
          aggregate {
            count
          }
        }
      }
    `

    const makeVariables = (): object => {
      const vars = {
        first: search.pageSize,
        skip: search.pageSize * (search.page - 1),
        stage: 'PUBLISHED',
        where: {
          AND: []
        },
        orderBy: null // set below
      }

      if (search.order) {
        const [_price, ascOrDesc] = search.order.split(':')
        vars.orderBy = `price_${ascOrDesc.toUpperCase()}`
      }

      if (search.tags) {
        vars.where.AND.push({
          tags_some: {
            slug_in: search.tags
          }
        })
      }

      if (search.type) {
        vars.where.AND.push({
          type: search.type
        })
      }

      if (search.state) {
        vars.where.AND.push({
          state: search.state
        })
      }

      if (search.company) {
        vars.where.AND.push({
          company: {
            slug: search.company
          }
        })
      }

      if (search.appointmentOnly) {
        vars.where.AND.push({
          appointmentOnly: search.appointmentOnly
        })
      }

      return vars
    }
    const response = await this.client.request<SearchTrainingsResponse>(query, makeVariables())
    return {
      trainings: response.page.edges.map(e => e.node),
      total: response.page.aggregate.count
    }
  }

  async listRecentlyPublishedEvents({ limit }: { limit: number }): Promise<t.Event[]> {
    const query = gql`
      query searchEvents(
        $first: Int
        $skip: Int
        $stage: Stage!
        $where: EventWhereInput
        $orderBy: EventOrderByInput
      ) {
        page: eventsConnection(first: $first, skip: $skip, stage: $stage, where: $where, orderBy: $orderBy) {
          edges {
            node {
              id
              createdAt
              startDate
              endDate
              city
              state
              externalLink
              soldOut
              slug
              images {
                url
              }
              training {
                id
                slug
                price
                displayPrice
                name
                tags {
                  id
                  slug
                  name
                }
                description {
                  markdown
                  html
                }
                thumbnail {
                  url
                }
                gallery {
                  url
                }
                company {
                  name
                  slug
                  externalLink
                  thumbnail {
                    url
                  }
                }
              }
            }
          }
        }
      }
    `
    const response = await this.client.request<SearchEventsResponse>(query, {
      first: limit,
      skip: 0,
      stage: 'PUBLISHED',
      where: {
        AND: [
          {
            soldOut_not: true
          },
          {
            createdAt_gt: addDays(new Date(), -2).toISOString()
          }
        ]
      },
      orderBy: 'publishedAt_DESC'
    })
    return response.page.edges.map(e => e.node)
  }

  async listEventsNeedingEnrichment(currentEnrichmentVersion: number) {
    const query = gql`
      query listLameEvents {
        events(first: 10, where: {
          OR: [{
            enrichmentVersion_lt: ${currentEnrichmentVersion}
          }, {
            enrichmentVersion: null
          }]
        }) {
          id
          enrichedAt
          enrichmentVersion
        }
      }
    `
    const response = await this.client.request<{ events: t.Event[] }>(query)
    return response.events
  }

  async listTrainingsNeedingEnrichment(currentEnrichmentVersion: number) {
    const query = gql`
      query listLameTrainings {
        trainings(first: 10, where: {
          OR: [{
            enrichmentVersion_lt: ${currentEnrichmentVersion}
          }, {
            enrichmentVersion: null
          }]
        }) {
          id
          enrichedAt
          enrichmentVersion
        }
      }
    `
    const response = await this.client.request<{ trainings: t.Training[] }>(query)
    return response.trainings
  }

  async listCompaniesNeedingEnrichment(currentEnrichmentVersion: number) {
    const query = gql`
      query listLameCompanies {
        companies(first: 10, where: {
          OR: [{
            enrichmentVersion_lt: ${currentEnrichmentVersion}
          }, {
            enrichmentVersion: null
          }]
        }) {
          id
          enrichedAt
          enrichmentVersion
        }
      }
    `
    const response = await this.client.request<{ companies: t.Company[] }>(query)
    return response.companies
  }

  async listGiveaways() {
    const query = gql`
      query ListGiveaways {
        giveaways {
          id
          name
          key
          endDate
          active
          events {
            id
            startDate
            endDate
            city
            state
            externalLink
            soldOut
            slug
            images {
              url
            }
            training {
              id
              slug
              price
              displayPrice
              name
              tags {
                id
                slug
                name
              }
              description {
                markdown
                html
              }
              thumbnail {
                url
              }
              gallery {
                url
              }
              company {
                name
                slug
                externalLink
                thumbnail {
                  url
                }
              }
            }
          }
        }
      }
    `
    const response = await this.client.request<{ giveaways: t.Giveaway[] }>(query)
    return response.giveaways
  }

  async findGiveawayById(id: string): Promise<t.Giveaway> {
    const query = gql`
      query FindGiveawayById {
        giveaway(where: {
          id: "${id}"
        }) {
          id
          name
          key
          endDate
          active
          events {
            id
            startDate
            endDate
            city
            state
            externalLink
            soldOut
            slug
            images {
              url
            }
            training {
              id
              slug
              price
              displayPrice
              name
              tags {
                id
                slug
                name
              }
              description {
                markdown
                html
              }
              thumbnail {
                url
              }
              gallery {
                url
              }
              company {
                name
                slug
                externalLink
                thumbnail {
                  url
                }
              }
            }
          }
        }
      }
    `
    const response = await this.client.request<{ giveaway: t.Giveaway }>(query)
    return response.giveaway
  }
}

type SearchEventsResponse = {
  page: {
    edges: {
      node: t.Event
    }[]
    aggregate: {
      count: number
    }
  }
}

type SearchTrainingsResponse = {
  page: {
    edges: {
      node: t.Training
    }[]
    aggregate: {
      count: number
    }
  }
}
