import chalk from 'chalk'
import { IRawNews } from '@/models/News'
import { ErrorsRepository } from '@/repositories/ErrorsRepository'
import { FullRecord } from '@/models/Records'
import { findApplicationIDsFromTemplate } from '@/utilities/RegexUtilities'
import { AIGetPartialRecords } from '@/utilities/AIUtilitiesV2'

export function checkIfBylaw(news: IRawNews) {

  const includesDevelopmentId = findApplicationIDsFromTemplate('XXXX-XXXX-XX', news.contents).length > 0
  const isNotLandUseApplication = !news.title.toLowerCase().includes('land use application')
  const includesBylawsAndPermits = news.title.toLowerCase().includes('bylaws and permits')
  const includesRezoning = news.contents.toLowerCase().includes('amendment bylaw')
  const isNotReading = !news.contents.toLowerCase().includes('reading')

  return includesDevelopmentId && isNotLandUseApplication && includesBylawsAndPermits && includesRezoning && isNotReading

}

export async function parseBylaw(news: IRawNews): Promise<FullRecord[]> {

  try {

    const rezoningIds = findApplicationIDsFromTemplate('XXXX-XXXX-XX', news.contents)

    if (rezoningIds.length === 0) {
      console.log(chalk.yellow(`No rezoning IDs found in ${news.title}`))
      return []
    }

    // Expect one rezoning item per application
    const rezoningId = rezoningIds[0]

    const response = await AIGetPartialRecords(`${news.title}\n${news.contents}`, {
      expectedWords: [rezoningId],
      fieldsToAnalyze: ['building type', 'zoning', 'stats', 'status'],
      applicationId: 'in the format of XXXX-XXXX-XX where Xs are numbers',
      statusOptions: 'one of "approved", "denied", "withdrawn" - default to "approved" if unclear'
    })

    if (!response || response.length === 0) {
      console.log(chalk.red(`No response for Surrey bylaw - ${news.title}`))
      return []
    }

    return response.map((record) => {
      const status = record.status!
      return new FullRecord({
        city: 'Surrey',
        metroCity: 'Metro Vancouver',
        type: 'rezoning',
        applicationId: record.applicationId,
        address: record.address,
        applicant: record.applicant,
        behalf: record.behalf,
        description: record.description,
        rawSummaries: record.rawSummaries.map((summaryObject) => {
          return {
            summary: summaryObject.summary,
            date: news.date,
            status: status,
            reportUrl: null
          }
        }),
        buildingType: record.buildingType,
        status: status,
        dates: {
          appliedDate: null,
          publicHearingDate: null,
          approvalDate: status === 'approved' ? news.date : null,
          denialDate: status === 'denied' ? news.date : null,
          withdrawnDate: status === 'withdrawn' ? news.date : null
        },
        stats: record.stats,
        zoning: record.zoning,
        reportUrls: news.reportUrls.map((urlObject) => {
          return {
            date: news.date,
            title: urlObject.title,
            url: urlObject.url,
            status: status
          }
        }),
        minutesUrls: news.minutesUrl ? [{
          date: news.date,
          url: news.minutesUrl,
          status: status
        }] : []
      })
    })

  } catch (error) {
    console.error(chalk.bgRed(`Error parsing bylaw for ${news.date} - ${news.title}`))
    console.error(chalk.red(error))
    ErrorsRepository.addError(news)
    return []
  }

}
