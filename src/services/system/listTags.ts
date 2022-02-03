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
  tags: t.Tag[]
}

async function listTags({ services }: t.ApiRequestProps<Args, Services>): Promise<Response> {
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