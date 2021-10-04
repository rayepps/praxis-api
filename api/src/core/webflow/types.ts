
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
    state: string
    webflowId: string
    hash: Hash | null
}