import moment from 'moment'
import puppeteer from 'puppeteer'
import chalk from 'chalk'
import { formatDateString } from '@/utilities/StringUtilities'
import { AIGetPartialRecords } from '@/utilities/AIUtilitiesV2'
import { RecordsRepository } from '@/repositories/RecordsRepository'
import { parsePDFAsRawArray } from '@/utilities/PDFUtilitiesV2'
import { FullRecord } from '@/models/Records'
import { findApplicationIDsFromTemplate } from '@/utilities/RegexUtilities'

const startUrl = 'https://www.burnaby.ca/services-and-payments/permits-and-applications/building-permits-issued-and-tabulation-reports'

interface IOptions {
  startDate: string | null
  endDate: string | null
  headless?: boolean | 'new'
}

const recordsRepository = new RecordsRepository('draft')

// PDF examples: https://www.burnaby.ca/services-and-payments/permits-and-applications/building-permits-issued-and-tabulation-reports
async function scrape(options: IOptions) {

  const browser = await puppeteer.launch({
    headless: true
  })

  const page = await browser.newPage()

  await page.goto(startUrl)

  const developmentPermitUrls = await page.evaluate(async () => {

    const jqueryScript = document.createElement('script')
    jqueryScript.src = 'https://code.jquery.com/jquery-3.6.0.min.js'
    jqueryScript.type = 'text/javascript'
    document.getElementsByTagName('head')[0].appendChild(jqueryScript)

    await new Promise((resolve) => {setTimeout(resolve, 1000)})

    const urls = $('.accordion a').map((index, element) => {
      return {
        title: $(element).text().trim(), // ex. February 1, 2023.pdf
        url: new URL($(element).attr('href')!, window.location.origin).href,
      }
    }).get()

    return urls

  })

  // Filter by date
  const filteredDevelopmentPermitUrls = developmentPermitUrls
    .map((urlObject) => {
      return {
        ...urlObject,
        date: formatDateString(urlObject.title.replace('.pdf', ''))
      }
    })
    .filter((urlObject) => {
      if (options.startDate) {
        if (moment(urlObject.date).isBefore(options.startDate!)) {
          return false
        }
      }
      if (options.endDate) {
        if (moment(urlObject.date).isSameOrAfter(options.endDate!)) {
          return false
        }
      }
      return true
    })

  return filteredDevelopmentPermitUrls

}

export async function analyze(options: IOptions) {

  const developmentPermitUrls = await scrape(options)

  for (const urlObject of developmentPermitUrls) {

    const parsedArray = await parsePDFAsRawArray(urlObject.url)

    for (const parsed of parsedArray) {

      // Find the instances of building permit IDs
      // Don't need to worry about other permid ID references inside descriptions, Burnaby descriptions are too short to include them
      const permitNumbers = findApplicationIDsFromTemplate('BLDXX-XXXXX', parsed)

      if (permitNumbers.length === 0) {
        console.log(chalk.red(`No Burnaby BLDXX-XXXXX permit number found for ${urlObject.date} - ${urlObject.url}`))
        continue
      }

      const response = await AIGetPartialRecords(parsed, {
        instructions: `The following text extracted from a PDF is messy but do your best. Identify only the items that refer to the development of new structures that are bigger than single-family, laneway, coach, or duplex homes. Do not include alterations nor demolitions. Number of units is usually a number listed right after the $ value`,
        applicationId: 'must match BLDXX-XXXXX where X is a number',
        fieldsToAnalyze: ['building type', 'stats'],
        expectedWords: permitNumbers
      })

      // Only get entries with an applicationId in the response
      // NOTE: For now, the $ value of work is not incorporated, something to think about for the future.
      // My current thinking is that not enough cities publish these values.
      const records = response
        .filter((permit) => permit.applicationId)
        // Sometimes DEMO permits are included from the AI analysis, so we need to filter them out
        .filter((permit) => !permit.applicationId?.includes('DEMO'))
        .map((permit) => {
          return new FullRecord({
            type: 'development permit',
            city: 'Burnaby',
            metroCity: 'Metro Vancouver',
            applicationId: permit.applicationId,
            address: permit. address,
            applicant: permit.applicant,
            behalf: permit.behalf,
            description: permit.description,
            rawSummaries: permit.rawSummaries.map((summaryObject) => {
              return {
                summary: summaryObject.summary,
                date: urlObject.date,
                status: 'approved',
                reportUrl: urlObject.url
              }
            }),
            buildingType: permit.buildingType,
            status: 'approved',
            stats: permit.stats,
            zoning: permit.zoning,
            dates: {
              appliedDate: null,
              publicHearingDate: null,
              approvalDate: urlObject.date,
              denialDate: null,
              withdrawnDate: null
            },
            reportUrls: [
              {
                title: urlObject.title,
                url: urlObject.url,
                date: urlObject.date,
                status: 'approved'
              }
            ],
            minutesUrls: [],
          })
        })

      for (const record of records) {
        recordsRepository.upsertRecords('development permit', [record])
      }

    }

  }

  recordsRepository.reorderRecords()

}
