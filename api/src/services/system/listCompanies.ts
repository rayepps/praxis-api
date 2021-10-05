import _ from 'radash'
import * as t from '../../core/types'
import {
  useLambda,
  useService
} from '../../core/http'
import makeGraphCMS, { GraphCMS } from '../../core/graphcms'


interface Args { }

interface Services {
  graphcms: GraphCMS
}

interface Response {
  companies: t.Company[]
}

async function listCompanies({ services }: t.ApiRequestProps<Args, Services>): Promise<Response> {
  const { graphcms } = services
  const companies = await graphcms.listCompanies()
  return {
    companies
  }
}

export default _.compose(
  useLambda(),
  useService<Services>({
    graphcms: makeGraphCMS()
  }),
  listCompanies
)