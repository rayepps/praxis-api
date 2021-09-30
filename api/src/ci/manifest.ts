/**
 * This script converts the manifest.hcl file
 * to a json file that the terraform can read
 *
 * --> HCL
 *
 * service "admin" {
 *   endpoint "getMerchantUploadUrl" {
 *     version = "0.0.1"
 *     environment = [
 *       "ASSET_CDN_BUCKET_NAME"
 *     ]
 *   }
 * }
 * 
 *
 * --> JSON
 *
 * "admin": {
 *   "getMerchantUploadUrl": {
 *     "version": "0.0.1",
 *     "environment": [
 *       "ASSET_CDN_BUCKET_NAME"
 *     ]
 *   }
 * }
 *
 */
import _ from 'radash'
import parser from 'hcl-parser'
import fs from 'fs'

async function run() {
  const manifestPath = (fileType: 'hcl' | 'json') => {
    return `${__dirname}/../../manifest.${fileType}`
  }
  const jsonPath = manifestPath('json')
  const hclPath = manifestPath('hcl')

  const rawHcl = await fs.promises.readFile(hclPath, 'utf-8')
  const [hcl, err] = parser.parse(rawHcl)
  if (err) throw err

  const serviceMap = unwrapHCL(hcl.service)
  const services = _.mapValues(serviceMap, (service: any) => {
    const endpoints = unwrapHCL(service.endpoint)
    return _.mapValues(endpoints, (endpoint: any) => ({
      ...endpoint,
      environment: [
        ...service.environment ?? [],
        ...endpoint.environment ?? []
      ]
    }))
  })

  await fs.promises.writeFile(
    jsonPath,
    JSON.stringify(services, null, 4),
    'utf-8'
  )

}

/**
 * The parser converts HCL in a wack way.
 * 
 * service "admin" { ... }
 * 
 * becomes this as json
 * 
 * {
 *   "service": [
 *     {
 *       "admin": [
 *         {
 *           ...
 *         }
 *       ] 
 *     }
 *   ]
 * }
 * 
 * As someone who has rewritten this script
 * 3 times I'll tell you this function is
 * the key to life. It converts that json
 * back to this
 * 
 * {
 *   "service": {
 *     "admin": { ... }
 *   }
 * }
 */
const unwrapHCL = (value: any[]) => {
  return value.reduce((acc, item) => {
    const key = Object.keys(item)[0]
    return { ...acc, [key]: item[key][0] }
  }, {})
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})