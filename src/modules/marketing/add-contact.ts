import _ from 'radash'
import * as t from '../../core/types'
import type { Props } from '@exobase/core'
import { useLogger } from '../../core/hooks/useLogger'
import { useJsonArgs, useService } from '@exobase/hooks'
import { useCors } from '../../core/hooks/useCors'
import { useLambda } from '@exobase/lambda'
import makeSlack, { SlackClient } from '../../core/slack'
import makeMongo, { MongoClient } from '../../core/mongo'
import { hashEmail, createId } from '../../core/model'
import * as mappers from '../../core/view/mappers'

type Source = 'site.partner.form' | 'site.contact.form' | 'site.subscribe.popup'

interface Args {
  email: string
  source: Source
}

interface Services {
  slack: SlackClient
  mongo: MongoClient
}

interface Response {
  contact: t.ContactView
}

async function addContact({ args, services }: Props<Args, Services>): Promise<Response> {
  const { email, source } = args
  const { slack, mongo } = services
  await slack.sendMessage(`New submission from ${source}: ${email}`)
  const contact: t.Contact = {
    id: createId.contact(),
    email,
    phone: null,
    tags: [getSourceTag(source)],
    supressions: []
  }
  await mongo.addContact(contact)
  return {
    contact: mappers.ContactView.toView(contact)
  }
}

const getSourceTag = (source: Source): t.ContactTag => {
  switch (source) {
    case 'site.contact.form':
      return 'joined.by.site-contact-form'
    case 'site.partner.form':
      return 'joined.by.site-partner-form'
    case 'site.subscribe.popup':
      return 'joined.by.site-subscribe-popup'
    default:
      return 'joined.by.site-subscribe-popup'
  }
}

// Just helps to enforce the types below when using
// oneOf to enforce source string values
const sources: Record<Source, null> = {
  'site.contact.form': null,
  'site.partner.form': null,
  'site.subscribe.popup': null
}

// TODO: Add rate limiting
export default _.compose(
  useLogger(),
  useLambda(),
  useCors(),
  useJsonArgs<Args>(yup => ({
    email: yup.string().required(),
    source: yup.string().oneOf(Object.keys(sources)).required()
  })),
  useService<Services>({
    slack: makeSlack(),
    mongo: makeMongo()
  }),
  addContact
)
