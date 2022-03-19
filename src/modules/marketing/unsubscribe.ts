import _ from 'radash'
import { errors, Props } from '@exobase/core'
import { useLogger } from '../../core/hooks/useLogger'
import { useJsonArgs, useService } from '@exobase/hooks'
import { useCors } from '../../core/hooks/useCors'
import { useLambda } from '@exobase/lambda'
import makeDatabase, { Database } from '../../core/db'
import * as t from '../../core/types'
import * as mappers from '../../core/view/mappers'

interface Args {
  id: string
}

interface Services {
  db: Database
}

interface Response {
  contact: t.ContactView
}

async function unsubscribeContact({ args, services }: Props<Args, Services>): Promise<Response> {
  const { id } = args
  const { db } = services
  const contact = await db.findContactById(id)
  if (!contact) {
    throw errors.badRequest({
      key: 'px.marketing.unsubscribe.not-found',
      details: `Could not find a subscriber with the given id(${id})`
    })
  }
  const patch = {
    subscribed: false
  }
  await db.updateContact(id, patch)
  return {
    contact: mappers.ContactView.toView({
      ...contact,
      ...patch
    })
  }
}

export default _.compose(
  useLogger(),
  useLambda(),
  useCors(),
  useJsonArgs<Args>(yup => ({
    id: yup.string().required()
  })),
  useService<Services>({
    db: makeDatabase()
  }),
  unsubscribeContact
)
