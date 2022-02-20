import _ from 'radash'
import axios from 'axios'
import type { Props } from '@exobase/core'
import { useService } from '@exobase/hooks'
import { useLambda } from '@exobase/lambda'
import config from '../../core/config'
import { ENRICHMENT_VERSION } from '../../core/const'
import makeGraphCMS, { GraphCMS } from '../../core/graphcms'
import logger from '../../core/logger'


interface Args {}

interface Services {
  graphcms: GraphCMS
}

interface Response {}

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms))

async function enrichTrainings({ services }: Props<Args, Services>): Promise<Response> {
  const { graphcms } = services
  const trainings = await graphcms.listTrainingsNeedingEnrichment(ENRICHMENT_VERSION)
  logger.debug(`Found ${trainings.length} trainings that need enrichment`, {
    trainings: trainings.map(t => ({ 
      id: t.id, 
      currentEnrichmentVersion: ENRICHMENT_VERSION,
      enrichmentVersion: t.enrichmentVersion
    }))
  })
  for (const training of trainings) {
    await sleep(200)
    const [err] = await _.try(() => axios({
      url: 'https://api.praxisco.link/graphcms/enrichTrainingOnChange',
      method: 'POST',
      data: JSON.stringify({
        operation: 'enrich',
        data: {
          id: training.id
        }
      }),
      headers: {
        'Accept': 'application/json', 
        'Content-Type': 'application/json',
        'X-Api-Key': `Key ${config.graphcmsWebhookKey}`
      }
    }))()
    if (err) {
      console.debug(`Error calling graphcms.enrichTrainingOnChange function`, { error: err })
    }
  }
  return
}

export default _.compose(
  useLambda(),
  useService<Services>({
    graphcms: makeGraphCMS()
  }),
  enrichTrainings
)