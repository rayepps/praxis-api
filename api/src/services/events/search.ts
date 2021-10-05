import _ from 'radash'
import * as t from '../../core/types'
import {
  useLambda,
  useService,
  useJsonArgs,
} from '../../core/http'
import makeGraphCMS, { GraphCMS } from '../../core/graphcms'


interface Args {
  filters: {
    types?: t.TrainingType[]
    tags?: string[]
    state?: string
    city?: string
    company?: string
    dates?: {
      preset: 'this-month' | 'next-month' | 'custom'
      startsAfter?: string
      endsBefore?: string
    }
  }
  page: {
    size: number
    number: number
  }
}

interface Services {
  graphcms: GraphCMS
}

interface Response {
  events: t.Event[]
  total: number
}

async function searchEvents({ args, services }: t.ApiRequestProps<Args, Services>): Promise<Response> {
  const { graphcms } = services
  const { filters, page } = args

  const {
    events,
    total
  } = await graphcms.searchEvents({
    filters,
    page
  })

  return {
    events,
    total
  }

}

export default _.compose(
  useLambda(),
  useJsonArgs<Args>(yup => ({
    filters: yup.object({
      types: yup.array().of(yup.string()),
      tags: yup.array().of(yup.string()),
      state: yup.string(),
      city: yup.string(),
      company: yup.string(),
      dates: yup.object({
        preset: yup.string(),
        startsAfter: yup.string(),
        endsBefore: yup.string()
      })
    }),
    page: yup.object({
      size: yup.number().integer().positive(),
      number: yup.number().min(0)
    })
  })),
  useService<Services>({
    graphcms: makeGraphCMS()
  }),
  searchEvents
)