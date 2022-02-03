
import permission from './http/auth/permission'


export const permissions = {

    // User
    create_user: permission('user', 'create', 'create a new account'),
    read_user: permission('user', 'read', 'get detailed information about accounts'),
    update_self_user: permission('user', 'update:self', 'update its own user data'),

    translate_text: permission('translate', 'text', 'translate some text')

}

const allPermissions = Object.values(permissions)
const allPermissionKeys = allPermissions.map(p => p.key)

// Users do not start with some permissions. They only
// get them once they do certain signup steps. Here we
// are no including the create_card permission until
// they signup as a card holder.
const defaultUserPermissions = [
    permissions.read_user,
    permissions.update_self_user,
    permissions.translate_text
]

const defaultAdminPermissions = allPermissions

export default {
    ...permissions,
    all: allPermissions,
    keys: allPermissionKeys,
    defaultUserPermissions,
    defaultAdminPermissions
}
