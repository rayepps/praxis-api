import WebflowApi from 'webflow-api'
import { Webflow } from './client'
import config from '../../config'

export type { Webflow }

export default function makeWebflow(): Webflow {
  return new Webflow(
    new WebflowApi({ token: config.webflowApiToken })
  )
} 