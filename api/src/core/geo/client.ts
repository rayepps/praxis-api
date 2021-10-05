import { Geocoder } from 'node-geocoder'
import * as t from '../types'


export class GeoClient {
  constructor(
    private geocoder: Geocoder
  ) {

  }

  async lookupCoordinates(lat: number, lon: number): Promise<{
    city: string
    state: t.USState
  }> {
    const [location] = await this.geocoder.reverse({ lat, lon })
    return {
      city: location.city,
      state: location.administrativeLevels?.level1short as t.USState
    }
  }

  async lookupAddress(address: string): Promise<{
    lat: number
    lon: number
  }> {
    const [location] = await this.geocoder.geocode(address)
    return {
      lat: location.latitude,
      lon: location.longitude
    }
  }

}