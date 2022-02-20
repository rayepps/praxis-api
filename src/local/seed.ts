import * as t from '../core/types'
import config from '../core/config'
import { gql, GraphQLClient } from 'graphql-request'

const DEBUG = false

const rest = (ms: number = 400): Promise<void> => new Promise(res => setTimeout(res, ms))

const client = new GraphQLClient(config.graphcmsApiUrl, {
  headers: {
    authorization: `Bearer ${config.graphcmsApiToken}`
  }
})


//
//
//  KICKOFF ------>>>
//
//

async function run() {
  console.log('states:', Object.keys(t.USState).length)
  for (const state of Object.keys(t.USState)) {
    await rest()
    await createLocation(state as t.USState)
  }
}

const createLocation = async (state: t.USState) => {
  const mutation = gql`
    mutation AddLocationMetadata($data: LocationMetadataCreateInput!) {
      createLocationMetadata(data: $data) {
        id
      }
    }
  `
  const data = {
    state,
    cities: {}
  }
  console.log(data)
  if (DEBUG) {
    return 'state1'
  }
  const response = await client.request<{ createLocationMetadata: { id: string } }>(mutation, {
    data
  })
  return response.createLocationMetadata.id
}


run().then(() => {
  console.log('all done!')
}).catch(err => {
  console.error(err)
})
