import _ from 'radash'
import type { Props } from '@exobase/core'
import { useLogger } from '../../core/hooks/useLogger'
import { useJsonArgs, useService, useCors } from '@exobase/hooks'
import { useLambda } from '@exobase/lambda'
import makeSlack, { SlackClient } from '../../core/slack'

interface Args {
  email: string
  source: string
}

interface Services {
  slack: SlackClient
}

// interface Response {}

async function addContact({ args, services }: Props<Args, Services>): Promise<void> {
  const { email, source } = args
  const { slack } = services
  await slack.sendMessage(`New submission from home.${source}: ${email}`);
}

export default _.compose(
  useLogger(),
  useLambda(),
  useCors(),
  useJsonArgs<Args>(yup => ({
    email: yup.string().required(),
    source: yup.string().required()
  })),
  useService<Services>({
    slack: makeSlack()
  }),
  addContact
)
