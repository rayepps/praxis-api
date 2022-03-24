import * as t from '../types'
import _ from 'radash'

export class Contact {
  static fromDocument(document: t.ContactDocument): t.Contact {
    document.tag_map = undefined
    return _.shake(document) as t.Contact
  }
}