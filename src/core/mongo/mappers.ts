import * as t from '../types'
import _ from 'radash'

export class Contact {
  static toModel(document: t.ContactDocument): t.Contact {
    document.tag_map = undefined
    return _.shake(document) as t.Contact
  }
}

export class User {
  static toModel(document: t.UserDocument): t.User {
    return document as t.User
  }
}

export class Company {
  static toModel(document: t.CompanyDocument): t.CompanyModel {
    return { ...document, trainings: [] } as t.CompanyModel
  }
}

export class Training {
  static toModel(document: t.TrainingDocument): t.TrainingModel {
    return { ...document, events: [] } as t.TrainingModel
  }
}

export class Event {
  static toModel(document: t.EventDocument): t.EventModel {
    return document as t.EventModel
  }
}
