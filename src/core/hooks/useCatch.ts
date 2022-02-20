import _ from 'radash'
import type { Props, ApiFunction } from '@exobase/core'
import logger from '../logger'


export async function withTryCatch(func: ApiFunction, errorHandler: ApiFunction, props: Props) {
    const [err, response] = await _.try(func)(props)
    if (err) {
      const [handlerError] = await _.try(errorHandler)({ ...props, error: err } as Props)
      if (handlerError) {
        logger.error('useCatch handler threw exception', { error: handlerError })
      }
      throw err
    }
    return response
}

export const useCatch = (errorHandler: ApiFunction) => (func: ApiFunction) => _.partial(withTryCatch, func, errorHandler)


