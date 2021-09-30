import _ from 'radash'
import { assert } from 'chai'
import { createStub } from '../../tests/stub'
import * as DynamoDB from 'aws-sdk/clients/dynamodb.js'
import { Database } from '../client'
import * as t from '../../types'


describe('Database client', () => {

  test('addUser inserts both user and credentials records', async () => {
    const dynamo = createStub<DynamoDB.DocumentClient>({
      put: () => ({
        promise: () => new Promise(res => res(null))
      })
    })
    const sut = new Database(dynamo.stub)
    await sut.addUser({
      id: 'l.mock.userid'
    } as t.User, '')
    const activity = dynamo.activity()

    assert.equal(activity.put.called, 2)

    const [
      [{ Item: userRecord }],
      [{ Item: credsRecord }]
    ] = activity.put.args

    assert.equal(userRecord.HK, 'A#USER#l.mock.userid')
    assert.equal(userRecord.SK, 'T#USER')

    assert.equal(credsRecord.HK, 'A#USER#l.mock.userid')
    assert.equal(credsRecord.SK, 'T#CREDS')

  })

  test('updateUser build correct expressions', async () => {
    const dynamo = createStub<DynamoDB.DocumentClient>({
      update: () => ({
        promise: () => new Promise(res => res(null))
      })
    })
    const sut = new Database(dynamo.stub)
    await sut.updateUser('l.mock.userid', {
      email: 'hello@notforglory.co',
      acl: 'admin'
    } as Partial<t.User>)
    const activity = dynamo.activity()
    assert.equal(activity.update.called, 1)
    const {
      Key,
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues
    } = activity.update.args[0][0]
    
    assert.deepEqual(Key, {
      HK: 'A#USER#l.mock.userid',
      SK: 'T#USER'
    })

    assert.equal(UpdateExpression, `
      set #var0 = :val0, #var1 = :val1
    `.trim())

    assert.deepEqual(ExpressionAttributeNames, {
      '#var0': 'email',
      '#var1': 'acl'
    })

    assert.deepEqual(ExpressionAttributeValues, {
      ':val0': 'hello@notforglory.co',
      ':val1': 'admin'
    })

  })

})