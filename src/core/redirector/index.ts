import _ from 'radash'
import api from '@exobase/client-builder'
import * as t from '../types'
import config from '../config'

const createRedirector = () => {
  const endpoint = api(config.redirectorUrl)
  return {
    links: {
      create: endpoint<
        {
          url: string
          title: string
          class: 'company' | 'training' | 'event'
          metadata?: any
        },
        {
          link: t.LinkRef
        }
      >({
        module: 'links',
        function: 'create'
      })
    }
  }
}

export type Redirector = ReturnType<typeof createRedirector>

export default createRedirector
