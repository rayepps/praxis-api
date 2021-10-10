import _ from 'radash'
import * as t from '../../core/types'
import {
    useLambda,
    useService,
    useJsonArgs,
    useApiKeyAuthentication,
    useCatch
} from '../../core/http'
import Hashable from '../../core/graphcms/hashable'
import makeGraphCMS, { GraphCMS } from '../../core/graphcms'
import config from '../../config'
import makeApi, { PraxisApi } from '../../core/api'
import runtime from '../../core/runtime'


interface Args {
    operation: 'update' | 'create' | 'enrich'
    data: {
        __typename: 'Training'
        id: string
        stage: 'DRAFT'
    }
}

interface Services {
    graphcms: GraphCMS
    api: PraxisApi
}

async function enrichTrainingOnChange({ args, services }: t.ApiRequestProps<Args, Services>) {
    const { graphcms, api } = services
    const { id: trainingId } = args.data

    const training = await graphcms.findTraining(trainingId)

    if (!Hashable.hasChanged(training, identify)) {
        return
    }

    const externalLink = await api.fetch<t.LinkRef>('linking.createLink', {
        url: training.directLink
    })

    // If no gallery images were added. We should set the
    // gallery and the thumbnail to the company's images
    const hasGalleryImages = training.gallery.length > 0
    const gallery = hasGalleryImages
        ? training.gallery
        : [training.company.thumbnail]

    await graphcms.updateTraining(training.id, {
        gallery,
        thumbnail: {
            id: gallery[0].id
        } as t.Asset,
        externalLink: externalLink.link,
        displayPrice: formatPrice(training.price),
        hash: Hashable.hash(training, identify)
    })
}

const identify = (training: t.Training): object => {
    return {
        id: training.id,
        price: training.price,
        directLink: training.directLink
    }
}

/**
 * 23      -> $23
 * 458     -> $458
 * 800.50  -> $800.50
 * 12345   -> $12,345
 * 1452.02 -> $1,452.02
 */
const formatPrice = (price: number): string => {
    if (!price) return null
    const withCommas = price.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
    const withoutEmptyDecimals = withCommas.replace(/\.00$/, '')
    return `$${withoutEmptyDecimals}`
}

async function onError({ args, services }: t.ApiRequestProps<Args, Services>) {
    const { graphcms } = services
    const { id: trainingId } = args.data
    await graphcms.trackError('training', trainingId, 'enrichTrainingOnChange', runtime.rid())
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
    enrichTrainingOnChange
)