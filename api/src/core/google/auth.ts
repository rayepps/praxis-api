import { google } from 'googleapis'
import config from '../../config'


export const getAccessToken = async (): Promise<string> => {

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: config.googleClientEmail,
      private_key: config.googlePrivateKey.replace(/\\n/g, '\n')
    },
    projectId: config.googleProjectId,
    scopes: [
      'https://www.googleapis.com/auth/cloud-platform',
      'https://www.googleapis.com/auth/cloud-translation'
    ]
  })

  const accessToken = await auth.getAccessToken()

  return accessToken
}
