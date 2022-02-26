import _ from 'radash'
import axios from 'axios'
import { customAlphabet } from 'nanoid'

// See: https://developers.short.io/reference#linkspost

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const nanoid = customAlphabet(alphabet, 10)

type CreateLinkResponse = {
  link: string
  domain: string
  originalURL: string
  path: string
  title: string
  tags: string[]
  allowDuplicates: boolean
  expiresAt: number
  expiredURL: string
  iphoneURL: string
  androidURL: string
  utmSource: string
  utmMedium: string
  utmCampaign: string
  utmTerm: string
  utmContent: string
  cloaking: number
  redirectType: 302 | 301
}

const createRedirectLink = async ({ url, title }: { url: string; title: string }): Promise<CreateLinkResponse> => {
  const path = nanoid()
  const [err, response] = await _.try(async () => {
    return axios({
      url: 'https://api.short.io/links',
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'sk_zONn5ZMHN0GO5hpP'
      },
      data: JSON.stringify({
        allowDuplicates: false,
        domain: 'link.praxisco.us',
        originalURL: url,
        path,
        title
      })
    })
  })()
  if (err) throw err
  return {
    ...response.data,
    link: `link.praxisco.us/${path}`
  }
}

export type Redirector = {
  createRedirectLink: typeof createRedirectLink
}

export const makeRedirector = () => ({
  createRedirectLink
})

export default makeRedirector
