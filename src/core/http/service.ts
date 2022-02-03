import _ from 'radash'
import { 
    ComposedApiFunc,
    ApiRequestProps
} from './types'
import { Dict } from '../util/types'


export async function withServices(func: ComposedApiFunc, services: Dict<any>, props: ApiRequestProps) {
    return await func({
        ...props,
        services: {
            ...props.services,
            ...services
        }
    })
}

export const useService = <TServices = Dict<any>> (services: TServices) => (func: ComposedApiFunc) => _.partial(withServices, func, services)
