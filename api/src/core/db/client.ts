import * as DynamoDB from 'aws-sdk/clients/dynamodb.js'
import * as t from '../types'
import * as mappers from './mappers'
import createDynamo from '../aws/dynamo'
import schema from './schema'


export class Database {

    constructor(
        private dynamo: DynamoDB.DocumentClient
    ) { }

    async addUser(user: t.User, hash: string): Promise<void> {
        const userRecord: t.UserRecord = {
            ...user,
            HK: `A#USER#${user.id}`,
            SK: 'T#USER'
        }
        await this.dynamo.put({
            TableName: schema.mainTable.tableName,
            Item: userRecord
        }).promise()
        const credsRecord: t.UserCredsRecord = {
            _hash: hash,
            HK: `A#USER#${user.id}`,
            SK: 'T#CREDS'
        }
        await this.dynamo.put({
            TableName: schema.mainTable.tableName,
            Item: credsRecord
        }).promise()
    }

    async updateUser(userId: string, patch: Partial<t.User>): Promise<void> {
        const entries = Object.entries(patch).map(([k, v]) => ({ k, v }))
        await this.dynamo.update({
            TableName: schema.mainTable.tableName,
            Key: {
                HK: `A#USER#${userId}`,
                SK: `T#USER`
            },
            UpdateExpression: `set ${entries.map((_x, i) => {
                return `#var${i} = :val${i}`
            }).join(', ')}`,
            ExpressionAttributeNames: entries.reduce((acc, { k }, i) => ({
                [`#var${i}`]: k,
                ...acc
            }), {}),
            ExpressionAttributeValues: entries.reduce((acc, { v }, i) => ({
                [`:val${i}`]: v,
                ...acc
            }), {}),
        }).promise()
    }

    async findUserCredentials(userId: string): Promise<t.UserCreds> {
        const result = await this.dynamo.get({
            TableName: schema.mainTable.tableName,
            Key: {
                HK: `A#USER#${userId}`,
                SK: `T#CREDS`
            }
        }).promise()
        const creds = result.Item as t.UserCredsRecord
        if (!creds) return null
        return mappers.UserCredsRecord.toUserCreds(creds)
    }

    async findUserById(userId: string): Promise<t.User> {
        const result = await this.dynamo.get({
            TableName: schema.mainTable.tableName,
            Key: {
                HK: `A#USER#${userId}`,
                SK: `T#USER`
            }
        }).promise()
        const user = result.Item as t.UserRecord
        if (!user) return null
        return mappers.UserRecord.toUser(user)
    }

}

export const makeDatabase = () => new Database(createDynamo.documentClient())

export default makeDatabase
