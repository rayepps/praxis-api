import config from '../config'


export const mainTable = {
  tableName: `${config.env}_praxis`,
  indexes: {
    reverse: {
      name: 'reverse'
    }
  },
  partitionKeyField: 'HK',
  partitionKeyType: 'string',
  sortKeyField: 'SK',
  sortKeyType: 'string'
}

export default {
  mainTable
}