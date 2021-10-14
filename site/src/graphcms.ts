import { gql, GraphQLClient } from 'graphql-request'
import * as t from './types'
import config from './config'


const client = new GraphQLClient(config.graphCmsUrl as any as string)

export async function findTraining(slug: string): Promise<t.Training> {
  const query = gql`
    query FindTrainingById {
      training(where: {
        slug: "${slug}"
      }) {
        id
        slug
        type
        name
        directLink
        externalLink
        price
        displayPrice
        description {
          html
        }
        company {
          id
          name
          thumbnail {
            url
          }
        }
        gallery {
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
      }
    }
  `
  const response = await client.request<{ training: t.Training }>(query)
  return response.training
}

export async function listFeaturedTrainings(): Promise<t.Training[]> {
  const query = gql`
      query ListFeaturedTrainings {
        featuredTrainings {
          training {
            id
            slug
            type
            name
            directLink
            externalLink
            price
            displayPrice
            company {
              id
              slug
              name
              thumbnail {
                url
              }
            }
            gallery {
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
          }
        }
      }
    `
  const response = await client.request<{ featuredTrainings: { training: t.Training }[] }>(query)
  return response.featuredTrainings.map(x => x.training)
}

export async function listFeaturedTags(): Promise<t.FeaturedTag[]> {
  const query = gql`
      query ListFeaturedTags {
        featuredTags {
          tag {
            id
            slug
            name
          }
          thumbnail {
            url
          }
        }
      }
    `
  const response = await client.request<{ featuredTags: t.FeaturedTag[] }>(query)
  return response.featuredTags
}

export async function findFeaturedTag(slug: string): Promise<t.FeatureTag | null> {
  const query = gql`
    query FindFeaturedTagBySlug {
      featuredTagsConnection(where: {
        tag: {
          slug: "${slug}"
        }
      }) {
        edges {
          node {
            tag {
              id
              slug
              name
            }
            thumbnail {
              url
            }
          }
        }
      }
    }
    `
  const response = await client.request<{
    featuredTagsConnection: ConnectionResponse<t.FeaturedTag>
  }>(query) as any
  return response.featuredTagsConnection.edges.length > 0
    ? response.featuredTagsConnection.edges[0].node
    : null
}

export async function findTrainingsWithTag(tagSlug: string): Promise<t.Training[]> {
  const query = gql`
    query FindFeaturedTags {
      trainingsConnection(where: {
        tags_some: {
          slug: "${tagSlug}"
        }
      }, first: 25) {
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
            company {
              id
              slug
              name
              thumbnail {
                url
              }
            }
            gallery {
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
          }
        }
      }
    }
  `
  const response = await client.request<{
    trainingsConnection: ConnectionResponse<t.Training>
  }>(query)
  return response.trainingsConnection.edges.map(e => e.node)
}

type ConnectionResponse<T> = {
  edges: {
    node: T
  }[]
  aggregate: {
    count: number
  }
}

export default {
  findTraining,
  listFeaturedTrainings,
  listFeaturedTags,
  findFeaturedTag,
  findTrainingsWithTag
}