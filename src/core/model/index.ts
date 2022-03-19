import crypto from 'crypto'

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
  return crypto.createHash('md5').update(email).digest('hex')
}

export default {
  slugger,
  hashEmail
}