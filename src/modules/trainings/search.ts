import _ from 'radash'
import * as t from '../../core/types'
import type { Props } from '@exobase/core'
import { useLogger } from '../../core/hooks/useLogger'
import { useJsonArgs, useService } from '@exobase/hooks'
import { useCors } from '../../core/hooks/useCors'
import { useLambda } from '@exobase/lambda'
import makeGraphCMS, { GraphCMS } from '../../core/graphcms'
import makeCache, { CacheClient } from '../../core/cache'
import { useCachedResponse } from '../../core/hooks/useCachedResponse'

interface Args {
  pageSize?: number
  page?: number
  order?: t.TrainingSearchOrder
  type?: t.TrainingType
  tags?: string[]
  state?: string
  city?: string
  appointmentOnly?: boolean
  company?: string
}

interface Services {
  graphcms: GraphCMS
  cache: CacheClient
}

type Response = Args & {
  trainings: t.Training[]
  total: number
}

async function listAppointmentOnly({ args, services }: Props<Args, Services>): Promise<Response> {
  const { graphcms } = services
  const query = {
    ...args,
    page: args.page ?? 1,
    pageSize: args.pageSize ?? 25,
    order: args.order ?? 'price:asc'
  }
  const { total, trainings } = await graphcms.searchTrainings(query)
  return {
    total, trainings, ...query
  }
}

export default _.compose(
  useLogger(),
  useLambda(),
  useCors(),
  useJsonArgs<Args>(yup => ({
    pageSize: yup.number().integer().positive(),
    page: yup.number().integer().positive(),
    order: yup.string(), // TODO: Require specific values
    type: yup.string(),
    tags: yup.array().of(yup.string()),
    state: yup.string(),
    city: yup.string(),
    appointmentOnly: yup.boolean(),
    company: yup.string(),
  })),
  useService<Services>({
    graphcms: makeGraphCMS(),
    cache: makeCache()
  }),
  useCachedResponse({
    key: 'px.trainings.appointment-only'
  }),
  listAppointmentOnly
)
