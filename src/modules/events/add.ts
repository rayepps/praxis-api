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
import { TokenAuth } from '@exobase/auth'
import { usePermissionAuthorization } from '@exobase/auth/dist/permission'
import { permissions } from '../../core/auth'
import { useTokenAuthentication } from '../../core/hooks/useTokenAuthentication'

interface Args {
  slug: string
}

interface Services {
  mongo: MongoClient
}

interface Response {
  event: t.EventModel
}

async function findEventBySlug({ args, services, auth }: Props<Args, Services, TokenAuth>): Promise<Response> {
  const { mongo } = services
  const userId = auth.token.sub as t.Id<'user'>
  const event: t.EventModel = {

  }
  await mongo.addEvent(event)
  return {
    event
  }
}

export default _.compose(
  useLogger(),
  useLambda(),
  useCors(),
  useTokenAuthentication(),
  usePermissionAuthorization({
    require: [permissions..create]
  }),
  useJsonArgs<Args>(yup => ({
    slug: yup.string().required()
  })),
  useService<Services>({
    mongo: makeMongo()
  }),
  findEventBySlug
)
