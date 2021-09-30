
import token from './token'
import permission from './permission'

export { useBasicAuthentication } from './basic'
export { useTokenAuthentication } from './bearer'
export { useApiKeyAuthentication } from './key'

export default {
  token,
  permission
}