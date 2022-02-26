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
  graphcmsWebhookSignatureSecret: get('GRAPHCMS_WEBHOOK_SIGNATURE_SECRET'),
  graphcmsWebhookKey: get('GRAPHCMS_WEBHOOK_KEY'),
  graphcmsApiToken: get('GRAPHCMS_API_TOKEN'),
  graphcmsApiUrl: get('GRAPHCMS_API_URL'),
  googleGeocodingApiKey: get('GOOGLE_GEOCODING_API_KEY'),
  segmentKey: get('SEGMENT_KEY'),
  coralogixKey: get('CORALOGIX_API_KEY'),
  coralogixUrl: get('CORALOGIX_URL')
}

export type Config = typeof config

export default config
