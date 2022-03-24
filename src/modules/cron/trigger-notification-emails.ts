import _ from 'radash'
import makeGraphCMS, { GraphCMS } from '../../core/graphcms'
import type { Props } from '@exobase/core'
import { useLogger } from '../../core/hooks/useLogger'
import { useService } from '@exobase/hooks'
import { useLambda } from '@exobase/lambda'
import makeDatabase, { Database } from '../../core/db'
import addDays from 'date-fns/addDays'
import * as t from '../../core/types'
import makeQueue, { QueueClient } from '../../core/queue'
import config from '../../core/config'
import { useApiKeyAuthentication } from '@exobase/auth'
import makeMongo, { MongoClient } from '../../core/mongo'


interface Args {}

interface Services {
  graphcms: GraphCMS
  db: Database
  queue: QueueClient
  mongo: MongoClient
}

async function triggerNewEventNotificationEmail({ services }: Props<Args, Services>) {
  const { graphcms, db, queue, mongo } = services

  // Check to see if we should run the email now
  // - have we already done this in the last 23 hours?
  const today = new Date()
  const existingRun = await db.findTriggeredEventOnDay({
    key: 'px.event.process-new-events-notification',
    day: today
  })
  if (existingRun) {
    console.warn('Trigger attmpted to run twice in one day. Qutting', {
      existingRun,
      today
    })
  }

  // Get the last run so we can see what events we sent and
  // not send any duplicates
  const previousRun = await db.findTriggeredEventOnDay({
    key: 'px.event.process-new-events-notification',
    day: addDays(today, -1)
  }) as t.TriggeredEvent<t.NewEventNotificationTriggeredEventMetadata>
  const previousEventIds = previousRun?.metadata.eventIds ?? []

  console.log('x--> PREVIOUS RUN:', previousRun)

  // Pull all newly added events from the DB
  // - filter down to the top 10 *most interesting*
  const newlyAddedEvents = await graphcms.listRecentlyPublishedEvents({
    limit: 20
  })
  if (newlyAddedEvents.length === 0) {
    console.warn('No new events to send to people')
    return
  }

  console.log('x--> EVENTS TO ADD [pulled]:')
  console.log(newlyAddedEvents)

  const eventsToSend = newlyAddedEvents.filter(e => !previousEventIds.includes(e.id))

  if (eventsToSend.length <= 1) {
    console.warn('Not enough events to send after filtering out yesterdays', {
      previousEventIds,
      newlyAddedEvents,
      eventsToSend: eventsToSend.map(e => ({
        name: e.name,
        id: e.id,
        training: {
          id: e.training?.id,
          name: e.training?.name
        }
      }))
    })
    const thisTriggeredEvent: t.TriggeredEvent<t.NewEventNotificationTriggeredEventMetadata> = {
      key: 'px.event.process-new-events-notification',
      timestamp: today.getTime(),
      metadata: {
        eventIds: []
      }
    }
    await db.addTriggeredEvent(thisTriggeredEvent)
    return
  }

  console.log('x--> EVENTS TO ADD [final]:')
  console.log(eventsToSend)

  // TODO:
  // - filter out supressions (currently postmark will do this for us)
  // - handle error
  // - handle in batches
  const [err, contacts] = await mongo.findContactsWithTag({
    tag: 'joined.by.site-subscribe-popup'
  })
  if (err) {
    console.error(err)
    throw err
  }

  console.log('x--> CONTACTS:')
  console.log(contacts)

  const ray = contacts.find(c => c.email === 'ray@unishine.dev')

  // Do the email for me. Then do the email for everyone else
  // If anything is jacked I have 30 mins to fix it or stop
  // the queued send email request in Zeplo
  await queue.push({
    endpoint: 'email/batchSendNewEventNotification',
    body: {
      contacts: ray,
      events: eventsToSend
    }
  })
  await queue.push({
    endpoint: 'email/batch-send-notification-emails',
    delay: 60 * 30, // 30 minutes
    body: {
      contacts: contacts,
      events: eventsToSend
    }
  })

  // Add a new triggered event record to record that this action 
  // has taken place
  const thisTriggeredEvent: t.TriggeredEvent<t.NewEventNotificationTriggeredEventMetadata> = {
    key: 'px.event.process-new-events-notification',
    timestamp: today.getTime(),
    metadata: {
      eventIds: eventsToSend.map(e => e.id)
    }
  }
  console.log('x--> NEW TRIGGERED EVENT:', thisTriggeredEvent)
  await db.addTriggeredEvent(thisTriggeredEvent)
}

export default _.compose(
  useLogger(),
  useLambda(),
  useApiKeyAuthentication(config.apiKey),
  useService<Services>({
    graphcms: makeGraphCMS(),
    db: makeDatabase(),
    queue: makeQueue(),
    mongo: makeMongo()
  }),
  triggerNewEventNotificationEmail
)