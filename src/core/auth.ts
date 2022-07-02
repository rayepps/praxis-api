import * as t from './types'
import { createPermission } from '@exobase/auth'

export const permissions = {
  user: {
    read: {
      self: (userId: t.Id<'user'>) => createPermission('user', 'read', userId),
      any: () => createPermission('user', 'ready', '*')
    },
    create: () => createPermission('user', 'create', '*'),
    update: {
      self: (userId: t.Id<'user'>) => createPermission('user', 'update', userId),
      any: () => createPermission('user', 'update', '*')
    }
  },
  event: {
    create: {
      any: () => createPermission('event', 'create', '*'),
      owned: (companyId: t.Id<'company'>) => createPermission('event', 'create', companyId),
    }
  }
}

export const permissionsForUser = (user: t.User) => {
  switch (user.role) {
    case 'super-admin':
      return [
        permissions.user.create(),
      ]
    case 'admin':
      return [
        permissions.user.read.any(),
        permissions.user.read.self(user.id),
        permissions.user.update.any(),
        permissions.user.update.self(user.id)
      ]
    case 'user':
      return [
        permissions.user.read.self(user.id),
        permissions.user.update.self(user.id)
      ]
    case 'admin-observer':
      return [
        permissions.user.read.any(),
        permissions.user.update.any(),
        permissions.user.read.self(user.id),
        permissions.user.update.self(user.id)
      ]
  }
}
