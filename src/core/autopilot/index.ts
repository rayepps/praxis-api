import axios from 'axios'
import makeAutopilotClient from './client'
import config from '../config'

const makeAutopilot = () => {
  return makeAutopilotClient(axios, config.autopilotApiKey)
}

export { Autopilot } from './client'

export default makeAutopilot
