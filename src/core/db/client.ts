import _ from 'radash'
import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand,
  QueryCommand,
  QueryOutput,
  GetItemOutput,
  PutItemOutput
} from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'
import * as t from '../types'
import * as mappers from './mappers'
import formatDate from 'date-fns/format'
import * as methods from './methods'

const TABLE_NAME = 'praxis_main'

const stamps = {
  day: (date: Date | number) => {
    return formatDate(date, 'yyyy.MM.dd')
  }
}

const createDatabase = (dynamo: DynamoDBClient) => ({
  //
  //  CONTACTS
  //
  addContact: methods.addItem({
    dynamo,
    toRecord: (contact: t.Contact): t.ContactRecord => ({
      ...contact,
      HK: `A#CONTACT#${contact.id}`,
      SK: 'T#CONTACT'
    })
  }),
  findContactById: methods.getItem({
    dynamo,
    toModel: mappers.ContactRecord.toModel,
    argsToKey: (id: string) => ({
      HK: `A#CONTACT#${id}`,
      SK: `T#CONTACT`
    })
  }),
  updateContact: methods.updateItem({
    dynamo,
    keyArgToKey: (id: string) => ({
      HK: `A#CONTACT#${id}`,
      SK: `T#CONTACT`
    })
  }),
  iterateSubscribedContacts: methods.iterate(
    methods.scan({
      dynamo,
      filterExpression: 'SK = :sk',
      indexName: 'reverse',
      argToAttributes: () => ({
        ':sk': 'T#CONTACT'
      }),
      toModel: mappers.ContactRecord.toModel
    }),
  ),

  //
  //  TRIGGERED EVENTS
  //
  addTriggeredEvent: methods.addItem({
    dynamo,
    toRecord: (te: t.TriggeredEvent): t.TriggeredEventRecord => ({
      ...te,
      HK: `A#TRIGGERED_EVENT#${te.key}`,
      SK: `T#TRIGGERED_EVENT#ts:${stamps.day(te.timestamp)}`
    })
  }),
  findTriggeredEventOnDay: methods.getItem({
    dynamo,
    toModel: mappers.TriggeredEventRecord.toModel,
    argsToKey: ({ day, key }: { key: t.TriggeredEventKey; day: Date }) => ({
      HK: `A#TRIGGERED_EVENT#${key}`,
      SK: `T#TRIGGERED_EVENT#${stamps.day(day)}`
    })
  }),
})

export type Database = ReturnType<typeof createDatabase>

export default createDatabase
