import DynamoDB from 'aws-sdk/clients/dynamodb.js'
import config from '../../config'


const createDynamoInstance = () => {
  return new DynamoDB({
    region: config.region
  })
}

const createDynamoDocumentClientInstance = () => {
  return new DynamoDB.DocumentClient({
    region: config.region
  })
}

export default {
  dynamo: createDynamoInstance,
  documentClient: createDynamoDocumentClientInstance
}