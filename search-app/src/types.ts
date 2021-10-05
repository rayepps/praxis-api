
export type Dict<T> = { [key: string]: T }

export type TrainingType = 'tactical' | 'medical' | 'survival'

export interface SearchFilter {
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

export interface Tag {
    id: string
    name: string
    slug: string
}

export interface Company {
    id: string
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

export interface Training {
    id: string
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
    link: string
    slug: string
    city: string
    state: string
}