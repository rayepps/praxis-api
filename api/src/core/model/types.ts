
//
//  LEGEND
//
//  _ = private, should not be deliverd to client, ever, internal
//  $ = nosql non-normal duplication of source record, compressed
//
//  This convention helps us easily identify internal fields that
//  should never be exposed to the user -- namely in the mappers.
//

export enum UserAccessControlLevel {
    guest = 'guest',
    user = 'user',
    admin = 'admin'
}

export enum UserAccountStatus {
    active = 'active',
    suspended = 'suspended'
}

export interface User {
    id: string
    email: string
    createdAt: number
    fullName: string
    phoneNumber: string
    acl: UserAccessControlLevel
}

export interface UserCreds {
    _hash: string
}
