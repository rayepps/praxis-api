import _ from 'radash'
import URI from 'urijs'
import * as t from '../../core/types'
import type { Props } from '@exobase/core'
import { useJsonArgs, useService } from '@exobase/hooks'
import { useApiKeyAuthentication } from '@exobase/auth'
import { useLambda } from '@exobase/lambda'
import config from '../../core/config'
import makeDatabase, { Database } from '../../core/db'
import makeRedirector, { Redirector } from '../../core/redirector'

interface Args {
  url: string
  title: string
}

interface Services {
  db: Database
  redirector: Redirector
}

type Response = t.LinkRef

async function createLink({ args, services }: Props<Args, Services>): Promise<Response> {
  const { db, redirector } = services
  const { url, title } = args

  const { link, path: code } = await redirector.createRedirectLink({
    url,
    title
  })

  const linkRef: t.LinkRef = {
    code,
    url,
    domain: URI(url).domain(),
    link: `https://${link}`, // short.io does not include protocol
    title
  }

  await db.addLinkRef(linkRef)

  return linkRef
}

export default _.compose(
  useLambda(),
  useApiKeyAuthentication(config.apiKey),
  useJsonArgs<Args>(yup => ({
    url: yup.string().required(),
    title: yup.string().required()
  })),
  useService<Services>({
    db: makeDatabase(),
    redirector: makeRedirector()
  }),
  createLink
)
