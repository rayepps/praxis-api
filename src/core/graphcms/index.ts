import { GraphQLClient } from 'graphql-request'
import { GraphCMS } from './client'
import config from '../config'

export type { GraphCMS }

export default function makeGraphCMS(): GraphCMS {
  return new GraphCMS(
    new GraphQLClient(config.graphcmsApiUrl, {
      headers: {
        authorization: `Bearer ${config.graphcmsApiToken}`
      }
    })
  )
}