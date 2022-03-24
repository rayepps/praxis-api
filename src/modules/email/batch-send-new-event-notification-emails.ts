import _ from 'radash'
import type { Props } from '@exobase/core'
import { useLogger } from '../../core/hooks/useLogger'
import { useJsonArgs, useService } from '@exobase/hooks'
import { useLambda } from '@exobase/lambda'
import * as t from '../../core/types'
import makeMail, { MailClient } from '../../core/mail'
import formatDate from 'date-fns/format'
import { useApiKeyAuthentication } from '@exobase/auth'
import config from '../../core/config'

interface Args {
  contacts: t.Contact[]
  events: t.Event[]
}

interface Services {
  mail: MailClient
}

async function batchSendNewEventNotificationEmails({ args, services }: Props<Args, Services>) {
  const { mail } = services
  const { contacts, events } = args

  // See template in Postmark: https://account.postmarkapp.com/servers/8680753/templates/27373998/edit
  await mail.broadcast({
    from: 'operator@praxisco.us',
    template: 'new-events-added-notification',
    messages: contacts.map(contact => ({
      to: contact.email,
      model: {
        total: events.length,
        contact,
        events: events.map(e => ({
          ...e,
          displayDate: formatDate(new Date(e.startDate), 'MMMM do')
        }))
      }
    }))
  })
}

export default _.compose(
  useLogger(),
  useLambda(),
  useApiKeyAuthentication(config.apiKey),
  useJsonArgs<Args>(yup => ({
    contacts: yup.array(
      yup.object({
        email: yup.string().required()
      }).required()
    ).required(),
    events: yup.array(yup.object({
      city: yup.string().required(),
      state: yup.string().required(),
      startDate: yup.string().required(),
      slug: yup.string().required(),
      training: yup.object({
        name: yup.string().required(),
        company: yup.object({
          name: yup.string().required(),
        }).required()
      }).required()
    })).required()
  })),
  useService<Services>({
    mail: makeMail()
  }),
  batchSendNewEventNotificationEmails
)
