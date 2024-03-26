import { Client } from '@googlemaps/google-maps-services-js'

interface ICoordinates {
  latitude: number
  longitude: number
}

const client = new Client({})

export async function getCoordinatesForAddress(address: string, city: string): Promise<ICoordinates | null> {

  const response = await client.geocode({
    params: {
      address: `${address}, ${city}`,
      key: process.env.GOOGLE_MAPS_API_KEY!
    }
  })

  if (response.data.results.length === 0) {
    console.log(`No coordinates found for ${address}, ${city} `)
    return null
  }

  return {
    latitude: response.data.results[0].geometry.location.lat,
    longitude: response.data.results[0].geometry.location.lng
  }

}
