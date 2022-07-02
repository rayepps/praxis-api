import _ from 'radash'
import * as t from '../../core/types'
import type { Props } from '@exobase/core'
import { useLogger } from '../../core/hooks/useLogger'
import { useJsonArgs, useService } from '@exobase/hooks'
import { useCors } from '../../core/hooks/useCors'
import { useLambda } from '@exobase/lambda'
import makeGraphCMS, { GraphCMS } from '../../core/graphcms'
import makeCache, { CacheClient } from '../../core/cache'
import { useCachedResponse } from '../../core/hooks/useCachedResponse'
import makeGeoClient, { GeoClient } from '../../core/geo'
import makeMongo, { MongoClient } from '../../core/mongo'
import mappers from '../../core/view/mappers'

interface Args {
  pageSize?: number
  page?: number
  order?: t.EventSearchOrder
  type?: t.TrainingType
  tags?: string[]
  companyId?: t.Id<'company'>
  date?: string | `${string}-${string}`
  near?: t.Coordinates & {
    proximity: number
  }
}

interface Services {
  mongo: MongoClient
  cache: CacheClient
}

type Response = Args & {
  events: t.EventModel[]
}

async function searchListings({ args, services }: Props<Args, Services>): Promise<Response> {
  const { mongo } = services
  const events = await mongo.searchEvents({
    near: args.near,
    type: args.type,
    tags: args.tags,
    companyId: args.companyId,
    date: args.date,
    page: args.page ? args.page - 1 : 0,
    pageSize: args.pageSize ?? 25,
    order: args.order ?? 'date:asc'
  })
  return {
    ...args,
    events
  }
}

export default _.compose(
  useLogger(),
  useLambda(),
  useCors(),
  useJsonArgs<Args>(yup => ({
    pageSize: yup.number().integer().min(1).max(100),
    page: yup.number().integer().min(1),
    order: yup.string(), // TODO: Require specific values
    keywords: yup.string(),
    categoryId: yup.string(),
    near: yup.mixed(),
    posterId: yup.string()
  })),
  useService<Services>({
    mongo: makeMongo(),
    cache: makeCache()
  }),
  useCachedResponse<Args, Response>({
    key: 'px.events.search.v2',
    ttl: '5 minutes'
  }),
  searchListings
)
