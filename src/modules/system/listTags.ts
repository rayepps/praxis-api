import _ from 'radash'
import * as t from '../../core/types'
import type { Props } from '@exobase/core'
import { useService } from '@exobase/hooks'
import { useLambda } from '@exobase/lambda'
import makeGraphCMS, { GraphCMS } from '../../core/graphcms'

interface Args {}

interface Services {
  graphcms: GraphCMS
}

interface Response {
  tags: t.Tag[]
}

async function listTags({ services }: Props<Args, Services>): Promise<Response> {
  const { graphcms } = services
  const tags = await graphcms.listTags()
  return {
    tags
  }
}

export default _.compose(
  useLambda(),
  useService<Services>({
    graphcms: makeGraphCMS()
  }),
  listTags
)
