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
}

async function onEventChange({ args, services }: t.ApiRequestProps<Args, Services>) {
    const { graphcms, geo } = services
    const { id: eventId } = args.data

    const event = await graphcms.findEvent(eventId)

    if (!Hashable.hasChanged(event, identify)) {
        return
    }

    const location = await geo.lookupCoordinates(event.location.latitude, event.location.longitude)

    const previousLocation = event.state ? slugger(`${event.state}-${event.city}`) : null
    const newLocation = slugger(`${location.state}-${location.city}`)
    const locationHasChange = previousLocation !== newLocation
    if (locationHasChange) {
        if (previousLocation) {
            await graphcms.disconnectFromLocationMapping(event)
        }
        await graphcms.connectToLocationMapping(event)
    }

    await graphcms.enrichEvent(event.id, {
        city: location.city,
        state: location.state,
        slug: slug(event, location),
        trainingPrice: event.training.price,
        name: event.training.name,
        hash: Hashable.hash(event, identify)
    })
}

async function onEventChangeError({ args, services }: t.ApiRequestProps<Args, Services>) {
    const { graphcms } = services
    const { id: eventId } = args.data
    await graphcms.updateEvent(eventId, {
        enrichmentStatus: 'error'
    })
}

const identify = (event: t.Event): object => {
    return {
        id: event.id,
        latitude: event.location?.latitude,
        longitude: event.location?.longitude,
        trainingId: event.training?.id,
        trainingName: event.training?.name,
        trainingSlug: event.training?.slug,
        startDate: event.startDate,
        endDate: event.endDate,
        price: event.training.price
    }
}

const slug = (event: t.Event, location: {
    city: string
    state: string
}) => {
    const city = location.city.toLowerCase()
    const state = location.state.toLowerCase()
    const start = formatDate(new Date(event.startDate), 'dd-mm-yyyy')
    const end = formatDate(new Date(event.startDate), 'dd-mm-yyyy')
    return `${event.training.slug}-${city}-${state}-${start}-${end}`
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
        geo: makeGeoClient()
    }),
    useCatch(onEventChangeError),
    onEventChange
)