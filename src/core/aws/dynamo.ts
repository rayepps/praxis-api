import DynamoDB from 'aws-sdk/clients/dynamodb.js'

const createDynamoInstance = () => {
  return new DynamoDB({
    region: 'us-east-1'
  })
}

const createDynamoDocumentClientInstance = () => {
  return new DynamoDB.DocumentClient({
    region: 'us-east-1'
  })
}

export default {
  dynamo: createDynamoInstance,
  documentClient: createDynamoDocumentClientInstance
}
