import crypto from 'crypto'
import { v4 as uuid } from 'uuid'


// random 10 char string
const id = (modelType: 'user' | 'card' | 'paymethod' | 'merchant' | 'event', hash?: string) => {
    const rand = hash ? hash : uuid().replace(/[\-]/g, '').substr(0, 12)
    return `or.${modelType}.${rand}`
}

export const ids = {
    user: (email: string) => {
        const hash = crypto.createHash('md5').update(email).digest('hex')
        return id('user', hash)
    },
    merchant: () => id('merchant'),
    card: () => id('card'),
    paymethod: () => id('paymethod'),
    event: () => id('event')
}

export class User {
    static id (hashOrEmail: string) {
        return hashOrEmail.includes('@')
            ? ids.user(hashOrEmail)
            : id('user', hashOrEmail)
    }
}

export default {
    ids,
    User
}