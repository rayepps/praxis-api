import _ from 'radash'
import {
    ComposedApiFunc,
    ApiRequestProps
} from '../types'
import errors from '../errors'


type PropsGetter <T> = (props: ApiRequestProps<any, any>) => Promise<T>

export async function withApiKey(func: ComposedApiFunc, keyFunc: string | PropsGetter<string>, props: ApiRequestProps) {
    const header = props.meta.headers['x-api-key']

    const key = !_.isFunction(keyFunc) ? keyFunc : await (keyFunc as PropsGetter<string>)(props)

    if (!header) {
        throw errors.unauthorized({
            details: 'This function requires an api key',
            key: 'l.err.core.auth.canes-venarias'
        })
    }

    const providedKey = header.startsWith('Key ') && header.replace('Key ', '')

    if (!key || !providedKey || providedKey !== key) {
        throw errors.unauthorized({
            details: 'Invalid api key',
            key: 'l.err.core.auth.balefeign'
        })
    }

    return await func(props)
}

export const useApiKeyAuthentication = (key: string | PropsGetter<string>) => (func: ComposedApiFunc) => {
    return _.partial(withApiKey, func, key)
}

