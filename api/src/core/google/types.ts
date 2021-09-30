import * as t from '../types'

export interface TranslateTextResponse {
  translations: Translation[]
  glossaryTranslations: Translation[]
}

export interface Translation {
  translatedText: string
  model: string
  detectedLanguageCode: t.LanguageCode
  // glossaryConfig: {
  //   object (TranslateTextGlossaryConfig)
  // }
}