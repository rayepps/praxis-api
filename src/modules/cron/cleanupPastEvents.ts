import _ from 'radash'
import makeGraphCMS, { GraphCMS } from '../../core/graphcms'

import type { Props } from '@exobase/core'
import { useLogger } from '../../core/hooks/useLogger'
import { useJsonArgs, useService } from '@exobase/hooks'
import { useLambda } from '@exobase/lambda'


interface Args {}

interface Services {
  graphcms: GraphCMS
}

async function cleanupPastEvents({ services }: Props<Args, Services>) {
  const { graphcms } = services

  const events = await graphcms.findEventsInThePast()

  console.log(`Found ${events.length} events in the past`, {
    events: events.map(e => ({ id: e.id, startDate: e.startDate }))
  })

  for (const event of events) {
    await graphcms.unpublishEvent(event)
  }
  
}

export default _.compose(
  useLogger(),
  useLambda(),
  useJsonArgs<Args>(yup => ({
    operation: yup.string(),
    data: yup.mixed()
  })),
  useService<Services>({
    graphcms: makeGraphCMS()
  }),
  cleanupPastEvents
)