/**
 * Module used to make request from one
 * function in the api to another function
 */
import _ from 'radash'
import axios, { AxiosResponse } from 'axios'
import config from '../config'
import logger from './logger'

// Keeping this minimal. Only adding
// function identifiers as needed
export type ApiFunction = 'graphcms.enrichEventOnChange'
  | 'graphcms.enrichTrainingOnChange'
  | 'linking.createLink'

export const fetch = async <K = any>(func: ApiFunction, data: any): Promise<K> => {
  const [service, functionName] = func.split('.')
  logger.log('api pre-fetch', {
    'config.baseUrl': config.baseUrl,
    service, functionName
  })
  const [err, result] = await _.try<AxiosResponse>(axios)({
    url: `${config.baseUrl}/${service}/${functionName}`,
    method: 'POST',
    data: JSON.stringify(data),
    headers: {
      'Accept': 'application/json', 
      'Content-Type': 'application/json',
      'X-Api-Key': `Key ${config.apiKey}`
    }
  })
  if (err) throw err
  return result.data?.result
}

export type PraxisApi = {
  fetch: typeof fetch
}

export const makeApi = (): PraxisApi => ({
  fetch
})

export default makeApi