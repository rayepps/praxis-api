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
  slug: string
}

interface Services {
  graphcms: GraphCMS
  cache: CacheClient
}

interface Response {
  event: t.Event
}

async function findEventBySlug({ args, services }: Props<Args, Services>): Promise<Response> {
  const { graphcms } = services
  const { slug } = args
  const event = await graphcms.findEventBySlug(slug)
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
    graphcms: makeGraphCMS(),
    cache: makeCache()
  }),
  useCachedResponse({
    key: 'px.events.find.slug'
  }),
  findEventBySlug
)
