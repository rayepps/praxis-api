import bcrypt from 'bcryptjs'
import _ from 'radash'
import * as t from '../../core/types'
import mappers from '../../core/view/mappers'
import makeDb, { Database } from '../../core/db'
import { generateToken } from '../../core/token'
import {
    useJsonArgs,
    useLambda,
    useService
} from '../../core/http'
import errors from '../../core/http/errors'
import * as model from '../../core/model'

const SALT_ROUNDS = 10

interface Args {
    email: string
    password: string
    firstName: string
    lastName: string
}

interface Services {
    db: Database
}

interface Response {
    user: t.UserView
    idToken: string
}

export async function signupWithEmailPass({ services, args }: t.ApiRequestProps<Args, Services>): Promise<Response> {
    const { db } = services
    const { email, password } = args

    const userId = model.User.id(email)

    const existingUser = await db.findUserById(userId)

    if (existingUser) {
        throw errors.badRequest({
            details: 'Account with this email already exists',
            key: 'ln.err.users.signup.balay'
        })
    }

    const [error, hash] = await generateHash(password)

    if (error) {
        console.error(error)
        throw errors.badRequest({
            details: 'There was a problem with you\'re password. We recommend you try another one.',
            key: 'ln.err.users.signup.marinarty'
        })
    }

    const user: t.User = {
        id: userId,
        fullName: `${args.firstName} ${args.lastName}`,
        email,
        createdAt: new Date().getTime(),
        acl: t.UserAccessControlLevel.admin, // TEMP: For alpha testing off the whitelist. Should be: t.UserAccessControlLevel.user,
        phoneNumber: null
    }

    await db.addUser(user, hash)

    return {
        idToken: generateToken(user),
        user: mappers.UserView.fromUser(user)
    }

}

async function generateHash(password: string): Promise<[Error, string]> {
    return new Promise((resolve) => {
        bcrypt.hash(password, SALT_ROUNDS, (err, hash) => {
            if (err) resolve([err, null])
            else resolve([null, hash])
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
        password: yup.string().required(),
        firstName: yup.string().required(),
        lastName: yup.string().required()
    })),
    signupWithEmailPass
)

