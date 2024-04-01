import 'module-alias/register'
import { RecordsRepository } from '@/repositories/RecordsRepository'
import { chatGPTJSONQuery } from '@/utilities/AIUtilities'

(async () => {

  // In case the run is interrupted, start from a specific ID
  const startFromId: string | null = null

  // Turns true once ID is hit
  let afterId: boolean = false

  const recordsRepository = new RecordsRepository('final')

  const vancouverDevelopmentPermits = await recordsRepository.getRecords('development permit', {city: 'Vancouver'})

  for (const developmentPermit of vancouverDevelopmentPermits.data) {

    if (startFromId && developmentPermit.id === startFromId) {
      afterId = true
    }
    if (startFromId && !afterId) {
      continue
    }

    const response = await chatGPTJSONQuery(`
      <Content>
        ${developmentPermit.description}
      </Content>

      <Instructions>
        Given the following content, identify if the development permit is for the construction of a new structure or not. Anything that refers to an alteration or renovation should be considered as not a new structure.
        {
          newStructure: boolean
          reason: string
        }
      </Instructions>
    `, 'Claude Haiku')

    console.log(`Development Permit: ${developmentPermit.id} ${developmentPermit.applicationId}`)
    console.log(response)

    if (!response.newStructure) {
      recordsRepository.deleteRecord(developmentPermit.id)
      console.log(`Deleted record with ID ${developmentPermit.id}`)
    }
  }

})()
