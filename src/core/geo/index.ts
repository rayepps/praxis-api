import NodeGeocoder from 'node-geocoder'
import { GeoClient } from './client'
import config from '../../config'

export type { GeoClient }

export default function makeGeoClient() {
  return new GeoClient(
    NodeGeocoder({
      provider: 'google',
      apiKey: config.googleGeocodingApiKey
    })
  )
}