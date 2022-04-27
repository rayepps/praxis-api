const get = <T = string>(name: string, defaultValue: T = null, cast: (v: any) => T = v => v): T => {
  const val = process.env[name]
  if (!val) return defaultValue
  return cast(val)
}

const config = {
  env: get('PRAXIS_ENV'),
  apiKey: get('PRAXIS_API_KEY'),
  tokenSignatureSecret: get('TOKEN_SIG_SECRET'),
  graphcmsWebhookKey: get('GRAPHCMS_WEBHOOK_KEY'),
  graphcmsApiToken: get('GRAPHCMS_API_TOKEN'),
  graphcmsApiUrl: get('GRAPHCMS_API_URL'),
  googleGeocodingApiKey: get('GOOGLE_GEOCODING_API_KEY'),
  segmentKey: get('SEGMENT_KEY'),
  redirectorUrl: get('PRAXIS_REDIRECTOR_URL'),
  redirectorApiKey: get('PRAXIS_REDIRECTOR_API_KEY'),
  logtailToken: get('LOGTAIL_TOKEN'),
  slackOauthToken: get('SLACK_OAUTH_TOKEN'),
  redisUsername: get('REDIS_USERNAME'),
  redisPassword: get('REDIS_PASSWORD'),
  redisUrl: get('REDIS_URL'),
  dynamoAccessKeyId: get('DYNAMO_ACCESS_KEY_ID'),
  dynamoSecretAccessKey: get('DYNAMO_SECRET_ACCESS_KEY'),
  dynamoTableName: get('DYNAMO_TABLE_NAME'),
  autopilotApiKey: get('AUTOPILOT_API_KEY'),
  zeploToken: get('ZEPLO_TOKEN'),
  postmarkToken: get('POSTMARK_TOKEN'),
  mongoUri: get('MONGO_URI')
}

export type Config = typeof config

export default config
