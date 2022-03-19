import axios from 'axios'
import makeQueueClient from './client'

const makeQueue = () => {
  return makeQueueClient(axios)
}

export { QueueClient } from './client'

export default makeQueue
