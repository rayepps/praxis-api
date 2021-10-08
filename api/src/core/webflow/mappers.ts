import * as t from '../types'


export class Event {
  static toWebflowEvent(event: t.Event): Omit<t.WebflowEvent, '_id'> {
    return {
      gcmsid: event.id,
      name: event.name,
      slug: event.slug,
      city: event.city,
      state: event.state,
      longitude: event.location.longitude,
      latitude: event.location.latitude,
      startdate: event.startDate,
      enddate: event.endDate,
      companyname: event.training.company.name,
      displayprice: event.training.displayPrice,
    }
  }
}

export class Training {
  static toWebflowTraining(training: t.Training): Omit<t.WebflowTraining, '_id'> {
    return {
      gcmsid: training.id,
      name: training.name,
      slug: training.slug,
      thumbnailurl: training.thumbnail.url,
      companyname: training.company.name,
      companythumbnailurl: training.company.thumbnail.url,
      companygcmsid: training.company.id,
      displayprice: training.displayPrice
    }
  }
}

export default {
  Event,
  Training
}