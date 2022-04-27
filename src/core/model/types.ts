
//
//  LEGEND
//
//  _ = private, should not be deliverd to client, ever, internal
//  $ = nosql non-normal duplication of source record, compressed
//
//  This convention helps us easily identify internal fields that
//  should never be exposed to the user -- namely in the mappers.
//  It also helps identify non-normalized fields that need to be
//  kept in sync with the source.
//

export type Model = 'user' | 'contact'
export type Id <M extends Model> = `px.${M}.${string}`

export type UserRole = 'user' | 'admin' | 'admin-observer'

export interface User {
  id: Id<'user'>
  email: string
  createdAt: number
  fullName: string
  phone: string
  role: UserRole
  _passwordHash: string
}

export type ContactTag = 'joined.by.site-subscribe-popup'
  | 'joined.by.site-contact-form'
  | 'joined.by.site-partner-form'
  | 'joined.by.giveaway'
  | `joined.campaign.${string}`
  | `joined.giveaway.${string}`

export type ContactSupression = {
  timestamp: number
  campaign: string
}

export type GeoLocation = {
  longitude: number
  latitude: number
}

export interface Contact {
  id: Id<'contact'>
  email: string
  phone?: string
  tags: ContactTag[]
  supressions: ContactSupression[]
}

export type TriggeredEventKey = 'px.event.process-new-events-notification'

export interface TriggeredEvent <T =any> {
  key: TriggeredEventKey
  timestamp: number
  metadata: T
}

export interface NewEventNotificationTriggeredEventMetadata {
  eventIds: string[]
}

export interface LinkRef {

  /**
   * The domain of the link. If full url is https://hello.com/go?t=23
   * the domain will be hello.com
   */
  domain: string

  /**
   * The original full and unmodified url given
   */
  url: string

  /**
   * The uid for this link
   */
  code: string

  /**
   * The link generated with code included
   */
  link: string

  /**
   * A descriptive title for this link
   */
  title: string
}