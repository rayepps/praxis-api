const get = <T = string>(name: string, defaultValue: T = null, cast: (v: any) => T = v => v): T => {
  const val = process.env[name]
  if (!val) return defaultValue
  return cast(val)
}

const config = {
  env: get('PRAXIS_ENV'),
  apiKey: get('PRAXIS_API_KEY'),
  baseUrl: (() => {
    const url = get('PRAXIS_API_URL')
    return url.endsWith('/') ? url.replace(/\/$/, '') : url
  })(),
  graphcmsWebhookKey: get('GRAPHCMS_WEBHOOK_KEY'),
  graphcmsApiToken: get('GRAPHCMS_API_TOKEN'),
  graphcmsApiUrl: get('GRAPHCMS_API_URL'),
  googleGeocodingApiKey: get('GOOGLE_GEOCODING_API_KEY'),
  segmentKey: get('SEGMENT_KEY'),
  mongoUsername: get('MONGO_USER_NAME'),
  mongoPassword: get('MONGO_PASSWORD'),
  mongoInstanceName: get('MONGO_INSTANCE_NAME'),
  mongoSubdomain: get('MONGO_SUBDOMAIN'),
  redirectorUrl: get('PRAXIS_REDIRECTOR_URL'),
  redirectorApiKey: get('PRAXIS_REDIRECTOR_API_KEY'),
  logtailToken: get('LOGTAIL_TOKEN')
}

export type Config = typeof config

export default config
