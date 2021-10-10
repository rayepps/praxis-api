import _ from 'radash'
import * as t from '../../core/types'
import Hashable from '../../core/graphcms/hashable'
import {
    useCatch,
    useLambda,
    useService,
    useJsonArgs,
    useApiKeyAuthentication
} from '../../core/http'
import runtime from '../../core/runtime'
import makeGraphCMS, { GraphCMS } from '../../core/graphcms'
import config from '../../config'
import makeApi, { PraxisApi } from '../../core/api'


interface Args {
    operation: 'update' | 'create' | 'enrich'
    data: {
        __typename: 'Company'
        id: string
        stage: 'DRAFT'
    }
}

interface Services {
    graphcms: GraphCMS
    api: PraxisApi
}

async function onCompanyChange({ args, services }: t.ApiRequestProps<Args, Services>) {
    const { graphcms, api } = services
    const { id: companyId } = args.data

    const company = await graphcms.findCompany(companyId)

    if (!Hashable.hasChanged(company, identify)) {
        return
    }

    const externalLink = await api.fetch<t.LinkRef>('linking.createLink', {
        url: company.directLink
    })

    await graphcms.enrichCompany(company.id, {
        externalLink: externalLink.link,
        hash: Hashable.hash(company, identify)
    })
}

async function onError({ args, services }: t.ApiRequestProps<Args, Services>) {
    const { graphcms } = services
    const { id: companyId } = args.data
    await graphcms.trackError('company', companyId, 'enrichCompanyOnChange', runtime.rid())
}

const identify = (company: t.Company): object => {
    return {
        id: company.id,
        directLink: company.directLink
    }
}

export default _.compose(
    useLambda(),
    useApiKeyAuthentication(config.graphcmsWebhookKey),
    useJsonArgs<Args>(yup => ({
        operation: yup.string(),
        data: yup.mixed()
    })),
    useService<Services>({
        graphcms: makeGraphCMS(),
        api: makeApi()
    }),
    useCatch(onError),
    onCompanyChange
)