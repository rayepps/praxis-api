import * as t from '../types'
import { getAccessToken } from './auth'
import { translateText } from './translate'


export class GoogleClient {

  private _accessToken: string
  private _accessTokenPromise: Promise<string>

  constructor() {
    this._accessTokenPromise = getAccessToken()
    this._accessTokenPromise.then(t => this._accessToken = t)
  }

  async accessToken() {
    if (this._accessToken) return this._accessToken
    return await this._accessTokenPromise
  }

  async translateText(
    content: string[],
    sourceLanguageCode: t.LanguageCode,
    targetLanguageCode: t.LanguageCode
  ): Promise<{
    source: string,
    result: string
  }[]> {
    const accessToken = await this.accessToken()
    return translateText(content, sourceLanguageCode, targetLanguageCode, accessToken)
  }
}

export const makeGoogle = () => new GoogleClient()