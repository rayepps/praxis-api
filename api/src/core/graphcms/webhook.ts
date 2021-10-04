import _ from 'radash'
import { createHmac } from 'crypto'
import {
  ComposedApiFunc,
  ApiRequestProps
} from '../http/types'
import errors from '../http/errors'


/**
 * See https://github.com/GraphCMS/graphcms-utils
 */
export async function withWebhookSignature(func: ComposedApiFunc, secret: string, props: ApiRequestProps) {

  const { headers, body } = props.meta
  
  const signature = headers['gcms-signature']

  if (!signature) {
    throw errors.unauthorized({
      details: 'This function requires a webhook signature',
      key: 'nfg.err.core.auth.amorphisal'
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
      key: 'nfg.err.core.graphcms.nicities'
    })
  }

  return await func(props)
}

export const useWebhookSignatureAuthentication = (secret: string) => (func: ComposedApiFunc) => {
  return _.partial(withWebhookSignature, func, secret)
}