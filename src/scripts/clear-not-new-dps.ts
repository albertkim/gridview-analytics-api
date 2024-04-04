import 'module-alias/register'
import { RecordsRepository } from '@/repositories/RecordsRepository'
import { chatGPTJSONQuery } from '@/utilities/AIUtilities'
import chalk from 'chalk'

(async () => {

  // In case the run is interrupted, start from a specific ID
  const startFromId: string | null = null

  // Turns true once ID is hit
  let afterId: boolean = false

  const recordsRepository = new RecordsRepository('draft')

  const developmentPermits = await recordsRepository.getRecords('development permit', {city: 'Surrey'})

  for (const developmentPermit of developmentPermits.data) {

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
        Given the following content, identify if it refers to the development of new buildings that are bigger than a single-family residential, laneway house, or duplex. If residential, should have a minimum of 3 units. Anything that refers to a structure alteration, renovation, or demolition should be considered as not a new structure.

        Examples of new buildings:
        - 6 story apartment
        - 50 townhouses
        - 4 story mixed-use building
        - Comprehensive development

        Examples of not new buildings:
        - Renovation of existing building
        - A sign or board or an existing building
        - Changing the use of an existing building
        - Heritage or character alteration
        - An infrastructure systems upgrade
        - A parking lot
        - A demolition
        
        Return in the following JSON format:

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
