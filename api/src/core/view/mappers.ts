import * as t from '../types'


export class UserView {
    static fromUser(user: t.User): t.UserView {
        return {
            _view: 'or.user',
            id: user.id,
            email: user.email,
            createdAt: user.createdAt,
            fullName: user.fullName,
            phoneNumber: user.phoneNumber,
            acl: user.acl
        }
    }
}

export default {
    UserView
}
