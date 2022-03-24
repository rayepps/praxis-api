import _ from 'radash'
import type { Props } from '@exobase/core'
import { useLogger } from '../../core/hooks/useLogger'
import { useService } from '@exobase/hooks'
import { useCors } from '../../core/hooks/useCors'
import { useLambda } from '@exobase/lambda'
import makeGraphCMS, { GraphCMS } from '../../core/graphcms'
import * as t from '../../core/types'
import { useApiKeyAuthentication } from '@exobase/auth'
import config from '../../core/config'

interface Args {}

interface Services {
  graphcms: GraphCMS
}

interface Response {
  giveaway: t.Giveaway | null
}

async function getActiveGiveaway({ services }: Props<Args, Services>): Promise<Response> {
  const { graphcms } = services
  const giveaways = await graphcms.listGiveaways()
  const active = giveaways.filter(g => g.active)
  if (!active) {
    return {
      giveaway: null
    }
  }
  if (active.length === 1) {
    return {
      giveaway: active[0]
    }
  }
  return {
    giveaway: _.sort(active, a => new Date(a.endDate).getTime())[0]
  }
}

export default _.compose(
  useLogger(),
  useLambda(),
  useApiKeyAuthentication(config.apiKey),
  useService<Services>({
    graphcms: makeGraphCMS()
  }),
  getActiveGiveaway
)
