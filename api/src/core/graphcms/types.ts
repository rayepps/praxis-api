
//
//  LEGEND
//
//  _ = private, should not be deliverd to client, ever, internal
//  $ = nosql non-normal duplication of source record, compressed
//
//  This convention helps us easily identify internal fields that
//  should never be exposed to the user -- namely in the mappers.
//

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

export type TrainingType = 'tactical' | 'medical' | 'survival'

export interface Hash {
    raw: string
    fields: string[]
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

export interface Tag extends BaseEntity {
    name: string
    slug: string
}

export interface LocationMetadata extends BaseEntity {
    state: USState
    cities: Record<string, number>
}

export interface Company extends BaseEntity {
    name: string
    key: string
    description: string
    link: string
    thumbnail: Asset
    slug: string
    instructors: Instructor[]
    trainings: Training[]
    webflowId: string
}

export interface Training extends BaseEntity {
    name: string
    company: Company
    link: string
    tags: Tag[]
    price: number
    type: TrainingType
    description: string
    gallery: Asset[]
    thumbnail: Asset
    events: Event[]
    slug: string
    webflowId: string
    hash: Hash | null
    displayPrice: string | null
}

export interface Instructor extends BaseEntity {
    name: string
    company: Company
    thumbnail: Asset
    bio: string
    events: [Event]
    slug: string
    webflowId: string
}

export interface Event extends BaseEntity {
    startDate: string
    endDate: string
    training: Training
    location: Location
    link: string
    slug: string
    city: string
    state: USState
    trainingPrice: number
    webflowId: string
    enrichmentStatus: 'success' | 'error' | null
    enrichmentVersion: number | null
    name: string
    hash: Hash | null
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