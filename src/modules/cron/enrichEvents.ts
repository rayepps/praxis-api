import _ from 'radash'
import axios from 'axios'
import type { Props } from '@exobase/core'
import { useService } from '@exobase/hooks'
import { useLambda } from '@exobase/lambda'
import config from '../../core/config'
import { ENRICHMENT_VERSION } from '../../core/const'
import makeGraphCMS, { GraphCMS } from '../../core/graphcms'

interface Args {}

interface Services {
  graphcms: GraphCMS
}

interface Response {}

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms))

async function enrichEvents({ services }: Props<Args, Services>): Promise<Response> {
  const { graphcms } = services
  const events = await graphcms.listEventsNeedingEnrichment(ENRICHMENT_VERSION)
  console.log(`Found ${events.length} events that need enrichment`, {
    events: events.map(e => ({
      id: e.id,
      currentEnrichmentVersion: ENRICHMENT_VERSION,
      enrichmentVersion: e.enrichmentVersion
    }))
  })
  for (const event of events) {
    await sleep(200)
    const [err] = await _.try(() =>
      axios({
        url: 'https://api.praxisco.link/graphcms/enrichEventOnChange',
        method: 'POST',
        data: JSON.stringify({
          operation: 'enrich',
          data: {
            id: event.id
          }
        }),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Api-Key': `Key ${config.graphcmsWebhookKey}`
        }
      })
    )()
    if (err) {
      console.debug(`Error calling graphcms.enrichEventOnChange function`, { error: err })
    }
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
