
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
    _id: string
    name: string
    slug: string
}

export interface WebflowTraining extends BaseEntity {
    gcmsId: string
    thumbnailUrl: string
    companyName: string
    companyThumbnailUrl: string
    companyGcmsId: string
    displayPrice: string
}

export interface WebflowEvent extends BaseEntity {
    gcmsId: string
    city: string
    state: string
    longitude: number
    latitude: number
    startDate: string
    endDate: string
    companyName: string
    displayPrice: string
}