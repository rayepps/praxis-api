import jwt from 'jsonwebtoken'
import { Permission } from './permission'
import config from '../../../config'


export type Token = {
  exp: number
  sub: string
  iss: string
  type: 'id' | 'access'
  aud: string
  ttl: number
  permissions: string[]
  scopes: string[]
  entity: string
  provider: 'nfg' | 'google'
  atok?: string
}

export const create = ({
  sub,
  type,
  aud,
  iss,
  entity,
  ttl = 60,
  permissions = [],
  scopes = [],
  provider = 'nfg',
  extra = {}
}: {
  entity: string
  sub: string
  iss: string
  type: 'id' | 'access'
  aud: string
  ttl?: number
  permissions?: Permission[]
  scopes?: string[]
  provider?: 'nfg' | 'google',
  extra?: any
}): string => {

  const payload: Token = {
    // (now in milliseconds / 1000) = seconds then + 60 seconds 
    // 60 times ==> 60 minutes from now
    exp: Math.floor((Date.now() / 1000) + (60 * ttl)),
    sub,
    iss,
    type,
    aud,
    permissions: permissions.map(p => p.key),
    scopes,
    ttl,
    entity,
    provider,
    ...extra
  }

  return jwt.sign(payload, config.tokenSignatureSecret)

}

export type OneTimeUseToken = {
  sub: string
  exp: number
  iat: number
}

export default {
  create
}