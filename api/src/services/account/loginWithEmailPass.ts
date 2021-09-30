import bcrypt from 'bcryptjs'
import _ from 'radash'
import * as t from '../../core/types'
import mappers from '../../core/view/mappers'
import makeDb, { Database } from '../../core/db'
import { generateToken } from '../../core/token'
import {
    useLambda,
    useService,
    useJsonArgs
} from '../../core/http'
import errors from '../../core/http/errors'
import * as model from '../../core/model'


interface Args {
    email: string
    password: string
}

interface Services {
    db: Database
}

interface Response {
    user: t.UserView
    idToken: string
}

async function loginWithEmailPass({ services, args }: t.ApiRequestProps<Args, Services>): Promise<Response> {
    const { db } = services
    const { email, password } = args

    const userId = model.User.id(email)

    // Lookup user with email
    const creds = await db.findUserCredentials(userId)

    if (!creds) {
        throw errors.badRequest({
            details: 'Provided credentials did not match any users',
            key: 'ln.err.auth.login-with-email-pass.seruptic'
        })
    }

    const [err, isMatch] = await compareCreds(password, creds._hash)

    if (err || !isMatch) {
        throw errors.badRequest({
            details: 'Provided credentials did not match any users',
            key: 'ln.err.auth.login-with-email-pass.seruptio'
        })
    }

    const user = await db.findUserById(userId)

    return {
        idToken: generateToken(user),
        user: mappers.UserView.fromUser(user)
    }

}

async function compareCreds(providedPassword: string, savedHash: string): Promise<[Error, boolean]> {
    return new Promise((resolve) => {
        bcrypt.compare(providedPassword, savedHash, (err, isMatch) => {
            if (err) resolve([err, false])
            else resolve([null, isMatch])
        })
    })
}

export default _.compose(
    useLambda(),
    useService({
        db: makeDb()
    }),
    useJsonArgs(yup => ({
        email: yup.string().required(),
        password: yup.string().required()
    })),
    loginWithEmailPass
)