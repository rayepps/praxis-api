import _ from 'radash'
import { AxiosStatic } from 'axios'
import config from '../config'

type Operation = {
  endpoint: `${string}/${string}`
  headers?: Record<string, string>
  delay?: number
  body?: any
}

const makeQueueClient = (axios: AxiosStatic) => {
  const url = (op: Operation) => {
    return `api.praxisco.us/${op.endpoint}`
  }
  return {
    push: async (op: Operation) => {
      await axios.post(
        `https://zeplo.to/${url(op)}` + (op.delay ? `?_delay=${op.delay}` : ''),
        op.body ?? {},
        {
          headers: {
            ...op.headers,
            'X-Api-Key': config.apiKey,
            'X-Zeplo-Token': config.zeploToken
          }
        }
      )
    },
    batch: async (operations: Operation[]) => {
      await axios.post(
        'https://zeplo.to/bulk',
        operations.map(op => ({
          url: `https://zeplo.to/${url(op)}` + (op.delay ? `?_delay=${op.delay}` : ''),
          method: 'POST',
          params: {
            _delay: op.delay ?? undefined
          },
          headers: {
            ...op.headers,
            'X-Api-Key': config.apiKey
          },
          body: op.body ?? {}
        })),
        {
          headers: {
            'X-Zeplo-Token': config.zeploToken
          }
        }
      )
    }
  }
}

export type QueueClient = ReturnType<typeof makeQueueClient>

export default makeQueueClient
