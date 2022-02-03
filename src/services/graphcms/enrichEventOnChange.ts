import _ from 'radash'
import * as t from '../../core/types'
import formatDate from 'date-fns/format'
import Hashable from '../../core/graphcms/hashable'
import { slugger } from '../../core/model'
import {
    useCatch,
    useLambda,
    useService,
    useJsonArgs,
    useApiKeyAuthentication
} from '../../core/http'
import makeGeoClient, { GeoClient } from '../../core/geo'
import makeGraphCMS, { GraphCMS } from '../../core/graphcms'
import config from '../../config'
import makeApi, { PraxisApi } from '../../core/api'
import runtime from '../../core/runtime'
import { ENRICHMENT_VERSION } from '../../const'


interface Args {
    operation: 'update' | 'create' | 'enrich'
    data: {
        __typename: 'Event'
        id: string
        stage: 'DRAFT'
    }
}

interface Services {
    graphcms: GraphCMS
    geo: GeoClient
    api: PraxisApi
}

async function onEventChange({ args, services }: t.ApiRequestProps<Args, Services>) {
    const { graphcms, geo, api } = services
    const { id: eventId } = args.data

    const event = await graphcms.findEvent(eventId)

    if (!Hashable.hasChanged(event, identify)) {
        return
    }

    if (!event.training) {
        throw new Error(`Event is not connected to a training: ${event.id}`)
    }

    if (!event.training.company) {
        throw new Error(`Training is not connected to a company: ${event.training.id}`)
    }

    const externalLink = await api.fetch<t.LinkRef>('linking.createLink', {
        url: event.directLink,
        title: `Event: ${event.training.name} (${eventId})`
    })

    const location = await geo.lookupCoordinates(event.location.latitude, event.location.longitude)

    const previousLocation = slugger(event.state, event.city)
    const newLocation = slugger(location.state, location.city)
    const locationHasChange = previousLocation !== newLocation

    await graphcms.enrichEvent(event.id, {
        city: location.city,
        state: location.state,
        slug: makeEventSlug(event, location),
        trainingPrice: event.training.price,
        name: event.training.name,
        externalLink: externalLink.link,
        hash: Hashable.hash(event, identify)
    })

    if (locationHasChange) {
        if (previousLocation) {
            await graphcms.disconnectFromLocationMapping(event)
        }
        await graphcms.connectToLocationMapping({
            ...event,
            city: location.city,
            state: location.state
        })
    }
}

async function onError({ args, services }: t.ApiRequestProps<Args, Services>) {
    const { graphcms } = services
    const { id: eventId } = args.data
    await graphcms.trackError('event', eventId, 'enrichEventOnChange', runtime.rid())
}

const identify = (event: t.Event): object => {
    return {
        id: event.id,
        latitude: event.location?.latitude,
        longitude: event.location?.longitude,
        trainingId: event.training?.id,
        companyName: event.training?.company?.name,
        trainingName: event.training?.name,
        trainingSlug: event.training?.slug,
        startDate: event.startDate,
        endDate: event.endDate,
        price: event.training.price,
        directLink: event.directLink,
        enrichmentVersion: ENRICHMENT_VERSION
    }
}

const makeEventSlug = (event: t.Event, location: {
    city: string
    state: string
}) => {
    return slugger(
        event.training.company.slug,
        event.training.slug,
        location.city,
        location.state,
        formatDate(new Date(event.startDate), 'dd-mm-yyyy'),
        formatDate(new Date(event.startDate), 'dd-mm-yyyy')
    )
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
        geo: makeGeoClient(),
        api: makeApi()
    }),
    useCatch(onError),
    onEventChange
)