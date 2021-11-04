
export type Dict<T> = { [key: string]: T }

export type TrainingType = 'tactical' | 'medical' | 'survival'

export type OrderBy = 'date' | 'price'
export type OrderAs = 'asc' | 'desc'

export interface SearchPagination {
    pageSize: number
    page: number
}

export interface SearchOrder {
    orderBy: OrderBy
    orderAs: OrderAs
}

export interface SearchFilters {
    type?: TrainingType
    tags?: string[]
    state?: string
    city?: string
    company?: string
    dates?: {
        preset: 'this-month' | 'next-month' | 'custom'
        startsAfter?: string
        endsBefore?: string
    }
}

export interface SearchCurrentEvent {
    eventId?: string
}

export interface Hashable {
    hash?: string
}

export type SearchQuery = SearchPagination & SearchOrder & SearchFilters & SearchCurrentEvent & Hashable

export interface Author {
    id: string
    name: string
}

export interface Location {
    longitude: number
    latitude: number
}

export interface Asset {
    id: string
    url: string
    size: number
    fileName: string
    width: number
    height: number
}

export interface RichText {
    raw: any
    html: string
}

export interface Tag {
    id: string
    name: string
    slug: string
}

export interface FeaturedTag {
    tag: Tag
    thumbnail: Asset
}

export interface Company {
    id: string
    name: string
    description: string
    directLink: string
    externalLink: string
    thumbnail: Asset
    slug: string
    instructors: Instructor[]
    trainings: Training[]
}

export interface Training {
    id: string
    name: string
    company: Company
    directLink: string
    externalLink: string
    tags: Tag[]
    price: number
    type: TrainingType
    description: RichText
    gallery: Asset[]
    thumbnail: Asset
    events: Event[]
    slug: string
    displayPrice: string | null
}

export interface Instructor {
    id: string
    name: string
    company: Company
    thumbnail: Asset
    bio: string
    events: [Event]
    slug: string
}

export interface Event {
    id: string
    startDate: string
    endDate: string
    training: Training
    location: Location
    directLink: string
    externalLink: string
    slug: string
    city: string
    state: string
}

export interface FeatureTag {
    tag: Tag
    thumbnail: Asset
}