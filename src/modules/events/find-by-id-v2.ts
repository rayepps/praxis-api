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
import makeMongo, { MongoClient } from '../../core/mongo'

interface Args {
  eventId: t.Id<'event'>
}

interface Services {
  mongo: MongoClient
  cache: CacheClient
}

interface Response {
  event: t.EventModel
}

async function findEventById({ args, services }: Props<Args, Services>): Promise<Response> {
  const { mongo } = services
  const { eventId } = args
  const event = await mongo.findEventById({ id: eventId })
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
    mongo: makeMongo(),
    cache: makeCache()
  }),
  useCachedResponse({
    key: 'px.events.find.v2'
  }),
  findEventById
)
