import { IBuildingTypeAnalytics, IBuildingTypeAnalyticsCityEntry } from '@/models/Analytics'
import { FullRecord } from '@/models/Records'
import { RecordsRepository } from '@/repositories/RecordsRepository'

const recordsRepository = new RecordsRepository('final')

// Commonly used functions are defined underneath the service definition
export const AnalyticsService = {

  analyticsByBuildingType: async function(type: 'rezoning' | 'development permit', status: 'applied' | 'approved'): Promise<IBuildingTypeAnalytics> {

    const records = (recordsRepository.getRecords(type)).data

    const dateStatusMapping: {
      [key in 'applied' | 'approved']: RecordDateField
    } = {
      applied: 'appliedDate',
      approved: 'approvalDate'
    }

    const cities = Array.from(new Set(records.map((record) => record.city)))

    // Gropu all records then get the year array so that every entry has the same years
    const years = groupByYear(records, dateStatusMapping[status]).map((group) => group.year)

    const data: IBuildingTypeAnalyticsCityEntry[] = []

    for (const city of cities) {
      const recordsByCity = records.filter((record) => record.city === city)
      const recordsByCityAndYear = groupByYear(recordsByCity, dateStatusMapping[status])
      data.push({
        city: {
          cityName: city
        },
        yearData: years.map((year) => {
          const recordsInYear = recordsByCityAndYear.find((group) => group.year === year)
          const buildingTypeData = {
            'single-family residential': 0,
            'townhouse': 0,
            'mixed use': 0,
            'multi-family residential': 0,
            'industrial': 0,
            'commercial': 0,
            'other': 0
          }
          if (recordsInYear) {
            recordsInYear.records.forEach((record) => {
              if (record.buildingType) {
                buildingTypeData[record.buildingType]++
              }
            })
          }
          return {
            year: year,
            buildingTypeData: buildingTypeData
          }
        })
      })
    }

    return {
      cityData: data
    }

  }

}

type RecordDateField = 'appliedDate' | 'publicHearingDate' | 'approvalDate' | 'denialDate' | 'withdrawnDate'

// Groups records by year in chronological order with any empty years in between filled in with empty values
// Use the field record.dates[dateField] to get the date value, string in YYYY-MM-DD format, account for potential null values
function groupByYear(records: FullRecord[], dateField: RecordDateField) {
  const years = records.map((record) => record.dates[dateField]?.split('-')[0]).filter((year) => year !== undefined) as string[]
  const minYear = Math.min(...years.map((year) => parseInt(year)))
  const maxYear = Math.max(...years.map((year) => parseInt(year)))
  const groupedRecords: {year: string, records: FullRecord[]}[] = []
  for (let year = minYear; year <= maxYear; year++) {
    const yearString = year.toString()
    const recordsInYear = records.filter((record) => record.dates[dateField]?.startsWith(yearString))
    groupedRecords.push({
      year: yearString,
      records: recordsInYear
    })
  }
  return groupedRecords
}
