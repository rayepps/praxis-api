
import jwt from 'jsonwebtoken'
import errors from '../errors'
import _ from 'radash'
import {
    ComposedApiFunc,
    ApiRequestProps
} from '../types'
import { Permission } from './permission'
import { Token } from './token'
import config from '../../../config'


interface JWTAuthOptions {
    type?: 'id' | 'access'
    iss?: 'or.api'
    permission?: Permission
    scope?: string
    [key: string]: string | number | any
}

const validateClaims = (decoded: Token, required: JWTAuthOptions) => {
    const { type, iss, permission, scope, ...rest } = required
    if (permission) {
        if (!decoded.permissions || !decoded.permissions.includes(permission.key)) {
            throw errors.forbidden({
                details: 'Given token does not have required permissions',
                key: 'l.err.core.auth.capricornus'
            })
        }
    }

    if (scope) {
        if (!decoded.scopes || !decoded.scopes.includes(scope)) {
            throw errors.forbidden({
                details: 'Given token does not have required scope',
                key: 'l.err.core.auth.caprinaught'
            })
        }
    }

    if (type) {
        if (!decoded.type || decoded.type !== type) {
            throw errors.forbidden({
                details: 'Given token does not have required type',
                key: 'l.err.core.auth.caprorilous'
            })
        }
    }

    if (iss) {
        if (!decoded.iss || decoded.iss !== iss) {
            throw errors.forbidden({
                details: 'Given token does not have required issuer',
                key: 'l.err.core.auth.caprisaur'
            })
        }
    }
    if (!rest) return
    for (const [key, value] of Object.entries(rest)) {
        if (decoded[key] !== value) {
            throw errors.forbidden({
                details: `Given token does not have required ${key}`,
                key: 'l.err.core.auth.extraterra'
            })
        }
    }
}


const verifyToken = async (token: string): Promise<{ err: Error | null, decoded: Token }> => {
    const [err, decoded] = await new Promise(res => {
        jwt.verify(token, config.tokenSignatureSecret, (e, d) => res([e, d]))
    })
    return { err, decoded }
}

export async function requireAuthorizedToken(func: ComposedApiFunc, options: JWTAuthOptions, props: ApiRequestProps) {
    const header = props.meta.headers['authorization']
    if (!header) {
        throw errors.unauthorized({
            details: 'This function requires authentication via a token',
            key: 'l.err.core.auth.canes-venatici'
        })
    }

    if (!header.startsWith('Bearer ')) {
        throw errors.unauthorized({
            details: 'This function requires an authentication via a token',
            key: 'l.err.core.auth.canes-veeticar'
        })
    }

    const bearerToken = header.replace('Bearer ', '')

    const { err, decoded } = await verifyToken(bearerToken)

    if (err) {
        console.error('Inavlid token', { err }, 'r.log.core.auth.beiyn')
        throw errors.forbidden({
            details: 'Cannot call this function without a valid authentication token',
            key: 'l.err.core.auth.canis-major'
        })
    }

    validateClaims(decoded, options)

    return await func({
        ...props,
        auth: {
            ...props.auth,
            token: decoded
        }
    })
}


export const useTokenAuthentication = (options: JWTAuthOptions) => (func: ComposedApiFunc) => {
    return _.partial(requireAuthorizedToken, func, options)
}
