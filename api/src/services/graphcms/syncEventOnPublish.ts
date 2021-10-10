import _ from 'radash'
import * as t from '../../core/types'
import {
  useCatch,
  useLambda,
  useService,
  useJsonArgs,
  useApiKeyAuthentication
} from '../../core/http'
import makeWebflow, { Webflow } from '../../core/webflow'
import makeGraphCMS, { GraphCMS } from '../../core/graphcms'
import config from '../../config'
import logger from '../../core/logger'
import runtime from '../../core/runtime'


interface Args {
  operation: 'update' | 'create' | 'enrich'
  data: {
    __typename: 'Event'
    id: string
    stage: 'DRAFT'
  }
}

interface Services {
  webflow: Webflow
  graphcms: GraphCMS
}

async function syncEventOnPublish({ args, services }: t.ApiRequestProps<Args, Services>) {
  const { graphcms, webflow } = services
  const { id: eventId } = args.data

  const event = await graphcms.findEvent(eventId)

  if (event.webflowId) {
    await webflow.updateEvent(event.webflowId, event)
  } else {
    event.webflowId = await webflow.addEvent(event)
  }

  await graphcms.updateEvent(event.id, {
    webflowId: event.webflowId,
    syncedAt: new Date().toISOString()
  })
  
}

async function onError({ error, args, services }: t.ApiRequestProps<Args, Services>) {
  const { graphcms } = services
  const { id: eventId } = args.data
  logger.debug('Handling error, updating sync status', { error })
  await graphcms.trackError('event', eventId, 'syncEventOnPublish', runtime.rid())
}

export default _.compose(
  useLambda(),
  useApiKeyAuthentication(config.graphcmsWebhookKey),
  useJsonArgs<Args>(yup => ({
    operation: yup.string(),
    data: yup.mixed()
  })),
  useService<Services>({
    webflow: makeWebflow(),
    graphcms: makeGraphCMS()
  }),
  useCatch(onError),
  syncEventOnPublish
)