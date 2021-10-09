import * as DynamoDB from 'aws-sdk/clients/dynamodb.js'
import * as t from '../types'
import * as mappers from './mappers'
import schema from './schema'


export class Database {

    constructor(
        private dynamo: DynamoDB.DocumentClient
    ) { }

    async addLinkRef(linkRef: t.LinkRef): Promise<void> {
        const record: t.LinkRefRecord = {
            ...linkRef,
            HK: `A#LINK#${linkRef.code}`,
            SK: 'T#LINK'
        }
        await this.dynamo.put({
            TableName: schema.mainTable.tableName,
            Item: record
        }).promise()
    }

    async findLinkRef(code: string): Promise<t.LinkRef> {
        const result = await this.dynamo.get({
            TableName: schema.mainTable.tableName,
            Key: {
                HK: `A#LINK#${code}`,
                SK: 'T#LINK'
            }
        }).promise()
        const item = result.Item as t.LinkRefRecord
        if (!item) return null
        return mappers.LinkRefRecord.toLinkRef(item)
    }

    // async updateUser(userId: string, patch: Partial<t.User>): Promise<void> {
    //     const entries = Object.entries(patch).map(([k, v]) => ({ k, v }))
    //     await this.dynamo.update({
    //         TableName: schema.mainTable.tableName,
    //         Key: {
    //             HK: `A#USER#${userId}`,
    //             SK: `T#USER`
    //         },
    //         UpdateExpression: `set ${entries.map((_x, i) => {
    //             return `#var${i} = :val${i}`
    //         }).join(', ')}`,
    //         ExpressionAttributeNames: entries.reduce((acc, { k }, i) => ({
    //             [`#var${i}`]: k,
    //             ...acc
    //         }), {}),
    //         ExpressionAttributeValues: entries.reduce((acc, { v }, i) => ({
    //             [`:val${i}`]: v,
    //             ...acc
    //         }), {}),
    //     }).promise()
    // }

    // async findUserById(userId: string): Promise<t.User> {
    //     const result = await this.dynamo.get({
    //         TableName: schema.mainTable.tableName,
    //         Key: {
    //             HK: `A#USER#${userId}`,
    //             SK: `T#USER`
    //         }
    //     }).promise()
    //     const user = result.Item as t.UserRecord
    //     if (!user) return null
    //     return mappers.UserRecord.toUser(user)
    // }

    // async getCardByIdForUser(cardId: string, userId: string): Promise<t.Card> {
    //     const result = await this.dynamo.get({
    //         TableName: schema.mainTable.tableName,
    //         Key: {
    //             HK: `A#USER#${userId}`,
    //             SK: `T#CARD#${cardId}`
    //         }
    //     }).promise()
    //     const record = result.Item as t.CardRecord
    //     if (!record) return null
    //     return mappers.CardRecord.toCard(record)
    // }

    // /**
    //  * Prefer using getCardByIdForUser instead if you know the user id.
    //  * This uses a QUERY. If we know the user id we can do a GET.
    //  */
    // async getCardById(cardId: string): Promise<t.Card> {
    //     const result = await this.dynamo.query({
    //         TableName: schema.mainTable.tableName,
    //         IndexName: schema.mainTable.indexes.reverse.name,
    //         KeyConditionExpression: 'SK = :sk AND begins_with ( HK , :hk )',
    //         Limit: 1,
    //         ExpressionAttributeValues: {
    //             ':sk': 'A#USER#',
    //             ':hk': `T#CARD#${cardId}`
    //         }
    //     }).promise()
    //     const records = result.Items as t.CardRecord[]
    //     if (!records || records.length === 0) return null
    //     const record = records[0]
    //     return mappers.CardRecord.toCard(record)
    // }

}
