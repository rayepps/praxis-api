import _ from 'radash'
import * as t from '../../core/types'
import type { Props } from '@exobase/core'
import { useLogger } from '../../core/hooks/useLogger'
import { useJsonArgs, useService } from '@exobase/hooks'
import { useCors } from '../../core/hooks/useCors'
import { useLambda } from '@exobase/lambda'
import makeCache, { CacheClient } from '../../core/cache'
import { useCachedResponse } from '../../core/hooks/useCachedResponse'
import makeMongo, { MongoClient } from '../../core/mongo'

interface Args {
  slug: string
}

interface Services {
  mongo: MongoClient
  cache: CacheClient
}

interface Response {
  event: t.EventModel
}

async function findEventBySlug({ args, services }: Props<Args, Services>): Promise<Response> {
  const { mongo } = services
  const { slug } = args
  const event = await mongo.findEventBySlug({ slug })
  return {
    event
  }
}

export default _.compose(
  useLogger(),
  useLambda(),
  useCors(),
  useJsonArgs<Args>(yup => ({
    slug: yup.string().required()
  })),
  useService<Services>({
    mongo: makeMongo(),
    cache: makeCache()
  }),
  useCachedResponse({
    key: 'px.events.find.slug.v2'
  }),
  findEventBySlug
)
