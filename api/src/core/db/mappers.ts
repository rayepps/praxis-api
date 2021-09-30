import * as t from '../types'


export class UserRecord {
    static toUser(record: t.UserRecord): t.User {
        return {
            id: record.id,
            email: record.email,
            createdAt: record.createdAt,
            fullName: record.fullName,
            phoneNumber: record.phoneNumber,
            acl: record.acl
        }
    }
}

export class UserCredsRecord {
    static toUserCreds(record: t.UserCredsRecord): t.UserCreds {
        return {
            _hash: record._hash
        }
    }
}
