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
import logger from '../../core/logger'


interface Args {}

interface Services {
  graphcms: GraphCMS
}

interface Response {}

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms))

async function enrichCompanies({ services }: t.ApiRequestProps<Args, Services>): Promise<Response> {
  const { graphcms } = services
  const companies = await graphcms.listCompaniesNeedingEnrichment(ENRICHMENT_VERSION)
  logger.debug(`Found ${companies.length} companies that need enrichment`, {
    companies: companies.map(e => ({ 
      id: e.id, 
      currentEnrichmentVersion: ENRICHMENT_VERSION,
      enrichmentVersion: e.enrichmentVersion
    }))
  })
  for (const company of companies) {
    await sleep(200)
    const [err] = await _.try(axios)({
      url: 'https://api.praxisco.link/graphcms/enrichCompanyOnChange',
      method: 'POST',
      data: JSON.stringify({
        operation: 'enrich',
        data: {
          id: company.id
        }
      }),
      headers: {
        'Accept': 'application/json', 
        'Content-Type': 'application/json',
        'X-Api-Key': `Key ${config.graphcmsWebhookKey}`
      }
    })
    if (err) {
      console.debug(`Error calling graphcms.enrichCompanyOnChange function`, { error: err })
    }
  }
  return
}

export default _.compose(
  useLambda(),
  useService<Services>({
    graphcms: makeGraphCMS()
  }),
  enrichCompanies
)