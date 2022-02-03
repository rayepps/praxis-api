import _ from 'radash'
import { 
    ComposedApiFunc,
    ApiRequestProps
} from './types'
import logger from '../logger'


export async function withTryCatch(func: ComposedApiFunc, errorHandler: ComposedApiFunc, props: ApiRequestProps) {
    const [err, response] = await _.try(func)(props)
    if (err) {
      const [handlerError] = await _.try(errorHandler)({ ...props, error: err })
      if (handlerError) {
        logger.error('useCatch handler threw exception', { error: handlerError })
      }
      throw err
    }
    return response
}

export const useCatch = (errorHandler: ComposedApiFunc) => (func: ComposedApiFunc) => _.partial(withTryCatch, func, errorHandler)



