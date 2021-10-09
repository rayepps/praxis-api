
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
    gcmsid: string
    thumbnailurl: string
    companyname: string
    companythumbnailurl: string
    companygcmsid: string
    displayprice: string
}

export interface WebflowEvent extends BaseEntity {
    gcmsid: string
    city: string
    state: string
    longitude: number
    latitude: number
    startdate: string
    enddate: string
    companyname: string
    displayprice: string
    link: string
    companyslug: string
    trainingslug: string
    traininglink: string
    companylink: string
}