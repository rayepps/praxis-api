import { v4 as uuid } from 'uuid'
import {
  ComposedApiFunc,
  HttpResponseDescription,
  ApiRequestProps,
  ApiError,
  HttpApiRequestMeta
} from './types'
import errors, { ERROR_KEY } from './errors'
import _ from 'radash'
import logger from '../../core/logger'


export const createLambdaHandler = async (func: ComposedApiFunc, event: AWSLambda.APIGatewayEvent, context: AWSLambda.Context) => {

  const rid = `nfg.rid.${uuid().substr(0, 7)}`

  logger.debug(`[${rid}] aws lambda event: `)
  logger.debug(event)
  logger.debug(`[${rid}] aws lambda context: `)
  logger.debug(context)

  const defaultResponse = makeResponse(rid)
  const props: ApiRequestProps<any, any> = {
    auth: {},
    args: {},
    services: {},
    response: defaultResponse,
    meta: makeMeta(event, context)
  }

  const [error, result] = await _.tryit<any>(func)(props)

  logger.debug(`[${rid}] func error: `)
  logger.debug(error)
  logger.debug(`[${rid}] func result: `)
  logger.debug(result)

  const response = getResponse(rid, error, result)

  logger.debug(`[${rid}] calculated response: `)
  logger.debug(response)

  // @link https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html
  const lambdaResponse = {
    cookies: response.cookies,
    body: JSON.stringify({
      payload: response.payload,
      error: response.error,
      code: response.code
    }),
    isBase64Encoded: false,
    headers: {
      ...response.headers,
      'x-rid': rid,
      'content-type': 'application/json'
    },
    statusCode: response.status
  }

  logger.debug(`[${rid}] aws lambda response: `)
  logger.debug(lambdaResponse)

  return lambdaResponse

}

const makeMeta = (event: AWSLambda.APIGatewayEvent, context: AWSLambda.Context): HttpApiRequestMeta => {
  const headers = _.lowerize(event.headers ?? {})
  return {
    requestId: context.awsRequestId,
    hostname: event.requestContext?.domainName,
    userAgent: event.requestContext?.identity?.userAgent,
    ip: event.requestContext?.identity?.sourceIp,
    protocol: event.requestContext?.protocol,
    query: event.queryStringParameters ?? {},
    body: event.body,
    headers,
    method: event.requestContext?.httpMethod,
    path: event.requestContext?.path,
    secure: event.requestContext?.protocol === 'https'
  }
}

export const useLambda = () => (func: ComposedApiFunc) => _.partial(createLambdaHandler, func)


const makeResponse = (rid: string): HttpResponseDescription => ({
  _rid: rid,
  status: 200,
  cookies: [],
  headers: {
    'x-rid': rid
  },
  json: {
    message: 'success'
  }
})

const getResponse = (rid: string, error: Error | ApiError, result: any) => {

  // If its our custom error then respond with the
  // data indicated by our error object
  if (error && error.name === ERROR_KEY) {
    console.error(error)
    const err = { ...error, rid } as ApiError
    return {
      cookies: [] as string[],
      headers: {},
      error: err,
      payload: null,
      code: err.code,
      status: err.status
    }
  }

  // If its some generic error then wrap it in our
  // error object as an unknown error
  if (error) {
    console.error(error)
    const err = errors.unknown({
      key: 'l.err.api.core.express.fairtex',
      rid
    })
    return {
      cookies: [] as string[],
      headers: {},
      error: err,
      payload: null,
      code: err.code,
      status: err.status
    }
  }

  // If nothing was returned then return the default
  // ok response
  if (!result) {
    return {
      cookies: [] as string[],
      headers: {},
      error: null,
      payload: {
        message: 'success'
      },
      code: 2001,
      status: 200
    }
  }

  // If the func returned an object with _rid equal to 
  // this request id lets assume they returned a response
  // description
  if (result?._rid === rid) {
    const r = result as HttpResponseDescription
    return {
      cookies: r.cookies,
      headers: r.headers,
      error: null,
      payload: r.json,
      code: 2001,
      status: r.status
    }
  }

  // Else, the func returned something that should be 
  // returned as the json body response
  return {
    cookies: [] as string[],
    headers: {},
    error: null,
    payload: result,
    code: 2001,
    status: 200
  }
}