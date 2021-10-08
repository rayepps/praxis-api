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

async function desyncTrainingOnUnpublish({ args, services }: t.ApiRequestProps<Args, Services>) {
  const { graphcms, webflow } = services
  const { id: trainingId } = args.data

  const training = await graphcms.findTraining(trainingId)

  if (!training.webflowId) {
    return
  }

  await webflow.unpublishTraining(training.webflowId)
}

async function onEventSyncError({ error, args, services }: t.ApiRequestProps<Args, Services>) {
  const { graphcms } = services
  const { id: trainingId } = args.data
  logger.debug('Handling error, updating sync status', { error })
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
  desyncTrainingOnUnpublish
)