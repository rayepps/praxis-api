import crypto from 'crypto'
import { Id } from './types'

export const slugger = (...parts: string[]) => {
  return parts
    .filter(x => !!x)
    .join('-')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')      // non alpha numeric with -
    .replace(/\-\-+/g, '-')          // --- with -
}

export const hashEmail = (email: string) => {
  return crypto.createHash('md5').update(`px.email.${email}`).digest('hex')
}

const _id = (model: string): Id => {
  const rand = crypto.randomBytes(12).toString('hex')
  return `px.${model}.${rand}`
}

export const createId = {
  contact: (): Id<'contact'> => {
    return _id('contact') as Id<'contact'>
  }
}

export default {
  slugger,
  hashEmail,
  createId
}