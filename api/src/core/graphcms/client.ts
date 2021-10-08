import { gql, GraphQLClient } from 'graphql-request'
import * as t from '../types'
import { slugger } from '../model'
import { ENRICHMENT_VERSION } from '../../const'


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

export class GraphCMS {

  constructor(
    private client: GraphQLClient
  ) {

  }

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
          link
          price
          displayPrice
          company {
            id
            name
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
          webflowId
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

  async findEvent(id: string): Promise<t.Event> {
    const query = gql`
      query findEvent {
        event(where: {
          id: "${id}"
        }) {
          id
          startDate
          endDate
          city
          state
          training {
            id
            slug
            price
            name
            thumbnail {
              url
            }
            company {
              name
              slug
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
        enrichmentStatus: 'success',
        enrichmentVersion: ENRICHMENT_VERSION,
      }
    })
  }

  async updateTraining(id: string, patch: Partial<t.Training>): Promise<void> {
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
        connect: data.gallery.map(asset => ({
          where: {
            id: asset.id
          }
        }))
      }
    }
    if (patch.thumbnail) {
      data.thumbnail = {
        connect: {
          id: data.thumbnail.id
        }
      }
    }
    await this.client.request(mutation, {
      data
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
          slug: "${slugger(`${state}-${city}`)}"
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
    await this.client.request<{ companies: t.Company[] }>(mutation, {
      data: {
        city: event.city,
        state: event.state,
        slug: slugger(`${event.state}-${event.city}`),
        events: {
          connect: [{
            id: event.id
          }]
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
          slug: "${slugger(`${event.state}-${event.city}`)}"
        }, data: $data) {
          id
        }
      }
    `
    await this.client.request<{ companies: t.Company[] }>(mutation, {
      data: {
        events: {
          connect: {
            id: event.id
          }
        }
      }
    })
  }

  async disconnectFromLocationMapping(event: t.Event): Promise<void> {
    const mutation = gql`
      mutation RemoveLocationMapping($data: LocationMappingUpdateInput!) {
        updateLocationMapping(where: {
          slug: "${slugger(`${event.state}-${event.city}`)}"
        }, data: $data) {
          id
        }
      }
    `
    await this.client.request<{ companies: t.Company[] }>(mutation, {
      events: {
        disconnect: {
          id: event.id
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
          key
          thumbnail {
            url
          }
        }
      }
    `
    const response = await this.client.request<{ companies: t.Company[] }>(query)
    return response.companies
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
    orderBy?: 'price' | 'date'
    orderAs?: 'asc' | 'desc'
    type?: t.TrainingType
    tags?: string[]
    state?: string
    city?: string
    company?: string
    dates?: {
      preset: 'this-month' | 'next-month' | 'custom'
      startsAfter?: string
      endsBefore?: string
    }
  }): Promise<{
    events: t.Event[]
    total: number
  }> {
    const query = gql`
      query searchEvents($first: Int, $skip: Int, $stage: Stage!, $where: EventWhereInput, $orderBy: EventOrderByInput) {
        page: eventsConnection(
          first: $first
          skip: $skip
          stage: $stage
          where: $where
          orderBy: $orderBy
        ) {
          edges {
            node {
              id
              startDate
              endDate
              city
              state
              link
              slug
              location {
                latitude
                longitude
              }
              training {
                id
                slug
                name
                price
                displayPrice
                tags {
                  slug
                  name
                }
                thumbnail {
                  id
                  url
                }
                company {
                  id
                  slug
                  name
                  key
                  thumbnail {
                    id
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

    console.log('search')
    console.log(JSON.stringify(search, null, 2))

    const makeVariables = (): object => {
      const vars = {
        first: search.pageSize,
        skip: search.pageSize * (search.page - 1),
        stage: 'PUBLISHED',
        where: {
          AND: []
        },
        orderBy: null // TODO
      }

      if (search.orderBy && search.orderAs) {
        const orderBy = search.orderBy === 'date'
          ? 'startDate'
          : 'trainingPrice'
        vars.orderBy = `${orderBy}_${search.orderAs.toUpperCase()}`
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
              key: search.company
            }
          }
        })
      }

      if (search.dates.preset) {
        const { preset } = search.dates
        if (preset === 'custom') {
          vars.where.AND.push({
            startDate_gt: search.dates.startsAfter,
            endDate_lt: search.dates.endsBefore
          })
        } else {
          const today = new Date()
          const range = preset === 'this-month'
            ? {
              startsAfter: today.toISOString(),
              endsBefore: new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString()
            } : {
              startsAfter: new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString(),
              endsBefore: new Date(today.getFullYear(), today.getMonth() + 2, 0).toISOString()
            }
          vars.where.AND.push({
            startDate_gt: range.startsAfter,
            endDate_lt: range.endsBefore
          })
        }
      }

      console.log('variables')
      console.log(JSON.stringify(vars, null, 2))

      return vars
    }
    const response = await this.client.request<SearchEventsResponse>(query, makeVariables())
    return {
      events: response.page.edges.map(e => e.node),
      total: response.page.aggregate.count
    }

  }

  async listEventsNeedingEnrichment(currentEnrichmentVersion: number) {
    const query = gql`
      query listLameEvents {
        events(first: 10, where: {
          OR: [{
            enrichmentVersion_lt: ${currentEnrichmentVersion}, 
            enrichmentStatus_not: error
          }, {
            enrichmentVersion: null
            enrichmentStatus: null
          }]
        }) {
          id
          enrichmentStatus
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
            enrichmentVersion_lt: ${currentEnrichmentVersion}, 
            enrichmentStatus_not: error
          }, {
            enrichmentVersion: null
            enrichmentStatus: null
          }]
        }) {
          id
          enrichmentStatus
          enrichmentVersion
        }
      }
    `
    const response = await this.client.request<{ trainings: t.Training[] }>(query)
    return response.trainings
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