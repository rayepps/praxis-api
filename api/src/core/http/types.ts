import { Dict } from '../util/types'
import { Token, OneTimeUseToken } from './auth/token'

export interface ApiError {

    /**
     * Always or.api for identification in middleware
     */
    name: string

    /**
     * A short human readable message fit for
     * showing an end user. Generic in spirit
     * regarding the basic idea around the 
     * issue that ocurred.
     */
    message: string

    /**
     * The http status code to return.
     */
    status: number

    /**
     * Specific -- generic -- to the exact reason
     * the error ocurred. Formatted {status}{n}.
     * Ex. authentication failed because session is bad => 4011
     * Ex. authentication failed because session is exp => 4012
     * Ex. could not find user in db with provided id => 4043
     * Ex. could not find user in db in ok state => 40422
     * Ex. user does not have permission to read user data => 40310
     */
    code: number

    /**
     * Hyper specific -- never duplicated -- key that uniquely identifies 
     * every error thrown in the code base. Formatted or.err.{module}.{module}.{phrase}
     * Ex. auth failed line 304 of get user => or.err.user.get-user.emorphis
     * Ex. auth failed line 33 of get user => or.err.user.get-user.bourish
     * Ex. user not found line 10 of get user => or.err.user.get-user.sallest
     * Ex. room locked line 217 of inviteCode => or.err.join.invite-code.allour
     * Keep the phrase unique and random.
     * Keep the phrase weird so its easy to ensure uniqueness.
     * Keep the phrase short and easy to share so end users can easily report it.
     * Personally, I like names of star constellations. When you run out of those
     * anything that sounds like a star constelation will work.
     */
    key: string

    /**
     * Specific to the exact cause of this issue. Human readable
     * string as long as need to explain why the problem ocurred
     * and if possible how to correct it.
     */
    details: string

    /**
     * The id of the request. Only used for errors (namely unknown ones)
     * so we can trace it later. Expect null. In all responses the rid
     * can be found in the x-rid response header.
     */
    rid?: string | null
}

export interface ApiErrorResponse {
    error: ApiError
    result: null
    version: string
    status: number
}

export interface ApiSuccessResponse<T> {
    error: null
    result: T
    version: string
    status: number
}

export type ApiResponse<T> = ApiErrorResponse | ApiSuccessResponse<T>


export type HttpApiRequestMeta = {
    requestId: string
    hostname: string
    userAgent: string
    ip: string
    protocol: string
    query: Dict
    body: Dict | string | null
    headers: Dict
    method: string
    path: string
    secure: boolean
}

export type HttpResponseDescription = {
    _rid: string
    headers: Dict<string | string[]>
    status: number
    json: any
    cookies: string[]
}

export interface AnyAuth {
    token?: Token
    otuToken?: OneTimeUseToken
    clientId?: string
    clientSecret?: string
}

export interface ApiRequestProps <ArgType = any, ServiceType = any> {
    auth: AnyAuth
    args: ArgType
    services: ServiceType
    meta: HttpApiRequestMeta
    response: HttpResponseDescription
}

export type ComposedApiFunc <ArgType = any, ServiceType = any> = (props: ApiRequestProps<ArgType, ServiceType>) => Promise<HttpResponseDescription | any>


