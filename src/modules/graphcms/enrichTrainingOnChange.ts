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
  redirector: Redirector
}

async function enrichTrainingOnChange({ args, services }: Props<Args, Services>) {
  const { graphcms, redirector } = services
  const { id: trainingId } = args.data

  const training = await graphcms.findTraining(trainingId)

  if (!Hashable.hasChanged(training, identify)) {
    console.info('Skipping training enrichment, source properties have not changed since last update', {
      properties: identify(training)
    })
    return
  }

  if (!training.company) {
    console.error(`Training is not connected to a company: ${training.id}. Quitting training enrichment`)
    return
  }

  const { error, data } = await redirector.links.create({
    url: training.directLink,
    title: `Training: ${training.name} id(${trainingId})`,
    class: 'training',
    metadata: {
      trainingId
    }
  }, { key: config.redirectorApiKey })
  if (error) {
    // quietly log error. Trying not to throw in webhook
    console.error('Request to redirector failed', { error })
    return
  }

  // If no gallery images were added. We should set the
  // gallery and the thumbnail to the company's images
  const hasGalleryImages = training.gallery.length > 0
  const gallery = hasGalleryImages ? training.gallery : [training.company.thumbnail]

  await graphcms.enrichTraining(training.id, {
    gallery,
    thumbnail: {
      id: gallery[0].id
    } as t.Asset,
    externalLink: data.link.link,
    displayPrice: formatPrice(training.price),
    hash: Hashable.hash(training, identify)
  })
}

const identify = (training: t.Training): object => {
  return {
    id: training.id,
    price: training.price,
    directLink: training.directLink,
    enrichmentVersion: ENRICHMENT_VERSION
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
    redirector: makeRedirector()
  }),
  enrichTrainingOnChange
)
