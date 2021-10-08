
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

const env = get('PRAXIS_ENV')

const config = {
    env,
    region: getRegion(env),
    logLevel: get('LOG_LEVEL'),
    version: get('PRAXIS_VERSION'),
    apiKey: get('PRAXIS_API_KEY'),
    service: get('PRAXIS_SERVICE'),
    function: get('PRAXIS_FUNCTION'),
    baseUrl: get('PRAXIS_API_URL'),
    developer: get('LOCAL_DEVELOPER'),
    tokenSignatureSecret: get('TOKEN_SIG_SECRET'),
    graphcmsWebhookSignatureSecret: get('GRAPHCMS_WEBHOOK_SIGNATURE_SECRET'),
    graphcmsWebhookKey: get('GRAPHCMS_WEBHOOK_KEY'),
    graphcmsApiToken: get('GRAPHCMS_API_TOKEN'),
    graphcmsApiUrl: get('GRAPHCMS_API_URL'),
    googleGeocodingApiKey: get('GOOGLE_GEOCODING_API_KEY'),
    webflowApiToken: get('WEBFLOW_API_TOKEN'),
    webflowSiteId: get('WEBFLOW_SITE_ID'),
    webflowEventCollectionId: "615fb8591ac0c4546cd02004",
    webflowTrainingCollectionId: "615fb4961ac0c43840d00bc6"
}

export type Config = typeof config

export default config