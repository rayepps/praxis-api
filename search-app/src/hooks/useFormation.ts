import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { object as makeObject, ZodRawShape } from 'zod'


export const useFormation = <T, K extends ZodRawShape = {}>(shape: K, defaultValues?: Partial<T>) => {
  const form = useForm<T>({
    resolver: zodResolver(makeObject(shape)),
    defaultValues: defaultValues as any
  })
  const hasError = Object.keys(form.formState.errors).length > 0
  return {
    watch: form.watch,
    register: form.register,
    createHandler: form.handleSubmit,
    isDirty: form.formState.isDirty,
    isValid: form.formState.isValid,
    errors: form.formState.errors,
    hasError
  }
}