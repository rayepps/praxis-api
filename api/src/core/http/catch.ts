import _ from 'radash'
import { 
    ComposedApiFunc,
    ApiRequestProps
} from './types'


export async function withTryCatch(func: ComposedApiFunc, errorHandler: ComposedApiFunc, props: ApiRequestProps) {
    const [err, response] = await _.try(func)(props)
    if (err) {
      await _.try(errorHandler)({ ...props, error: err })
      throw err
    }
    return response
}

export const useCatch = (errorHandler: ComposedApiFunc) => (func: ComposedApiFunc) => _.partial(withTryCatch, func, errorHandler)



