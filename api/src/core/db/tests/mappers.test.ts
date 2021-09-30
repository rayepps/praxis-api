import _ from 'radash'
import { assert } from 'chai'
import { createStub } from '../../tests/stub'
import * as t from '../../types'
import { 
  UserRecord, 
  UserCredsRecord, 
  CardRecord, 
  CardEventRecord, 
  MerchantRecord, 
  PaymentMethodRecord 
} from '../mappers'


describe('Database mappers', () => {

  test('UserRecord.toUser maps without error', () => {
    const mock = createStub<t.UserRecord>({
      id: 'l.mock.userid'
    })
    const result = UserRecord.toUser(mock.stub)
    assert.equal(result.id, 'l.mock.userid')
  })

  test('UserCredsRecord.toUserCreds maps without error', () => {
    const mock = createStub<t.UserCredsRecord>({
      _hash: 'abc'
    })
    const result = UserCredsRecord.toUserCreds(mock.stub)
    assert.equal(result._hash, 'abc')
  })

  test('CardRecord.toCard maps without error', () => {
    const mock = createStub<t.CardRecord>({
      id: 'l.mock.cardid'
    })
    const result = CardRecord.toCard(mock.stub)
    assert.equal(result.id, 'l.mock.cardid')
  })

  test('CardEventRecord.toCardEvent maps without error', () => {
    const mock = createStub<t.CardEventRecord>({
      id: 'l.mock.cardeventid'
    })
    const result = CardEventRecord.toCardEvent(mock.stub)
    assert.equal(result.id, 'l.mock.cardeventid')
  })

  test('MerchantRecord.toMerchant maps without error', () => {
    const mock = createStub<t.MerchantRecord>({
      id: 'l.mock.mid'
    })
    const result = MerchantRecord.toMerchant(mock.stub)
    assert.equal(result.id, 'l.mock.mid')
  })

  test('PaymentMethodRecord.toPaymentMethod maps without error', () => {
    const mock = createStub<t.PaymentMethodRecord>({
      id: 'l.mock.pmid'
    })
    const result = PaymentMethodRecord.toPaymentMethod(mock.stub)
    assert.equal(result.id, 'l.mock.pmid')
  })

})