import _ from 'radash'
import * as t from '../../core/types'
import type { Props } from '@exobase/core'
import { useLogger } from '../../core/hooks/useLogger'
import { useJsonArgs, useService } from '@exobase/hooks'
import { useApiKeyAuthentication } from '@exobase/auth'
import { useLambda } from '@exobase/lambda'
import makeGraphCMS, { GraphCMS } from '../../core/graphcms'
import config from '../../core/config'
import { ENRICHMENT_VERSION } from '../../core/const'
import makeRedirector, { Redirector } from '../../core/redirector'
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
  redirector: Redirector
}

async function onCompanyChange({ args, services }: Props<Args, Services>) {
  const { graphcms, redirector } = services
  const { id: companyId } = args.data

  const company = await graphcms.findCompany(companyId)

  if (!Hashable.hasChanged(company, identify)) {
    console.log('Skipping company because hash is still valid', {
      hash: company.hash
    })
    return
  }

  const { error, data } = await redirector.links.create({
    url: company.directLink,
    title: `Company: ${company.name} id(${companyId})`
  }, { key: config.redirectorApiKey })
  if (error) {
    // quietly log error. Trying not to throw in webhook
    console.error('Request to redirector for company link', { error, company })
    return
  }

  await graphcms.enrichCompany(company.id, {
    externalLink: data.link.link,
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
  useLogger(),
  useLambda(),
  useApiKeyAuthentication(config.graphcmsWebhookKey),
  useJsonArgs<Args>(yup => ({
    operation: yup.string(),
    data: yup.mixed()
  })),
  useService<Services>({
    graphcms: makeGraphCMS(),
    redirector: makeRedirector()
  }),
  onCompanyChange
)
