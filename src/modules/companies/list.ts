import _ from 'radash'
import * as t from '../../core/types'
import type { Props } from '@exobase/core'
import { useLogger } from '../../core/hooks/useLogger'
import { useService } from '@exobase/hooks'
import { useCors } from '../../core/hooks/useCors'
import { useLambda } from '@exobase/lambda'
import makeGraphCMS, { GraphCMS } from '../../core/graphcms'
import makeCacheClient, { CacheClient } from '../../core/cache'
import { useCachedResponse } from '../../core/hooks/useCachedResponse'

interface Args {}

interface Services {
  graphcms: GraphCMS
  cache: CacheClient
}

interface Response {
  companies: t.Company[]
}

async function listCompanies({ services }: Props<Args, Services>): Promise<Response> {
  const { graphcms } = services
  const companies = await graphcms.listCompanies()
  return {
    companies
  }
}

export default _.compose(
  useLogger(),
  useLambda(),
  useCors(),
  useService<Services>({
    graphcms: makeGraphCMS(),
    cache: makeCacheClient()
  }),
  useCachedResponse({
    key: 'px.companies.all',
    ttl: '5 minutes'
  }),
  listCompanies
)
