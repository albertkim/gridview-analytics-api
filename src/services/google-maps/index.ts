import chalk from 'chalk'
import moment from 'moment'
import { RecordsRepository } from '@/repositories/RecordsRepository'
import { getCoordinatesForAddress } from '@/utilities/MapUtilities'

const recordsRepository = new RecordsRepository('final')

export async function populateCoordinates() {

  const records = recordsRepository.getRecords('all')

  for (const record of records.data) {
    
    if (!record.address) continue

    // Correct any potential issues with undefined locations
    if (!record.location) {
      console.log(chalk.yellow(`Undefined coordinates corrected ${record.address}, ${record.city} `))
      record.location = {
        latitude: null,
        longitude: null
      }
    }

    if (record.location.latitude && record.location.longitude) continue

    const coordinates = await getCoordinatesForAddress(record.address, record.city)

    if (!coordinates) {
      console.log(`No coordinates found for ${record.address}, ${record.city} `)
      continue
    }

    record.location.latitude = coordinates.latitude
    record.location.longitude = coordinates.longitude
    record.updateDate = moment().format('YYYY-MM-DD')

    const message = `${record.id} coordinates: ${record.location.latitude}, ${record.location.longitude}`

    if (!record.location.latitude || !record.location.longitude) {
      console.log(chalk.bgGreen(message))
    } else {
      console.log(chalk.bgWhite(message))
    }

    recordsRepository.dangerouslyReplaceAllRecords('all', records.data)

  }

}
