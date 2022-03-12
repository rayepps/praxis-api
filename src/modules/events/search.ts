import _ from 'radash'
import * as t from '../../core/types'
import type { Props } from '@exobase/core'
import { useLogger } from '../../core/hooks/useLogger'
import { useJsonArgs, useCors, useService } from '@exobase/hooks'
import { useLambda } from '@exobase/lambda'
import makeGraphCMS, { GraphCMS } from '../../core/graphcms'
import makeCache, { CacheClient } from '../../core/cache'
import { useCachedResponse } from '../../core/hooks/useCachedResponse'

interface Args {
  pageSize?: number
  page?: number
  order?: t.SearchOrder
  type?: t.TrainingType
  tags?: string[]
  state?: string
  city?: string
  company?: string
  date?: `${string}<<${string}`
}

interface Services {
  graphcms: GraphCMS
  cache: CacheClient
}

type Response = Args & {
  events: t.Event[]
  total: number
}

async function searchEvents({ args, services }: Props<Args, Services>): Promise<Response> {
  const { graphcms } = services
  const query = {
    ...args,
    page: args.page ?? 1,
    pageSize: args.pageSize ?? 25
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
    date: yup.string()
  })),
  useService<Services>({
    graphcms: makeGraphCMS(),
    cache: makeCache()
  }),
  useCachedResponse<Args, Response>({
    key: 'px.events.search'
  }),
  searchEvents
)
