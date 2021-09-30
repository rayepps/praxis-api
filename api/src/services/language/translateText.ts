import _ from 'radash'
import * as t from '../../core/types'
import makeGoogle, { GoogleClient } from '../../core/google'
import {
    useLambda,
    useService,
    useJsonArgs,
    useTokenAuthentication
} from '../../core/http'
import permissions from '../../core/permissions'


interface Args {
    content: string[]
    sourceLanguage: t.LanguageCode
    targetLanguage: t.LanguageCode
}

interface Services {
    google: GoogleClient
}

interface Response {
    results: {
        source: string
        result: string
    }[]
}

async function translateText({ services, args }: t.ApiRequestProps<Args, Services>): Promise<Response> {
    const { google } = services
    const { content, sourceLanguage, targetLanguage } = args

    const results = await google.translateText(content, sourceLanguage, targetLanguage)

    return {
        results
    }

}

export default _.compose(
    useLambda(),
    useTokenAuthentication({
        iss: 'or.api',
        permission: permissions.translate_text
    }),
    useService<Services>({
        google: makeGoogle(),
    }),
    useJsonArgs<Args>(yup => ({
        content: yup.array().of(yup.string()).min(1).required(),
        sourceLanguage: yup.string().required(),
        targetLanguage: yup.string().required()
    })),
    translateText
)