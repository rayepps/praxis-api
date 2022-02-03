import WebflowApi from 'webflow-api'
import config from '../../config'
import mappers from './mappers'
import * as t from '../types'


export class Webflow {

  constructor(
    private webflow: WebflowApi
  ) {
  }

  async addEvent(event: t.Event): Promise<string> {
    const { _id } = await this.webflow.createItem({
      collectionId: config.webflowEventCollectionId,
      fields: {
        ...mappers.Event.toWebflowEvent(event),
        '_archived': false,
        '_draft': false
      }
    })
    return _id
  }

  async updateEvent(webflowId: string, event: t.Event): Promise<void> {
    await this.webflow.patchItem({
      collectionId: config.webflowEventCollectionId,
      itemId: webflowId,
      fields: mappers.Event.toWebflowEvent(event)
    })
  }

  async addTraining(training: t.Training): Promise<string> {
    const { _id } = await this.webflow.createItem({
      collectionId: config.webflowTrainingCollectionId,
      fields: {
        ...mappers.Training.toWebflowTraining(training),
        '_archived': false,
        '_draft': false
      }
    })
    return _id
  }

  async updateTraining(webflowId: string, training: t.Training): Promise<void> {
    await this.webflow.patchItem({
      collectionId: config.webflowTrainingCollectionId,
      itemId: webflowId,
      fields: mappers.Training.toWebflowTraining(training)
    })
  }

  async unpublishTraining(webflowId: string): Promise<void> {
    await this.webflow.patchItem({
      collectionId: config.webflowTrainingCollectionId,
      itemId: webflowId,
      fields: {
        '_draft': true
      }
    })
  }

  async unpublishEvent(webflowId: string): Promise<void> {
    await this.webflow.patchItem({
      collectionId: config.webflowEventCollectionId,
      itemId: webflowId,
      fields: {
        '_draft': true
      }
    })
  }

}