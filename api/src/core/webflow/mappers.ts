import * as t from '../types'


export class Event {
  static toWebflowEvent(event: t.Event): Omit<t.WebflowEvent, '_id'> {
    return {
      gcmsId: event.id,
      name: event.name,
      slug: event.slug,
      city: event.city,
      state: event.state,
      longitude: event.location.longitude,
      latitude: event.location.latitude,
      startDate: event.startDate,
      endDate: event.endDate,
      companyName: event.training.company.name,
      displayPrice: event.training.displayPrice,
    }
  }
}

export class Training {
  static toWebflowTraining(training: t.Training): Omit<t.WebflowTraining, '_id'> {
    return {
      gcmsId: training.id,
      name: training.name,
      slug: training.slug,
      thumbnailUrl: training.thumbnail.url,
      companyName: training.company.name,
      companyThumbnailUrl: training.company.thumbnail.url,
      companyGcmsId: training.company.id,
      displayPrice: training.displayPrice
    }
  }
}

export default {
  Event,
  Training
}