import 'module-alias/register'
import { RecordsRepository } from '@/repositories/RecordsRepository'
import chalk from 'chalk'

(async () => {

  const recordsRepository = new RecordsRepository('final')

  const vancouverDevelopmentPermits = await recordsRepository.getRecords('development permit')

  for (const developmentPermit of vancouverDevelopmentPermits.data) {

    if (developmentPermit.buildingType === 'single-family residential') {
      recordsRepository.deleteRecord(developmentPermit.id)
      console.log(chalk.red(`Deleted record with ID ${developmentPermit.id}`))
    }

  }

})()
