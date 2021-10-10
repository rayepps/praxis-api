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

async function desyncEventOnUnpublish({ args, services }: t.ApiRequestProps<Args, Services>) {
  const { graphcms, webflow } = services
  const { id: eventId } = args.data

  const event = await graphcms.findEvent(eventId)

  if (!event.webflowId) {
    return
  }
  
  await webflow.unpublishEvent(event.webflowId)
}

async function onEventSyncError({ args, services }: t.ApiRequestProps<Args, Services>) {
  const { graphcms } = services
  const { id: eventId } = args.data
  await graphcms.trackError('event', eventId, 'desyncEventOnUnpublish', runtime.rid())
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
  useCatch(onEventSyncError),
  desyncEventOnUnpublish
)