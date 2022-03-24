import type { Event } from '../graphcms/types'

export type ContactView = {
  _view: 'px.contact'
  id: string
  email: string
  phone?: string
  tags: string[]
  supressions: {
    timestamp: number
    campaign: string
  }[]
}

export type EventView = Event & {
  _view: 'px.event'
  recentlyPublished: boolean
}