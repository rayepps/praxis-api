import * as t from '../types'

export class ContactView {
  static toView(model: t.Contact): t.ContactView {
    return {
      _view: 'px.contact',
      id: model.id,
      email: model.email,
      phone: model.phone,
      subscribed: model.subscribed
    }
  }
}
