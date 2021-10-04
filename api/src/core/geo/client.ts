import { Geocoder } from 'node-geocoder'


export class GeoClient {
  constructor(
    private geocoder: Geocoder
  ) {

  }

  async lookupCoordinates(lat: number, lon: number): Promise<{
    city: string
    state: string
  }> {
    const [location] = await this.geocoder.reverse({ lat, lon })
    return {
      city: location.city,
      state: location.administrativeLevels?.level1short
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