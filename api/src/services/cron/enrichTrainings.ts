import _ from 'radash'
import axios from 'axios'
import * as t from '../../core/types'
import {
  useLambda,
  useService
} from '../../core/http'
import config from '../../config'
import { ENRICHMENT_VERSION } from '../../const'
import makeGraphCMS, { GraphCMS } from '../../core/graphcms'


interface Args {}

interface Services {
  graphcms: GraphCMS
}

interface Response {}

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms))

async function enrichTrainings({ services }: t.ApiRequestProps<Args, Services>): Promise<Response> {
  const { graphcms } = services
  const trainings = await graphcms.listTrainingsNeedingEnrichment(ENRICHMENT_VERSION)
  for (const training of trainings) {
    await sleep(200)
    await _.try(axios)({
      url: 'https://praxisco.link/graphcms/enrichTrainingOnChange',
      method: 'POST',
      data: JSON.stringify({
        operation: 'enrich',
        data: {
          id: training.id
        }
      }),
      headers: {
        'Authorization': `Key: ${config.graphcmsWebhookKey}`
      }
    })
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