import _ from 'radash'
import * as t from '../../core/types'
import {
    useLambda,
    useService,
    useJsonArgs,
    useApiKeyAuthentication
} from '../../core/http'
import Hashable from '../../core/graphcms/hashable'
import makeGraphCMS, { GraphCMS } from '../../core/graphcms'
import config from '../../config'


interface Args {
    operation: 'update' | 'create' | 'delete'
    data: {
        __typename: 'Training'
        id: string
        stage: 'DRAFT'
    }
}

interface Services {
    graphcms: GraphCMS
}

async function enrichTrainingOnChange({ args, services }: t.ApiRequestProps<Args, Services>) {
    const { graphcms } = services
    const { id: trainingId } = args.data

    const training = await graphcms.findTraining(trainingId)

    if (!Hashable.hasChanged(training, identify)) {
        return
    }

    if (training.gallery.length === 0) {
        return
    }

    const thumbnail = training.gallery[0]

    await graphcms.updateTraining(training.id, {
        thumbnail: {
            id: thumbnail.id
        } as t.Asset,
        hash: Hashable.hash(training, identify)
    })
}

const identify = (training: t.Training): object => {
    return {
        id: training.id,
        gallery: training.gallery.map(asset => asset.id).join("-")
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
        graphcms: makeGraphCMS()
    }),
    enrichTrainingOnChange
)