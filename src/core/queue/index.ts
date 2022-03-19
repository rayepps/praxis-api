import axios from 'axios'
import makeQueueClient from './client'
import config from '../config'

const makeQueue = () => {
  return makeQueueClient(axios, config.autopilotApiKey)
}

export { QueueClient } from './client'

export default makeQueue
