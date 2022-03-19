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

interface Args {
  limit: number
}

interface Services {
  graphcms: GraphCMS
  cache: CacheClient
}

interface Response {
  events: t.Event[]
}

async function recentlyPublished({ args, services }: Props<Args, Services>): Promise<Response> {
  const { graphcms } = services
  const { limit } = args
  const events = await graphcms.listRecentlyPublishedEvents({ limit })
  return {
    events
  }
}

export default _.compose(
  useLogger(),
  useLambda(),
  useCors(),
  useJsonArgs<Args>(yup => ({
    limit: yup.number().required()
  })),
  useService<Services>({
    graphcms: makeGraphCMS(),
    cache: makeCache()
  }),
  useCachedResponse({
    key: 'px.events.recently-published',
    ttl: '4 minutes'
  }),
  recentlyPublished
)
