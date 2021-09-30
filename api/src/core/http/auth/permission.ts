
export type Permission = {
  entity: string
  action: string
  key: string
  description: string
}

// Permission Key = {entity}::{action}
const permission = (entity: string, action: string, description: string): Permission => ({
  entity, 
  action, 
  key: `${entity}::${action}`,
  description
})

export default permission