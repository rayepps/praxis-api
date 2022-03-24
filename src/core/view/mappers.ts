import * as t from '../types'
import addDays from 'date-fns/addDays'
import isAfter from 'date-fns/isAfter'

export class ContactView {
  static toView(model: t.Contact): t.ContactView {
    return {
      _view: 'px.contact',
      id: model.id,
      email: model.email,
      phone: model.phone,
      tags: model.tags,
      supressions: model.supressions
    }
  }
}

export class EventView {
  static toView(model: t.Event): t.EventView {
    return {
      _view: 'px.event',
      ...model,
      recentlyPublished: isAfter(new Date(model.publishedAt), addDays(new Date(), -2))
    }
  }
}