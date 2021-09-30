import _ from 'radash'
import * as t from '../../core/types'
import makeDb, { Database } from '../../core/db'
import { generateToken } from '../../core/token'
import model from '../../core/model'
import {
    useLambda,
    useService,
    useJsonArgs
} from '../../core/http'


interface Args {
    deviceId: string
}

interface Services {
    db: Database
}

interface Response {
    idToken: string
}

async function loginAsAnonymousGuest({ services, args }: t.ApiRequestProps<Args, Services>): Promise<Response> {
    const { db } = services
    const { deviceId } = args

    const userId = model.User.id(deviceId)

    const user = await db.findUserById(userId)

    if (user) return {
        idToken: generateToken(user)
    }

    const guest: t.User = {
        id: userId,
        acl: t.UserAccessControlLevel.guest,
        email: 'none',
        fullName: 'none',
        phoneNumber: 'none',
        createdAt: new Date().getTime()
    }

    await db.addUser(guest, 'none')

    return {
        idToken: generateToken(guest)
    }

}


export default _.compose(
    useLambda(),
    useService({
        db: makeDb()
    }),
    useJsonArgs<Args>(yup => ({
        deviceId: yup.string().required()
    })),
    loginAsAnonymousGuest
)