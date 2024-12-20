import moment from 'moment'
import chalk from 'chalk'
import { RawNewsRepository } from '@/repositories/RawNewsRepository'
import { AIGetPartialRecords } from '@/utilities/AIUtilitiesV2'
import { RecordsRepository } from '@/repositories/RecordsRepository'
import { FullRecord } from '@/models/Records'
import { findApplicationIDsFromTemplate } from '@/utilities/RegexUtilities'

interface IOptions {
  startDate: string | null
  endDate: string | null
  headless?: boolean | 'new'
}

const recordsRepository = new RecordsRepository('draft')

// Development permits are mentioned in scraped city council meetings
async function scrape(options: IOptions) {

  const news = RawNewsRepository.getNews({city: 'Surrey'})

  // Filter by development permits type, dates, and reports
  const filteredNews = news.data
    .filter((n) => {
      // Check contents and make sure it includes "development permit", case-insensitive
      const regex = /development\s*permit/i
      return regex.test(n.contents)
    })
    .filter((n) => {
      if (options.startDate) {
        if (moment(n.date).isBefore(options.startDate!)) {
          return false
        }
      }
      if (options.endDate) {
        if (moment(n.date).isSameOrAfter(options.endDate!)) {
          return false
        }
      }
      return true
    })
    .filter((n) => {
      return n.reportUrls.length > 0
    })

  return filteredNews

}

export async function analyze(options: IOptions) {

  // Filtered to only include news with at least one report URL
  const newsWithDevelopmentPermits = await scrape(options)

  for (const news of newsWithDevelopmentPermits) {

    const report = news.reportUrls[0]

    // Regex to find XXXX-XXXX-XX where X is a number
    const permitNumbers = findApplicationIDsFromTemplate('XXXX-XXXX-XX', `${report.title} ${news.contents}`)

    if (permitNumbers.length === 0) {
      console.log(chalk.red(`No Surrey XXXX-XXXX-XX permit number found for ${news.date} - ${news.title}`))
      continue
    }

    const permitNumber = permitNumbers[0]

    const response = await AIGetPartialRecords(`${news.title}\n${news.contents}`, {
      instructions: 'Identify only the items that refer to new developments, of buildings bigger than single-family, laneway, coach, or duplex homes. Do not include alterations.',
      applicationId: 'XXXX-XXXX-XX where X is a number',
      fieldsToAnalyze: ['building type', 'stats'],
      expectedWords: [permitNumber]
    })

    const records = response.map((permit) => {
      return new FullRecord({
        city: 'Surrey',
        metroCity: 'Metro Vancouver',
        type: 'development permit',
        applicationId: permitNumber,
        address: permit.address,
        applicant: permit.applicant,
        behalf: permit.behalf,
        description: permit.description,
        rawSummaries: permit.rawSummaries.map((summaryObject) => {
          return {
            summary: summaryObject.summary,
            date: news.date,
            status: 'approved',
            reportUrl: null
          }
        }),
        buildingType: permit.buildingType,
        status: 'approved',
        stats: permit.stats,
        zoning: permit.zoning,
        dates: {
          appliedDate: null,
          publicHearingDate: null,
          approvalDate: news.date,
          denialDate: null,
          withdrawnDate: null
        },
        reportUrls: [
          {
            title: report.title,
            url: report.url,
            date: news.date,
            status: 'approved'
          }
        ],
        minutesUrls: news.minutesUrl ? [
          {
            url: news.minutesUrl,
            date: news.date,
            status: 'approved'
          }
        ] : [],
      })
    })

    for (const record of records) {
      recordsRepository.upsertRecords('development permit', [record])
    }
    
  }

  recordsRepository.reorderRecords()

}
