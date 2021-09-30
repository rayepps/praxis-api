import _ from 'radash'
import * as t from '../types'
import config from '../../config'
import axios, { AxiosResponse } from 'axios'
import { TranslateTextResponse } from './types'


/**
 * See https://cloud.google.com/translate/docs/reference/rest/v3/projects/translateText?apix_params=%7B%22parent%22%3A%22projects%2Fstellar-fx-326717%22%2C%22resource%22%3A%7B%22contents%22%3A%5B%22hello%20ray%22%5D%2C%22targetLanguageCode%22%3A%22es%22%7D%7D&apix=true
 */
 export const translateText = async (
  contents: string[],
  sourceLanguageCode: t.LanguageCode,
  targetLanguageCode: t.LanguageCode,
  accessToken: string
): Promise<{
  source: string,
  result: string
}[]> => {

  const req = _.try<AxiosResponse<TranslateTextResponse>>(axios.post)
  const [err, response] = await req(
    `https://translation.googleapis.com/v3/projects/${config.googleProjectId}:translateText?alt=json`,
    {
      contents,
      sourceLanguageCode,
      targetLanguageCode
    },
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

  // TODO: Figure out what kind of errors google
  // throws and catch them here, process, identify
  // and throw more meaningful errors to our system
  if (err) {
    console.log((err as any).response?.data)
    console.error(err)
    throw err
  }
  if (!response) throw err
  if (response.status >= 400) throw err

  const { translations } = response.data

  const zipped = translations.reduce((acc, trans, idx) => {
    return [...acc, {
      source: contents[idx],
      result: trans.translatedText
    }]
  }, [] as { source: string, result: string }[])

  return zipped

}