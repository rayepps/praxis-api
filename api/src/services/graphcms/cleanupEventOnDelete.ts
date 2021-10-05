import _ from 'radash'
import * as t from '../../core/types'
import {
    useLambda,
    useService,
    useJsonArgs,
    useApiKeyAuthentication
} from '../../core/http'
import makeGraphCMS, { GraphCMS } from '../../core/graphcms'
import config from '../../config'


interface Args {
    operation: 'delete'
    data: {
        __typename: 'Event'
        id: string
        stage: 'DRAFT'
    }
}

interface Services {
    graphcms: GraphCMS
}

async function onEventDelete({ args, services }: t.ApiRequestProps<Args, Services>) {
    const { graphcms } = services
    const event = args.data
    await graphcms.disconnectFromLocationMapping(event as t.Event)
}

export default _.compose(
    useLambda(),
    useApiKeyAuthentication(config.graphcmsWebhookKey),
    useJsonArgs<Args>(yup => ({
        operation: yup.string(),
        data: yup.mixed()
    })),
    useService<Services>({
        graphcms: makeGraphCMS()
    }),
    onEventDelete
)