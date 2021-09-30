/* eslint-disable @typescript-eslint/no-var-requires */
const manifest = require('../../manifest.json')
import express, { Request, Response } from 'express'
import cors from 'cors'
import { json } from 'body-parser'
import * as lama from 'aws-lama'
import { APIGatewayProxyEvent, APIGatewayEventRequestContext } from 'aws-lambda'

const PORT = 7700

const api = express()
api.use(json())
api.use(cors())

type Endpoint = {
    serviceName: string
    funcName: string
}

type LambdaFunc = (event: APIGatewayProxyEvent, context: APIGatewayEventRequestContext) => Promise<any>

// Read the manifest from the package json and parse the services
// and functions into a list of { serviceName, funcName }
const endpoints: Endpoint[] = Object.entries(manifest).reduce((acc, [service, funcMap]) => [
    ...acc,
    ...Object.keys(funcMap).map(func => ({ 
        serviceName: service, 
        funcName: func 
    }))
], [])

// Wrapper around our lambda func. Running locally we use express but
// our endpoints are designed for lambda invocations. Here we convert
// the local app req, res into event, context then set the result on the res
const lambdaToExpress = (func: LambdaFunc) => async (req: Request, res: Response) => {
    const { event, context } = await lama.toEventContext(req, res)
    const result = await func(event, context)
    lama.toHttpResponse(result, res)
}

// Add each endpoint to the local running express app
for (const e of endpoints) {
    const { default: func } = require(`../services/${e.serviceName}/${e.funcName}.ts`)
    api.post(`/${e.serviceName}/${e.funcName}`, lambdaToExpress(func))
}

// Get it poppin bebe
api.listen(PORT, () => {
    console.log(`Api listening on ${PORT}`)
})