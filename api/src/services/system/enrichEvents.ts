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

async function enrichEvents({ services }: t.ApiRequestProps<Args, Services>): Promise<Response> {
  const { graphcms } = services
  const events = await graphcms.listEventsNeedingEnrichment(ENRICHMENT_VERSION)
  for (const event of events) {
    await sleep(200)
    await axios({
      url: 'https://praxisco.link/graphcms/enrichEventOnChange',
      method: 'POST',
      data: JSON.stringify({
        operation: 'enrich',
        data: {
          id: event.id
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
  enrichEvents
)