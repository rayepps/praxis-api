import _ from 'radash'
import { v4 as uuid } from 'uuid'
import type { Props } from '@exobase/core'
import { useLogger } from '../../core/hooks/useLogger'
import { useJsonArgs, useService } from '@exobase/hooks'
import { useCors } from '../../core/hooks/useCors'
import { useLambda } from '@exobase/lambda'
import makeSlack, { SlackClient } from '../../core/slack'
import makeDatabase, { Database } from '../../core/db'
import * as t from '../../core/types'
import * as mappers from '../../core/view/mappers'
import { hashEmail } from '../../core/model'

interface Args {
  email: string
}

interface Services {
  slack: SlackClient
  db: Database
}

interface Response {
  contact: t.ContactView
}

async function subscribeContact({ args, services }: Props<Args, Services>): Promise<Response> {
  const { email } = args
  const { slack, db } = services
  await slack.sendMessage(`New subscriber: ${email}`)
  const contact: t.Contact = {
    id: `px.contact.${hashEmail(email)}`,
    email,
    subscribed: true
  }
  await db.addContact(contact)
  return {
    contact: mappers.ContactView.toView(contact)
  }
}

export default _.compose(
  useLogger(),
  useLambda(),
  useCors(),
  useJsonArgs<Args>(yup => ({
    email: yup.string().required()
  })),
  useService<Services>({
    slack: makeSlack(),
    db: makeDatabase()
  }),
  subscribeContact
)
