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


interface Args {
  operation: 'update' | 'create' | 'enrich'
  data: {
    __typename: 'Training'
    id: string
    stage: 'DRAFT'
  }
}

interface Services {
  webflow: Webflow
  graphcms: GraphCMS
}

async function syncTrainingOnPublish({ args, services }: t.ApiRequestProps<Args, Services>) {
  const { graphcms, webflow } = services
  const { id: trainingId } = args.data

  const training = await graphcms.findTraining(trainingId)

  if (training.webflowId) {
    await webflow.updateTraining(training.webflowId, training)
  } else {
    training.webflowId = await webflow.addTraining(training)
  }

  await graphcms.updateEvent(training.id, {
    webflowId: training.webflowId,
    webflowSyncStatus: 'success',
    webflowSyncedAt: new Date().toISOString()
  })
  
}

async function onEventSyncError({ args, services }: t.ApiRequestProps<Args, Services>) {
  const { graphcms } = services
  const { id: trainingId } = args.data
  await graphcms.updateEvent(trainingId, {
    webflowSyncStatus: 'error'
  })
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
  syncTrainingOnPublish
)