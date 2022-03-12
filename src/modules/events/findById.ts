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
  eventId: string
}

interface Services {
  graphcms: GraphCMS
  cache: CacheClient
}

interface Response {
  event: t.Event
}

async function findEventById({ args, services }: Props<Args, Services>): Promise<Response> {
  const { graphcms } = services
  const { eventId } = args
  const event = await graphcms.findEvent(eventId)
  return {
    event
  }
}

export default _.compose(
  useLogger(),
  useLambda(),
  useCors(),
  useJsonArgs<Args>(yup => ({
    eventId: yup.string().required()
  })),
  useService<Services>({
    graphcms: makeGraphCMS(),
    cache: makeCache()
  }),
  useCachedResponse({
    key: 'px.events.find'
  }),
  findEventById
)
