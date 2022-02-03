import _ from 'radash'
import * as t from '../../core/types'
import {
  useLambda,
  useService,
  useJsonArgs
} from '../../core/http'
import makeGraphCMS, { GraphCMS } from '../../core/graphcms'
import logger from '../../core/logger'


interface Args {}

interface Services {
  graphcms: GraphCMS
}

async function cleanupPastEvents({ services }: t.ApiRequestProps<Args, Services>) {
  const { graphcms } = services

  const events = await graphcms.findEventsInThePast()

  logger.debug(`Found ${events.length} events in the past`, {
    events: events.map(e => ({ id: e.id, startDate: e.startDate }))
  })

  for (const event of events) {
    await graphcms.unpublishEvent(event)
  }
  
}

export default _.compose(
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