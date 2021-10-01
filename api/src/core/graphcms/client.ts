import { gql, GraphQLClient } from 'graphql-request'
import * as t from '../types'


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
          company {
            id
            name
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

  async updateTraining(id: string, data: Partial<t.Training>): Promise<void> {
    const mutation = gql`
      mutation {
        updateTraining(
          where: {
            id: "${id}"
          }
          data: {
            thumbnail: {
              connect: {
                id: "${data.thumbnail.id}"
              }
            }
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


}