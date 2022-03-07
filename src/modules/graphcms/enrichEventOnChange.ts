import _ from 'radash'
import * as t from '../../core/types'
import type { Props } from '@exobase/core'
import { useLogger } from '../../core/hooks/useLogger'
import { useJsonArgs, useService } from '@exobase/hooks'
import { useApiKeyAuthentication } from '@exobase/auth'
import { useLambda } from '@exobase/lambda'
import makeGraphCMS, { GraphCMS } from '../../core/graphcms'
import config from '../../core/config'
import { ENRICHMENT_VERSION } from '../../core/const'
import makeRedirector, { Redirector } from '../../core/redirector'
import Hashable from '../../core/graphcms/hashable'
import makeGeoClient, { GeoClient } from '../../core/geo'
import { slugger } from '../../core/model'
import formatDate from 'date-fns/format'

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
  redirector: Redirector
}

async function onEventChange({ args, services }: Props<Args, Services>) {
  const { graphcms, geo, redirector } = services
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

  const { error, data } = await redirector.links.create({
    url: event.directLink,
    title: `Event: ${event.training.name} id(${eventId})`,
    class: 'event',
    metadata: {
      eventId
    }
  }, { key: config.redirectorApiKey })
  if (error) {
    // quietly log error. Trying not to throw in webhook
    console.error('Request to redirector failed', { error })
    return
  }

  const location = await geo.lookupCoordinates(event.location.latitude, event.location.longitude)

  const previousLocation = slugger(event.state, event.city)
  const newLocation = slugger(location.state, location.city)
  const locationHasChange = previousLocation !== newLocation

  await graphcms.enrichEvent(event.id, {
    city: location.city,
    state: location.state,
    slug: makeEventSlug(event, location),
    trainingPrice: Math.round(Number(event.training.price)),
    name: event.training.name,
    externalLink: data.link.link,
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

const makeEventSlug = (
  event: t.Event,
  location: {
    city: string
    state: string
  }
) => {
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
  useLogger(),
  useLambda(),
  useApiKeyAuthentication(config.graphcmsWebhookKey),
  useJsonArgs<Args>(yup => ({
    operation: yup.string(),
    data: yup.mixed()
  })),
  useService<Services>({
    graphcms: makeGraphCMS(),
    geo: makeGeoClient(),
    redirector: makeRedirector()
  }),
  onEventChange
)
