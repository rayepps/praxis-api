import _ from 'radash'
import * as t from '../../core/types'
import {
  useLambda,
  useService,
  useJsonArgs,
} from '../../core/http'
import makeGraphCMS, { GraphCMS } from '../../core/graphcms'


interface Args {
  eventId: string
}

interface Services {
  graphcms: GraphCMS
}

interface Response {
  event: t.Event
}

async function findEventById({ args, services }: t.ApiRequestProps<Args, Services>): Promise<Response> {
  const { graphcms } = services
  const { eventId } = args

  const event = await graphcms.findEvent(eventId)

  return {
    event
  }

}

export default _.compose(
  useLambda(),
  useJsonArgs<Args>(yup => ({
    eventId: yup.string().required()
  })),
  useService<Services>({
    graphcms: makeGraphCMS()
  }),
  findEventById
)