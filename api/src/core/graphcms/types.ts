
//
//  LEGEND
//
//  _ = private, should not be deliverd to client, ever, internal
//  $ = nosql non-normal duplication of source record, compressed
//
//  This convention helps us easily identify internal fields that
//  should never be exposed to the user -- namely in the mappers.
//


export type TrainingType = 'tactical' | 'medical' | 'survival'


//
//  UTILITY Types
//

export interface Hash {
    raw: string
    fields: string[]
}

//
//  INTERNAL GraphCMS Types
//

/**
 * All GraphCMS collection items get these fields
 * generated and managed by GraphCMS
 */
interface BaseEntity {
    __typename: string
    id: string
    createdAt: string
    createdBy: Author
    updatedAt: string
    updatedBy: Author
    publishedAt: string
    publishedBy: Author
    stage: 'DRAFT' | 'PUBLISHED'
}

export interface Author {
    id: string
    name: string
}

export interface Location {
    longitude: number
    latitude: number
}

export interface Asset extends BaseEntity {
    url: string
    size: number
    fileName: string
    width: number
    height: number
}

//
//  PROTOCOLS of sorts
//

export interface Tag extends BaseEntity {
    name: string
    slug: string
}

export interface Enrichable {
    enrichedAt: string
    enrichmentVersion: number | null
}

export interface Syncable {
    webflowId: string
    syncedAt: string
    desyncedAt: string
}

export interface Hashable {
    hash: Hash | null
}

//
//  MODELS
//

export interface LocationMetadata extends BaseEntity {
    state: USState
    cities: Record<string, number>
}

export interface ErrorTracker extends BaseEntity {
    source: string
    requestId: string
    company: Company | null
    event: Event | null
    training: Training | null
}

export interface Company extends BaseEntity, Enrichable, Hashable {
    name: string
    key: string
    description: string
    thumbnail: Asset
    slug: string
    instructors: Instructor[]
    trainings: Training[]
    directLink: string
    externalLink: string
}

export interface Training extends BaseEntity, Enrichable, Syncable, Hashable {
    name: string
    company: Company
    directLink: string
    externalLink: string
    tags: Tag[]
    price: number
    type: TrainingType
    description: string
    gallery: Asset[]
    thumbnail: Asset
    events: Event[]
    slug: string
    displayPrice: string | null
}

export interface Instructor extends BaseEntity {
    name: string
    company: Company
    thumbnail: Asset
    bio: string
    events: [Event]
    slug: string
}

export interface Event extends BaseEntity, Syncable, Enrichable, Hashable {
    startDate: string
    endDate: string
    training: Training
    location: Location
    directLink: string
    externalLink: string
    slug: string
    city: string
    state: USState
    trainingPrice: number
    name: string
}

export interface LocationMapping extends BaseEntity {
    state: USState
    city: string
    slug: string
    events: Event[]
}

export enum USState {
    'AL' = 'AL',
    'AK' = 'AK',
    'AZ' = 'AZ',
    'AR' = 'AR',
    'CA' = 'CA',
    'CO' = 'CO',
    'CT' = 'CT',
    'DE' = 'DE',
    'FL' = 'FL',
    'GA' = 'GA',
    'HI' = 'HI',
    'ID' = 'ID',
    'IL' = 'IL',
    'IN' = 'IN',
    'IA' = 'IA',
    'KS' = 'KS',
    'KY' = 'KY',
    'LA' = 'LA',
    'ME' = 'ME',
    'MD' = 'MD',
    'MA' = 'MA',
    'MI' = 'MI',
    'MN' = 'MN',
    'MS' = 'MS',
    'MO' = 'MO',
    'MT' = 'MT',
    'NE' = 'NE',
    'NV' = 'NV',
    'NH' = 'NH',
    'NJ' = 'NJ',
    'NM' = 'NM',
    'NY' = 'NY',
    'NC' = 'NC',
    'ND' = 'ND',
    'OH' = 'OH',
    'OK' = 'OK',
    'OR' = 'OR',
    'PA' = 'PA',
    'RI' = 'RI',
    'SC' = 'SC',
    'SD' = 'SD',
    'TN' = 'TN',
    'TX' = 'TX',
    'UT' = 'UT',
    'VT' = 'VT',
    'VA' = 'VA',
    'WA' = 'WA',
    'WV' = 'WV',
    'WI' = 'WI',
    'WY' = 'WY'
  }