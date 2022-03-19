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


interface Args {}

interface Services {
  graphcms: GraphCMS
  db: Database
  queue: QueueClient
}

async function triggerNewEventNotificationEmail({ services }: Props<Args, Services>) {
  const { graphcms, db, queue } = services

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

  // db.iterate will pull records from the db in the biggest
  // batches it can then call the callback for each record and
  // repeat until no matching records remain.
  //
  // Here we're pulling every subscriber. Grouping them into groups
  // of max 50 and then queueing the request to generate and send
  // the email for those 50 contacts.
  const queueBatch = async (contacts: t.Contact[], delay: number) => {
    console.log('x--> QUEUEING BATCH:', { contacts, delay })
    await queue.push({
      endpoint: 'email/batchSendNewEventNotification',
      delay,
      body: {
        contacts: contacts,
        events: eventsToSend
      }
    })
  }
  let group: t.Contact[] = []
  await db.iterateSubscribedContacts(null, async (contact: t.Contact, idx: number) => {
    if (group.length > 50) {
      await queueBatch(group, idx /* seconds delayed */)
      group = []
    } else {
      group = [...group, contact]
    }
  })
  await queueBatch(group, 60 /* seconds delayed */)

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
    queue: makeQueue()
  }),
  triggerNewEventNotificationEmail
)