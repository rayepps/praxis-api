import * as t from './types'
import permissions from './permissions'
import { create as createToken } from './http/auth/token'
import { Permission } from './http/auth/permission'


export const permissionsForUser = (user: t.User): Permission[] => {
    if (user.acl === t.UserAccessControlLevel.admin) {
        return permissions.defaultAdminPermissions
    }
    return permissions.defaultUserPermissions
}


export function generateToken(user: t.User, aptoToken?: string) {
    return createToken({
        sub: user.id,
        type: 'id',
        aud: 'nfg.app',
        iss: 'nfg.api',
        entity: 'user',
        provider: 'nfg',
        permissions: permissionsForUser(user),
        extra: {
            atok: aptoToken ?? null,
            fullName: user.fullName,
            email: user.email,
            acl: user.acl
        }
    })
}