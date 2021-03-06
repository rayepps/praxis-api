import _ from 'radash'
import * as t from '../../core/types'
import type { Props } from '@exobase/core'
import { useLogger } from '../../core/hooks/useLogger'
import { useService } from '@exobase/hooks'
import { useCors } from '../../core/hooks/useCors'
import { useLambda } from '@exobase/lambda'
import makeGraphCMS, { GraphCMS } from '../../core/graphcms'

interface Args {}

interface Services {
  graphcms: GraphCMS
}

interface Response {
  counts: Record<t.USState, number>
}

async function listStateEventCounts({ services }: Props<Args, Services>): Promise<Response> {
  const { graphcms } = services
  const countsByState = await graphcms.lookupStateTrainingCount()
  return {
    counts: countsByState
  }
}

export default _.compose(
  useLogger(),
  useLambda(),
  useCors(),
  useService<Services>({
    graphcms: makeGraphCMS()
  }),
  listStateEventCounts
)
