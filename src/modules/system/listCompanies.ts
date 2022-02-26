import _ from 'radash'
import * as t from '../../core/types'
import type { Props } from '@exobase/core'
import { useLogger } from '../../core/hooks/useLogger'
import { useService, useCors } from '@exobase/hooks'
import { useLambda } from '@exobase/lambda'
import makeGraphCMS, { GraphCMS } from '../../core/graphcms'

interface Args {}

interface Services {
  graphcms: GraphCMS
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
    graphcms: makeGraphCMS()
  }),
  listCompanies
)
