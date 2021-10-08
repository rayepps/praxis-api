import _ from 'radash'
import * as t from '../../core/types'
import {
  useLambda,
  useService,
  useJsonArgs
} from '../../core/http'
import makeGraphCMS, { GraphCMS } from '../../core/graphcms'


interface Args {}

interface Services {
  graphcms: GraphCMS
}

async function cleanupPastEvents({ services }: t.ApiRequestProps<Args, Services>) {
  const { graphcms } = services

  const events = await graphcms.findEventsInThePast()

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