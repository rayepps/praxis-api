
const get = <T = string>(name: string, defaultValue: T = null, cast: (v: any) => T = (v) => v): T => {
    const val = process.env[name]
    if (!val) return defaultValue
    return cast(val)
}


const getRegion = (env: string) => {
    if (env === 'local') return 'us-east-1'
    if (env === 'dev') return 'us-east-1'
    if (env === 'staging') return 'us-east-1'
    if (env === 'prod') return 'us-east-1'
}

const env = get('NOTFORGLORY_ENV')

const config = {
    env,
    region: getRegion(env),
    logLevel: get('LOG_LEVEL'),
    version: get('NOTFORGLORY_VERSION'),
    apiKey: get('NOTFORGLORY_API_KEY'),
    service: get('NOTFORGLORY_SERVICE'),
    function: get('NOTFORGLORY_FUNCTION'),
    baseUrl: get('NOTFORGLORY_API_URL'),
    developer: get('NOTFORGLORY_LOCAL_DEVELOPER'),
    stripeKey: get('STRIPE_KEY'),
    stripeSecret: get('STRIPE_SECRET'),
    stripeWebhookSecret: get('STRIPE_WEBHOOK_SECRET'),
    tokenSignatureSecret: get('TOKEN_SIG_SECRET'),
    dynamoTableName: get('DYNAMO_TABLE_NAME'),
    googleClientEmail: get('GOOGLE_CLIENT_EMAIL'),
    googlePrivateKey: get('GOOGLE_PRIVATE_KEY'),
    googleProjectId: get('GOOGLE_PROJECT_ID')
}

export type Config = typeof config

export default config