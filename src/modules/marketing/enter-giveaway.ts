import _ from 'radash'
import { errors, Props } from '@exobase/core'
import { useLogger } from '../../core/hooks/useLogger'
import { useJsonArgs, useService } from '@exobase/hooks'
import { useCors } from '../../core/hooks/useCors'
import { useLambda } from '@exobase/lambda'
import makeGraphCMS, { GraphCMS } from '../../core/graphcms'
import makeMongo, { MongoClient } from '../../core/mongo'
import * as t from '../../core/types'
import { hashEmail } from '../../core/model'

interface Args {
  giveawayId: string
  email: string
}

interface Services {
  graphcms: GraphCMS
  mongo: MongoClient
}

// interface Response {}

async function enterGiveaway({ args, services }: Props<Args, Services>): Promise<void> {
  const { giveawayId, email } = args
  const { graphcms, mongo } = services
  const giveaway = await graphcms.findGiveawayById(giveawayId)
  if (!giveaway) {
    throw errors.notFound({
      details: `Could not find a giveaway with the given id(${giveawayId})`,
      key: 'px.err.marketing.enter-giveaway.not-found'
    })
  }
  if (!giveaway.active) {
    throw errors.badRequest({
      details: `The giveaway is no longer active and cannot be entered`,
      key: 'px.err.marketing.enter-giveaway.not-active'
    })
  }
  const now = new Date().getTime()
  const end = new Date(giveaway.endDate).getTime()
  if (end < now) {
    throw errors.badRequest({
      details: `The giveaway has ended and can no longer be entered`,
      key: 'px.err.marketing.enter-giveaway.ended'
    })
  }
  const contactId = `px.contact.${hashEmail(email)}` as t.Id<'contact'>
  const [err, existing] = await mongo.findContactById({ id: contactId })
  if (err) {
    console.error('mongo.findContactById error in marketing.enterGiveaway', err)
    throw errors.unknown({
      details: 'There was an error adding joining the giveaway',
      key: 'px.err.marketing.enter-giveaway.existing-error'
    })
  }
  if (existing) {
    await mongo.updateContactTags({
      id: existing.id, 
      tags: [
        ...existing.tags,
        `joined.giveaway.${giveaway.key}`
      ]
    })
  } else {
    const contact: t.Contact = {
      id: contactId,
      email,
      phone: null,
      tags: [
        'joined.by.giveaway', 
        `joined.giveaway.${giveaway.key}`
      ],
      supressions: []
    }
    await mongo.addContact(contact)
  }

}

// TODO: Add rate limiting
export default _.compose(
  useLogger(),
  useLambda(),
  useCors(),
  useJsonArgs(yup => ({
    giveawayId: yup.string().required(),
    email: yup.string().email().required()
  })),
  useService<Services>({
    graphcms: makeGraphCMS(),
    mongo: makeMongo()
  }),
  enterGiveaway
)
