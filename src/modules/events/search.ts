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

interface Args {
  pageSize?: number
  page?: number
  order?: t.EventSearchOrder
  type?: t.TrainingType
  tags?: string[]
  state?: string
  city?: string
  company?: string
  date?: string | `${string}-${string}`
  near?: t.GeoLocation
}

interface Services {
  graphcms: GraphCMS
  cache: CacheClient
  geo: GeoClient
}

type Response = Args & {
  events: t.Event[]
  total: number
}

async function searchEvents({ args, services }: Props<Args, Services>): Promise<Response> {
  const { graphcms, geo } = services
  const location = args.near
    ? await geo.lookupCoordinates(args.near.latitude, args.near.longitude)
    : null
  const query = {
    ...args,
    state: args.state ?? location?.state ?? undefined,
    page: args.page ?? 1,
    pageSize: args.pageSize ?? 25,
    order: args.order ?? 'date:asc'
  }
  const { total, events } = await graphcms.searchEvents(query)
  return {
    total, events, ...query
  }
}

export default _.compose(
  useLogger(),
  useLambda(),
  useCors(),
  useJsonArgs<Args>(yup => ({
    pageSize: yup.number().integer().positive(),
    page: yup.number().integer().positive(),
    order: yup.string(), // TODO: Require specific values
    type: yup.string(),
    tags: yup.array().of(yup.string()),
    state: yup.string(),
    city: yup.string(),
    company: yup.string(),
    date: yup.string(),
    near: yup.mixed()
  })),
  useService<Services>({
    graphcms: makeGraphCMS(),
    cache: makeCache(),
    geo: makeGeoClient(),
  }),
  useCachedResponse<Args, Response>({
    key: 'px.events.search',
    ttl: '5 minutes'
  }),
  searchEvents
)
