import _ from 'radash'
import * as t from '../../core/types'
import {
  useJsonArgs,
  useLambda,
  useService
} from '../../core/http'
import makeGraphCMS, { GraphCMS } from '../../core/graphcms'


interface Args { 
  state: t.USState
}

interface Services {
  graphcms: GraphCMS
}

interface Response {
  cities: string[]
}

async function listCitiesInState({ args, services }: t.ApiRequestProps<Args, Services>): Promise<Response> {
  const { state } = args
  const { graphcms } = services
  const cities = await graphcms.listCitiesInState(state)
  return {
    cities
  }
}

export default _.compose(
  useLambda(),
  useJsonArgs<Args>(yup => ({
    state: yup.string().required()
  })),
  useService<Services>({
    graphcms: makeGraphCMS()
  }),
  listCitiesInState
)