import { ApiError } from './types'
import _ from 'radash'

export const ERROR_KEY = 'or.api.err'


const createError = (error: Omit<ApiError, 'name'>) => ({
    ...error,
    name: ERROR_KEY
 }) as ApiError


//
// GENERICS
// Try to use these as little as possible, opt
// for creating more specific error objects.
//

export const unknown = _.partob(createError, {
    message: "Unknown Error",
    status: 500,
    code: 5000,
    details: "This one is one us, we apologize for the issue. The issue has been logged and our development team will be working on fixing it asap."
})

export const badRequest = _.partob(createError, {
    message: "Bad Request",
    status: 400,
    code: 4000
})

export const unauthorized = _.partob(createError, {
    message: "Not Authenticated",
    status: 401,
    code: 4010
})

export const forbidden = _.partob(createError, {
    message: "Not Authorized",
    status: 403,
    code: 4030
})

export const notFound = _.partob(createError, {
    message: "Not Found",
    status: 404,
    code: 4040
})

//
// SPECIFICS
// Oh ya... this is where its at. Create these as
// needed for specific failure cases so errors are
// easy to identify
//

export const jsonValidationFailed = _.partob(createError, {
    message: "Json body validation failed",
    status: 400,
    code: 4001
})

export default {
    unknown,
    badRequest,
    unauthorized,
    forbidden,
    notFound,
    jsonValidationFailed
}
