import type { Event } from '../graphcms/types'
import { UserRole } from '../model/types'

export interface UserView {
  _view: 'px.user'
  id: string
  email: string
  createdAt: number
  fullName: string
  phone: string
  role: UserRole
}

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