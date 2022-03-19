import * as t from '../types'

export class ContactRecord {
  static toModel(record: t.ContactRecord): t.Contact {
    return {
      id: record.id,
      email: record.email,
      phone: record.phone,
      subscribed: record.subscribed
    }
  }
}

export class TriggeredEventRecord {
  static toModel(record: t.TriggeredEventRecord): t.TriggeredEvent {
    return {
      key: record.key,
      timestamp: record.timestamp,
      metadata: record.metadata
    }
  }
}