import axios from 'axios'
import moment from 'moment'
import fs from 'fs'
import path from 'path'
import csv from 'csvtojson'
import puppeteer from 'puppeteer'
import { cleanString, formatDateString } from '@/utilities/StringUtilities'
import { AIGetRecordDetails } from '@/utilities/AIUtilitiesV2'
import { RecordsRepository } from '@/repositories/RecordsRepository'
import { FullRecord } from '@/models/Records'
import { chatGPTJSONQuery } from '@/utilities/AIUtilities'

const startUrl = 'https://data.opendatasoft.com/explore/dataset/issued-building-permits%40vancouver/export/?sort=-issueyear'

interface IOptions {
  startDate: string | null
  endDate: string | null
  headless?: boolean | 'new'
}

interface IVancouverDevelopmentPermit {
  PermitNumber: string
  PermitNumberCreatedDate: string
  IssueDate: string
  PermitElapsedDays: string
  ProjectValue: string
  TypeOfWork: string
  Address: string
  ProjectDescription: string
  PermitCategory: string
  Applicant: string
  ApplicantAddress: string
  PropertyUse: string
  SpecificUseCategory: string
  BuildingContractor: string
  BuildingContractorAddress: string
  IssueYear: string
  GeoLocalArea: string
  Geom: string
  YearMonth: string
  geo_point_2d: string
}

const recordsRepository = new RecordsRepository('draft')

async function scrape(options: IOptions) {

  const browser = await puppeteer.launch({
    headless: true
  })

  const page = await browser.newPage()

  await page.goto(startUrl)

  const csvExportUrl = await page.evaluate(async () => {

    // Page already comes with jQuery

    const rawExportUrl = $('a:contains("Whole dataset")').first().attr('href')!
    const exportUrl = new URL(rawExportUrl, window.location.origin).href
    return exportUrl

  })

  // Note: This is a large 40mb+ file
  const response = await axios.get(csvExportUrl, { responseType: 'arraybuffer' })
  const csvString = Buffer.from(response.data).toString('utf8')

  const data: IVancouverDevelopmentPermit[] = await csv({
    delimiter: ';',
    trim: true,
    nullObject: true
  }).fromString(csvString)

  // Save file as a local file for future reference
  fs.writeFileSync(path.join(__dirname, 'vancouver-dps.json'), JSON.stringify(data, null, 2))

  // Only return approved permits for new buildings, filter by date
  const filteredData = data
    .filter((row) => !!row['IssueDate'])
    .filter((row) => row['TypeOfWork'] === 'New Building')
    .filter((row) => {
      const date = formatDateString(row['IssueDate'])
      if (options.startDate) {
        if (moment(date).isBefore(options.startDate!)) {
          return false
        }
      }
      if (options.endDate) {
        if (moment(date).isSameOrAfter(options.endDate!)) {
          return false
        }
      }
      return true
    })

  return filteredData

}

export async function analyze(options: IOptions) {

  const data = await scrape(options)

  for (const entry of data) {

    const detailsResponse = await AIGetRecordDetails(entry.ProjectDescription, {fieldsToAnalyze: ['building type', 'stats']})

    if (!detailsResponse) {
      continue
    }

    // Use AI to identify if this is a new structure or not
    const newStructureResponse = await chatGPTJSONQuery(`
      <Content>
        ${entry.ProjectDescription}
      </Content>

      <Instructions>
        Given the following development permit, identify if it is for the construction of a new structure or not. Anything that refers to an alteration, renovation, or an additional to an existing structure should be considered as not a new structure. Only include structures that are more substantial than single-family homes, laneway houses, or duplexes because these items are not significant.

        {
          newStructure: boolean
          reason: string
        }

      </Instructions>
    `, 'Claude Haiku')

    if (!newStructureResponse.newStructure) {
      continue
    }
    
    const record = new FullRecord({
      city: 'Vancouver',
      metroCity: 'Metro Vancouver',
      type: 'development permit',
      applicationId: entry.PermitNumber,
      address: entry.Address.split(', Vancouver')[0],
      applicant: entry.Applicant,
      behalf: null,
      description: cleanString(entry.ProjectDescription),
      rawSummaries: [
        {
          summary: JSON.stringify(entry),
          date: formatDateString(entry.IssueDate),
          status: 'approved',
          reportUrl: startUrl
        }
      ],
      buildingType: detailsResponse.buildingType,
      status: 'approved',
      dates: {
        appliedDate: null,
        publicHearingDate: null,
        approvalDate: formatDateString(entry.IssueDate),
        denialDate: null,
        withdrawnDate: null
      },
      stats: detailsResponse.stats,
      zoning: detailsResponse.zoning,
      reportUrls: [
        {
          url: startUrl,
          title: 'Vancouver OpenData',
          date: formatDateString(entry.IssueDate),
          status: 'approved'
        }
      ],
      minutesUrls: [], // No minutes for vancouver development permits
    })

    recordsRepository.upsertRecords('development permit', [record])

  }

  recordsRepository.reorderRecords()

}
