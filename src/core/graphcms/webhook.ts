import _ from 'radash'
import { createHmac } from 'crypto'
import type { Props, ApiFunction } from '@exobase/core'
import { errors } from '@exobase/core'

/**
 * See https://github.com/GraphCMS/graphcms-utils
 */
export async function withWebhookSignature(func: ApiFunction, secret: string, props: Props) {
  const { headers, body } = props.req

  const signature = headers['gcms-signature'] as string

  if (!signature) {
    throw errors.unauthorized({
      details: 'This function requires a webhook signature',
      key: 'px.err.core.auth.amorphisal'
    })
  }

  const [rawSign, rawEnv, rawTimestamp] = signature.split(', ')

  const sign = rawSign.replace('sign=', '')
  const EnvironmentName = rawEnv.replace('env=', '')
  const Timestamp = parseInt(rawTimestamp.replace('t=', ''))

  const payload = JSON.stringify({
    Body: JSON.stringify(body),
    EnvironmentName,
    TimeStamp: Timestamp
  })

  const hash = createHmac('sha256', secret).update(payload).digest('base64')

  const isValid = sign === hash

  if (!isValid) {
    throw errors.unauthorized({
      details: 'Invalid webhook signature',
      key: 'px.err.core.graphcms.nicities'
    })
  }

  return await func(props)
}

export const useWebhookSignatureAuthentication = (secret: string) => (func: ApiFunction) => {
  return _.partial(withWebhookSignature, func, secret)
}
