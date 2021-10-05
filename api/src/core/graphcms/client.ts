import { gql, GraphQLClient } from 'graphql-request'
import * as t from '../types'
import { slugger } from '../model'


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
          company {
            id
            name
            thumbnail {
              id
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

  async updateEvent(id: string, data: Partial<t.Event>): Promise<void> {
    const mutation = gql`
      mutation {
        updateEvent(
          where: {
            id: "${id}"
          }, 
          data: {
            city: "${data.city}"
            state: ${data.state}
            slug: "${data.slug}"
            hash: {
              raw: "${data.hash.raw}"
              fields: [${data.hash.fields.map(f => `"${f}"`).join(',')}]
            }
          }
        ) {
          id
        }
      }
    `
    await this.client.request(mutation)
  }

  async updateTraining(id: string, data: Pick<t.Training, 'gallery' | 'thumbnail' | 'hash' | 'displayPrice'>): Promise<void> {
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
    await this.client.request(mutation, {
      data: {
        gallery: {
          connect: data.gallery.map(asset => ({
            where: {
              id: asset.id
            }
          }))
        },
        thumbnail: {
          connect: {
            id: data.thumbnail.id
          }
        },
        hash: {
          raw: data.hash.raw,
          fields: data.hash.fields
        },
        displayPrice: data.displayPrice
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
          connect: {
            id: event.id
          }
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
          slug: ${slugger(`${event.state}-${event.city}`)}
        }, data: $data) {
          id
        }
      }
    `
    await this.client.request<{ companies: t.Company[] }>(mutation, {
      events: {
        connect: {
          id: event.id
        }
      }
    })
  }

  async disconnectFromLocationMapping(event: t.Event): Promise<void> {
    const mutation = gql`
      mutation UpdateLocationMapping($data: LocationMappingUpdateInput!) {
        updateLocationMapping(where: {
          slug: ${slugger(`${event.state}-${event.city}`)}
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

  async searchEvents({
    filters,
    page
  }: {
    filters: {
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
    },
    page: {
      size: number
      number: number
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
    const makeVariables = (): object => {
      const vars = {
        first: page.size,
        skip: page.size * page.number,
        stage: 'PUBLISHED',
        where: {
          AND: []
        },
        orderBy: null // TODO
      }

      console.log('filters')
      console.log(JSON.stringify(filters, null, 2))

      if (filters.tags) {
        vars.where.AND.push({
          training: {
            tags_some: {
              slug_in: filters.tags
            }
          }
        })
      }

      if (filters.type) {
        vars.where.AND.push({
          training: {
            type: filters.type
          }
        })
      }

      if (filters.state) {
        vars.where.AND.push({
          state: filters.state
        })
      }

      if (filters.company) {
        vars.where.AND.push({
          training: {
            company: {
              id: filters.company
            }
          }
        })
      }

      if (filters.dates.preset) {
        const { preset } = filters.dates
        if (preset === 'custom') {
          vars.where.AND.push({
            startDate_gt: filters.dates.startsAfter,
            endDate_lt: filters.dates.endsBefore
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