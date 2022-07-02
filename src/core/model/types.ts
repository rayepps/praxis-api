
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

export type Model = 'user' | 'contact' | 'company' | 'event' | 'training'
export type Id <M extends Model> = `px.${M}.${string}`
export type UserRole = 'user' | 'admin' | 'admin-observer' | 'super-admin'
type TrainingType = 'tactical' | 'medical' | 'survival'

export interface User {
  id: Id<'user'>
  email: string
  createdAt: number
  fullName: string
  phone: string
  role: UserRole
  _passwordHash: string
  _legacyId?: string
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

export type Coordinates = {
  longitude: number
  latitude: number
}

export type GeoLocation = Coordinates & {
  city: string
  state: string
  zip: string
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

export interface AssetModel {
  id: string
  url: string
}

export interface TagModel {
  label: string
  slug: string
}

export interface CompanyModel {
  id: Id<'company'>
  name: string
  slug: string
  description: string
  directLink: string
  trackedLink: string
  images: AssetModel[]
  trainings: TrainingModel[]
  _legacyId: string | null
  published: boolean
  updatedAt: number
  createdAt: number
  updater: Pick<User, 'fullName' | 'id'>
  creator: Pick<User, 'fullName' | 'id'>
}

export interface TrainingModel {
  id: Id<'training'>
  name: string
  type: TrainingType
  schedule: 'event' | 'appointment'
  slug: string
  directLink: string
  trackedLink: string
  priceUnit: 'course' | 'hour'
  price: number
  displayPrice: string
  tags: TagModel[]
  description: string
  images: AssetModel[]
  location: null | GeoLocation
  events: EventModel[]
  company: Omit<CompanyModel, 'trainings'>
  _legacyId: string | null
  published: boolean
  updatedAt: number
  createdAt: number
  updater: Pick<User, 'fullName' | 'id'>
  creator: Pick<User, 'fullName' | 'id'>
}

export interface EventModel {
  id: Id<'event'>
  slug: string
  training: Omit<TrainingModel, 'events'>
  soldOut: boolean
  start: number
  end: number
  directLink: string
  trackedLink: string
  images: AssetModel[]
  location: null | GeoLocation
  published: boolean
  _legacyId: string | null
  updatedAt: number
  createdAt: number
  updater: Pick<User, 'fullName' | 'id'>
  creator: Pick<User, 'fullName' | 'id'>
}