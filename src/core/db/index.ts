import { Database } from './client'
import createDynamo from '../aws/dynamo'

export const makeDatabase = () => new Database(createDynamo.documentClient())

export { Database } from './client'
export default makeDatabase