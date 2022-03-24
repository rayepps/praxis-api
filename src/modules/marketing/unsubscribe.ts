import _ from 'radash'
import { errors, Props } from '@exobase/core'
import { useLogger } from '../../core/hooks/useLogger'
import { useJsonArgs, useService } from '@exobase/hooks'
import { useCors } from '../../core/hooks/useCors'
import { useLambda } from '@exobase/lambda'
import makeMongo, { MongoClient } from '../../core/mongo'
import * as t from '../../core/types'
import * as mappers from '../../core/view/mappers'

interface Args {
  id: t.Id<'contact'>
  campaign: string
}

interface Services {
  mongo: MongoClient
}

interface Response {
  contact: t.ContactView
}

async function unsubscribeContact({ args, services }: Props<Args, Services>): Promise<Response> {
  const { id, campaign } = args
  const { mongo } = services
  const [err, contact] = await mongo.findContactById({ id })
  if (err) {
    throw errors.notFound({
      key: 'px.marketing.unsubscribe.find-err',
      details: `Could not find a subscriber with the given id(${id})`
    })
  }
  if (!contact) {
    throw errors.badRequest({
      key: 'px.marketing.unsubscribe.not-found',
      details: `Could not find a subscriber with the given id(${id})`
    })
  }
  const supression: t.ContactSupression = {
    timestamp: new Date().getTime(),
    campaign
  }
  await mongo.addContactSupression({
    id,
    supression
  })
  return {
    contact: mappers.ContactView.toView({
      ...contact,
      ...supression
    })
  }
}

// TODO: Add rate limiting
export default _.compose(
  useLogger(),
  useLambda(),
  useCors(),
  useJsonArgs<Args>(yup => ({
    id: yup.string().required(),
    campaign: yup.string().required()
  })),
  useService<Services>({
    mongo: makeMongo()
  }),
  unsubscribeContact
)
