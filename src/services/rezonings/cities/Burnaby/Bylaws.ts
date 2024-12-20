import chalk from 'chalk'
import { IRawNews } from '@/models/News'
import { FullRecord } from '@/models/Records'
import { ErrorsRepository } from '@/repositories/ErrorsRepository'
import { findApplicationIDsFromTemplate } from '@/utilities/RegexUtilities'
import { AIGetPartialRecords } from '@/utilities/AIUtilitiesV2'

// Check that title prefixes ABANDONMENT for FINAL ADOPTION
export function checkIfBylaw(news: IRawNews) {
  const isBurnaby = news.city === 'Burnaby'
  const isCityCouncil = ['City Council Meeting', 'City Council'].some((string) => news.meetingType.includes(string))
  const isFinalAdoptionOrAbandanment = news.title.toLowerCase().includes('final adoption') || news.title.toLowerCase().includes('abandonment')
  const isRezoningTitle = news.title.toLowerCase().includes('zoning bylaw')
  const hasRez = news.title.toLowerCase().includes('rez')

  return isBurnaby && isCityCouncil && isFinalAdoptionOrAbandanment && isRezoningTitle && hasRez && hasRez
}

// Burnaby bylaw info can be found in the scraped text, attached PDFs are not very helpful
export async function parseBylaw(news: IRawNews): Promise<FullRecord[]> {

  try {

    const infoString = `${news.title} - ${news.contents}`

    // Get rezoning IDs
    const rezoningIds = findApplicationIDsFromTemplate('REZ #XX-XX', infoString)
    const rezoningId = rezoningIds.length > 0 ? rezoningIds[0] : null

    if (!rezoningId) {
      console.log(chalk.yellow(`Error finding rezoning ID from bylaw - ${news.title} - ${news.date} - ${news.contents}`))
      return []
    }

    const response = await AIGetPartialRecords(infoString,
      {
        applicationId: 'ID in the format of REZ #XX-XX where X is a number - format if necessary',
        fieldsToAnalyze: ['building type', 'stats', 'status'],
        statusOptions: 'one of "approved" (if text says something like final adoption), "denied", or "withdrawn" - default to "approved" if unclear',
        expectedWords: [rezoningId]
      }
    )

    if (!response || response.length === 0) {
      console.log(chalk.bgRed(`Error parsing application - ${news.title} - ${news.date} - ${news.contents}`))
      return []
    }

    return response
      .filter((record) => record.applicationId)
      .map((record) => {
        const status = record.status!
        return new FullRecord({
          city: 'Burnaby',
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
              reportUrl: news.reportUrls[0].url
            }
          }),
          status: status!,
          dates: {
            appliedDate: null,
            publicHearingDate: null,
            approvalDate: status === 'approved' ? news.date : null,
            denialDate: status === 'denied' ? news.date : null,
            withdrawnDate: status === 'withdrawn' ? news.date : null
          },
          stats: record.stats,
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
    console.error(chalk.bgRed('Error parsing bylaw'))
    console.error(chalk.red(error))
    ErrorsRepository.addError(news)
    return []
  }

}
