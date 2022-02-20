import Webflow from 'webflow-api'
import config from '../core/config'

const run = async () => {
  const webflow = new Webflow({ token: config.webflowApiToken })

  const collection = await webflow.collection({ collectionId: config.webflowTrainingCollectionId })

  console.log(collection)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})