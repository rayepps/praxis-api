
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
    developer: get('LOCAL_DEVELOPER'),
    tokenSignatureSecret: get('TOKEN_SIG_SECRET'),
    graphcmsWebhookSignatureSecret: get('GRAPHCMS_WEBHOOK_SIGNATURE_SECRET'),
    graphcmsWebhookKey: get('GRAPHCMS_WEBHOOK_KEY'),
    graphcmsApiToken: get('GRAPHCMS_API_TOKEN'),
    graphcmsApiUrl: get('GRAPHCMS_API_URL'),
    googleGeocodingApiKey: get('GOOGLE_GEOCODING_API_KEY')
}

export type Config = typeof config

export default config