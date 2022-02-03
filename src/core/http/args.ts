import * as yup from 'yup'
import _ from 'radash'
import parse from 'date-fns/parse'
import isDate from 'date-fns/isDate'
import {
    ComposedApiFunc,
    ApiRequestProps
} from './types'
import { Dict } from '../util/types'
import errors from './errors'

// TODO: This module is typed like poop and its yup's fault. 
// Problem is yup is just a collection of funcs and can't
// be typed (in my power) as an instance.

export const validate = async (model: any, args: any) => await model.validate(args, {
    stripUnknown: true,
    strict: false,
    abortEarly: true
})

export const withShapeValidation = async (func: ComposedApiFunc, model: any, getArgs: (props: ApiRequestProps) => Dict<any>, props: ApiRequestProps) => {
    let validArgs = {}
    try {
        validArgs = await validate(model, getArgs(props))
    } catch (err) {
        throw errors.jsonValidationFailed({
            details: err.message,
            key: 'l.api.err.core.args.baradoor'
        })
    }
    return await func({
        ...props,
        args: {
            ...props.args,
            ...validArgs
        }
    })
}

type Yup = typeof yup
type KeyOfType<T, Value> = { [P in keyof T]: Value }

export const useJsonArgs = <TArgs = any>(shapeMaker: (yup: Yup) => KeyOfType<TArgs, any>) => (func: ComposedApiFunc) => {
    const getJson = (props: ApiRequestProps) => props.meta.body
    const model = yup.object(shapeMaker(yup))
    return _.partial(withShapeValidation, func, model, getJson)
}

export const useQueryArgs = <TArgs = any>(shapeMaker: (yup: Yup) => KeyOfType<TArgs, any>) => (func: ComposedApiFunc) => {
    const getJson = (props: ApiRequestProps) => props.meta.query
    const model = yup.object(shapeMaker(yup))
    return _.partial(withShapeValidation, func, model, getJson)
}

export const useHeaderArgs = <TArgs = any>(shapeMaker: (yup: Yup) => KeyOfType<TArgs, any>) => (func: ComposedApiFunc) => {
    const getJson = (props: ApiRequestProps) => props.meta.headers
    const model = yup.object(shapeMaker(yup))
    return _.partial(withShapeValidation, func, model, getJson)
}

//
// Add custom methods to yup
//

yup.addMethod(yup.date, 'format', function (format: string) {
    return this.transform(function (value: any) {
        if (this.isType(value)) return value
        const dateValue = parse(value, format, new Date())
        if (!isDate(dateValue)) {
            throw 'Invalid format for date'
        }
        return dateValue
    })
})