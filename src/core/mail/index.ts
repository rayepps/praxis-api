import { ServerClient } from 'postmark'
import makeMailClient from './client'
import config from '../config'

const makeMail = () => {
  return makeMailClient(
    new ServerClient(config.postmarkToken)
  )
}

export { MailClient } from './client'

export default makeMail
