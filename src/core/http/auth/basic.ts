import _ from 'radash'
import errors from '../errors'
import {
    ComposedApiFunc,
    ApiRequestProps
} from '../types'


export async function requireBasicToken (func: ComposedApiFunc, props: ApiRequestProps) {
  const header = props.meta.headers['authorization']
  if (!header) {
    throw errors.unauthorized({
      details: 'This function requires authentication via a token', 
      key: 'l.err.access.token.canes-venatici'
    })
  }
  
  const basicToken = header.startsWith('Basic ') && header.replace('Basic ', '')
  if (!basicToken) {
    throw errors.unauthorized({
      details: 'This function requires authentication via a token', 
      key: 'l.err.access.token.noramusine'
    })
  }
  
  const [clientId, clientSecret] = Buffer.from(basicToken, 'base64').toString().split(':')
  if (!clientId || !clientSecret) {
    throw errors.unauthorized({
      details: 'Cannot call this function without a valid authentication token', 
      key: 'l.err.access.token.canis-major'
    })
  }  

  return await func({
    ...props,
    auth: {
      ...props.auth,
      clientId,
      clientSecret
    }
  })
}

export const useBasicAuthentication = () => (func: ComposedApiFunc) => {
  return _.partial(requireBasicToken, func)
}

