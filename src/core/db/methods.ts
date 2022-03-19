import _ from 'radash'
import zlib from 'zlib'
import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand,
  QueryCommand,
  QueryOutput,
  GetItemOutput,
  PutItemOutput,
  UpdateItemOutput,
  ScanCommand,
  ScanOutput
} from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'
import config from '../config'

type Key = {
  HK: string
  SK: string
}

type ExpressionAttributeValues = {
  ':hk': string
  ':sk': string
}

interface PaginatedResults<TModel> {
  next: string
  items: TModel[]
  total: number
}

type ScanOptions = { limit?: number; start?: string }
type QueryOptions = { limit?: number; start?: string }

const compression = {
  pack: (obj: any) => {
    const packed = zlib.deflateSync(JSON.stringify(obj)).toString('base64')
    return `px.zlib.${packed}`
  },
  unpack: (packed: string) => {
    const raw = packed.replace('px.zlib.', '')
    const str = zlib.inflateSync(Buffer.from(raw, 'base64')).toString()
    return JSON.parse(str)
  }
}

export const addItem =
  <TModel, TRecord>({ dynamo, toRecord }: { dynamo: DynamoDBClient; toRecord: (model: TModel) => TRecord }) =>
  async (item: TModel): Promise<void> => {
    const record: TRecord = toRecord(item)
    const put = new PutItemCommand({
      TableName: config.dynamoTableName,
      Item: marshall(record)
    })
    const [err] = await _.try(() => {
      return dynamo.send(put) as PutItemOutput
    })()
    if (err) throw err
  }

export const getItem =
  <TModel, TRecord, TArgs>({
    dynamo,
    argsToKey,
    toModel
  }: {
    dynamo: DynamoDBClient
    argsToKey: (args: TArgs) => Key
    toModel: (record: TRecord) => TModel
  }) =>
  async (args: TArgs) => {
    const get = new GetItemCommand({
      TableName: config.dynamoTableName,
      Key: marshall(argsToKey(args))
    })
    const [err, response] = await _.try(() => {
      return dynamo.send(get) as GetItemOutput
    })()
    if (err) throw err
    if (!response.Item) return null
    const record = unmarshall(response.Item) as TRecord
    return toModel(record)
  }

export const updateItem =
  <TModel, TKeyArg>({ dynamo, keyArgToKey }: { dynamo: DynamoDBClient; keyArgToKey: (keyArg: TKeyArg) => Key }) =>
  async (keyArg: TKeyArg, patch: Partial<TModel>) => {
    const keys = Object.keys(patch)
    const update = new UpdateItemCommand({
      TableName: config.dynamoTableName,
      Key: marshall(keyArgToKey(keyArg)),
      UpdateExpression: `SET ${keys.map((_k, index) => `#field${index} = :value${index}`).join(', ')}`,
      ExpressionAttributeNames: keys.reduce((accumulator, k, index) => ({ ...accumulator, [`#field${index}`]: k }), {}),
      ExpressionAttributeValues: marshall(
        keys.reduce((accumulator, k, index) => ({ ...accumulator, [`:value${index}`]: patch[k] }), {})
      )
    })
    const [err] = await _.try(() => {
      return dynamo.send(update) as UpdateItemOutput
    })()
    if (err) throw err
  }

export const query =
  <TRecord, TModel, TArg>({
    dynamo,
    keyConditionExpression,
    indexName,
    argToAttributes,
    toModel
  }: {
    dynamo: DynamoDBClient
    keyConditionExpression: string
    indexName?: string
    argToAttributes: (arg: TArg) => ExpressionAttributeValues
    toModel: (record: TRecord) => TModel
  }) =>
  async (arg: TArg, options?: QueryOptions): Promise<PaginatedResults<TModel>> => {
    const query = new QueryCommand({
      TableName: config.dynamoTableName,
      KeyConditionExpression: keyConditionExpression,
      Limit: options?.limit,
      IndexName: indexName,
      ExpressionAttributeValues: marshall(argToAttributes(arg)),
      ExclusiveStartKey: options?.start ? compression.unpack(options.start) : undefined
    })
    const [err, results] = await _.try(() => {
      return dynamo.send(query) as QueryOutput
    })()
    if (err) throw err
    if (!results.Items) {
      return {
        items: [],
        total: 0,
        next: null
      }
    }
    return {
      items: results.Items.map(item => toModel(unmarshall(item) as TRecord)),
      total: results.Count,
      next: results.LastEvaluatedKey ? compression.pack(unmarshall(results.LastEvaluatedKey)) : null
    }
  }

export const scan =
  <TRecord, TModel, TArg>({
    dynamo,
    filterExpression,
    indexName,
    argToAttributes,
    toModel
  }: {
    dynamo: DynamoDBClient
    filterExpression: string
    indexName?: string
    argToAttributes: (arg: TArg) => any
    toModel: (record: TRecord) => TModel
  }) =>
  async (arg: TArg, options?: ScanOptions): Promise<PaginatedResults<TModel>> => {
    const scan = new ScanCommand({
      TableName: config.dynamoTableName,
      FilterExpression: filterExpression,
      IndexName: indexName,
      Limit: options?.limit,
      ExpressionAttributeValues: marshall(argToAttributes(arg)),
      ExclusiveStartKey: options?.start ? compression.unpack(options.start) : undefined
    })
    const [err, results] = await _.try(() => {
      return dynamo.send(scan) as ScanOutput
    })()
    if (err) throw err
    if (!results.Items) {
      return {
        items: [],
        total: 0,
        next: null
      }
    }
    return {
      items: results.Items.map(item => toModel(unmarshall(item) as TRecord)),
      total: results.Count,
      next: results.LastEvaluatedKey ? compression.pack(results.LastEvaluatedKey) : null
    }
  }

export const iterate =
  <TArg, TModel>(queryOrScan: (arg: TArg, options?: { start?: string }) => Promise<PaginatedResults<TModel>>) =>
  async (arg: TArg, cb: (model: TModel, idx: number) => Promise<void>) => {
    let next = undefined
    let idx = 0
    // DANGER: I'm honestly just too lazy to write out
    // all the code to do this in a safer non-while
    // looping way tonight. Sorry to me in 3 months.
    while (true) {
      const results = await queryOrScan(arg, { start: next })
      for (const item of results.items) {
        await _.try(cb)(item, idx)
        idx = idx + 1
      }
      if (results.next) {
        next = results.next
      }
      if (!next) {
        return
      }
    }
  }
