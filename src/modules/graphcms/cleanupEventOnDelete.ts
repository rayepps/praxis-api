import _ from 'radash'
import * as t from '../../core/types'
import type { Props } from '@exobase/core'
import { useLogger } from '../../core/hooks/useLogger'
import { useJsonArgs, useService } from '@exobase/hooks'
import { useApiKeyAuthentication } from '@exobase/auth'
import { useLambda } from '@exobase/lambda'
import makeGraphCMS, { GraphCMS } from '../../core/graphcms'
import config from '../../core/config'

interface Args {
  operation: 'delete'
  data: {
    __typename: 'Event'
    id: string
    stage: 'DRAFT'
  }
}

interface Services {
  graphcms: GraphCMS
}

async function onEventDelete({ args, services }: Props<Args, Services>) {
  const { graphcms } = services
  const event = args.data
  await graphcms.disconnectFromLocationMapping(event as t.Event)
}

export default _.compose(
  useLogger(),
  useLambda(),
  useApiKeyAuthentication(config.graphcmsWebhookKey),
  useJsonArgs<Args>(yup => ({
    operation: yup.string(),
    data: yup.mixed()
  })),
  useService<Services>({
    graphcms: makeGraphCMS()
  }),
  onEventDelete
)
