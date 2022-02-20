import _ from 'radash'
import * as t from '../../core/types'
import type { Props } from '@exobase/core'
import { useJsonArgs, useService } from '@exobase/hooks'
import { useApiKeyAuthentication } from '@exobase/auth'
import { useLambda } from '@exobase/lambda'
import makeGraphCMS, { GraphCMS } from '../../core/graphcms'
import config from '../../core/config'
import { ENRICHMENT_VERSION } from '../../core/const'
import logger from '../../core/logger'
import makeApi, { PraxisApi } from '../../core/api'
import Hashable from '../../core/graphcms/hashable'

interface Args {
  operation: 'update' | 'create' | 'enrich'
  data: {
    __typename: 'Company'
    id: string
    stage: 'DRAFT'
  }
}

interface Services {
  graphcms: GraphCMS
  api: PraxisApi
}

async function onCompanyChange({ args, services }: Props<Args, Services>) {
  const { graphcms, api } = services
  const { id: companyId } = args.data

  const company = await graphcms.findCompany(companyId)

  if (!Hashable.hasChanged(company, identify)) {
    logger.debug('Skipping company because hash is still valid', {
      hash: company.hash
    })
    return
  }

  const externalLink = await api.fetch<t.LinkRef>('linking.createLink', {
    url: company.directLink,
    title: `Company: ${company.name} (${companyId})`
  })

  await graphcms.enrichCompany(company.id, {
    externalLink: externalLink.link,
    hash: Hashable.hash(company, identify)
  })
}

const identify = (company: t.Company): object => {
  return {
    id: company.id,
    directLink: company.directLink,
    enrichmentVersion: ENRICHMENT_VERSION
  }
}

export default _.compose(
  useLambda(),
  useApiKeyAuthentication(config.graphcmsWebhookKey),
  useJsonArgs<Args>(yup => ({
    operation: yup.string(),
    data: yup.mixed()
  })),
  useService<Services>({
    graphcms: makeGraphCMS(),
    api: makeApi()
  }),
  onCompanyChange
)
