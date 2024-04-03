import 'module-alias/register'
import { RecordsRepository } from '@/repositories/RecordsRepository'
import { chatGPTJSONQuery } from '@/utilities/AIUtilities'
import chalk from 'chalk'

(async () => {

  // In case the run is interrupted, start from a specific ID
  const startFromId: string | null = null

  // Turns true once ID is hit
  let afterId: boolean = false

  const recordsRepository = new RecordsRepository('final')

  const vancouverDevelopmentPermits = await recordsRepository.getRecords('development permit')

  for (const developmentPermit of vancouverDevelopmentPermits.data) {

    if (startFromId && developmentPermit.id === startFromId) {
      afterId = true
    }

    if (startFromId && !afterId) {
      console.log(`Skipping record with ID ${developmentPermit.id}`)
      continue
    }

    const response = await chatGPTJSONQuery(`
      <Content>
        ${developmentPermit.description}
      </Content>

      <Instructions>
        Given the following content, identify only the items that refer to the development of new structures that are bigger than a single-family residential, laneway house, or duplex. If residential, should have a minimum of 3 units. Anything that refers to an alteration, renovation, or demolition should be considered as not a new structure. Return in the following JSON format:
        {
          newStructure: boolean
          biggerThanSingleFamily: boolean
          reason: string - keep very short
        }
      </Instructions>
    `, 'Claude Haiku')

    // Wait for 2 seconds (Anthropic rate limit)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    console.log(`Development Permit: ${developmentPermit.id} ${developmentPermit.applicationId}`)
    console.log(response)

    if (!response.newStructure || !response.biggerThanSingleFamily) {
      recordsRepository.deleteRecord(developmentPermit.id)
      console.log(chalk.red(`Deleted record with ID ${developmentPermit.id}`))
    }
  }

})()
