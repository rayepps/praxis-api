import _ from 'radash'
import config from './config'
import * as t from './types'


export interface ApiError {
  message: string
  details: string
}

export interface ApiResponse<T> {
  error: ApiError | null
  data: T
}

const networkError = {
  message: 'Network Error',
  details: 'We\'re not sure whats wrong, there was an issue using the network.'
}

//
//
// HOW TO FETCH
//
//

export default async function fetcher<T = any>(endpoint: string, options: RequestInit): Promise<[ApiError | null, T | null]> {
  const { apiUrl } = config
  const [netErr, response] = await _.tryit<Response>(fetch)(`${apiUrl}${endpoint}`, {
    ...options,
    method: 'POST',
    headers: {
      ...options?.headers,
      'content-type': 'application/json'
    }
  })
  if (netErr || !response) return [networkError, null]
  const [parseErr, json] = await _.tryit<any>(() => response.json())()
  if (parseErr) return [networkError, null]
  if (json.error) {
    console.error(json.error)
    return [json.error, null]
  }
  return [null, json]
}


//
//
// API FUNCTIONS
//
//

export async function searchEvents(query: t.SearchQuery): Promise<ApiResponse<{
  events: t.Event[]
  total: number
}>> {
  const [error, json] = await fetcher('/events/search', {
    body: JSON.stringify(query)
  })
  return { error, data: json?.payload }
}

export async function findEvent(eventId: string): Promise<ApiResponse<{
  event: t.Event
}>> {
  const [error, json] = await fetcher('/events/findById', {
    body: JSON.stringify({
      eventId
    })
  })
  return { error, data: json?.payload }
}

export async function listCompanies(): Promise<ApiResponse<{
  companies: t.Company[]
}>> {
  const [error, json] = await fetcher('/system/listCompanies', {
    body: JSON.stringify({})
  })
  return { error, data: json?.payload }
}

export async function getSystemMetadata(): Promise<ApiResponse<{
  companies: t.Company[]
}>> {
  const [error, json] = await fetcher('/system/metadata', {
    body: JSON.stringify({})
  })
  return { error, data: json?.payload }
}

export async function listTags(): Promise<ApiResponse<{
  tags: t.Tag[]
}>> {
  const [error, json] = await fetcher('/system/listTags', {
    body: JSON.stringify({})
  })
  return { error, data: json?.payload }
}