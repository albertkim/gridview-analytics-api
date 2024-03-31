import { BuildingType, FullRecord } from '@/models/Records'
import { RecordsRepository } from '@/repositories/RecordsRepository'

const recordsRepository = new RecordsRepository('final')

// Commonly used functions are defined underneath the service definition
export const AnalyticsService = {

  /**
   * Return the following data format. Make sure that the years are in chronological order, and that all cities are included in each year, even if values are 0. All city sub-object keys should be BuildingType or 'total', and all building type fields should be included in each city sub-object.
   * {
   *   data: [
   *     {
   *       year: '2018',
   *       data: {
   *         city1: {
   *           single-family residential: 5,
   *           multi-family residential: 3,
   *           townhouse: 5,
   *           mixed-use: 3,
   *           commercial: 1,
   *           industrial: 0,
   *           other: 1,
   *           total: 10
   *         },
   *         city2: {
   *           ...
   *         },
   *         city3: {
   *           ...
   *         }
   *       }
   *     },
   *     {
   *       year: '2019',
   *       data: {
   *         city1: {
   *           ...
   *         },
   *         city2: {
   *           ...
   *         },
   *         city3: {
   *           ...
   *         }
   *       }
   *     }
   *   ]
   * }
   */
  analysisByBuildingType: async function(type: 'rezoning' | 'development permit', status: 'applied' | 'approved') {
    const records = (await recordsRepository.getRecords(type)).data
    const statusMapping: {
      [key in 'applied' | 'approved']: RecordDateField
    } = {
      applied: 'appliedDate',
      approved: 'approvalDate'
    }
    const groupedRecords = await groupByYear(records, statusMapping[status])
    const cities = Array.from(new Set(records.map((record) => record.city)))
    const data = []
    for (const year in groupedRecords) {
      const yearData: {
        year: string,
        data: {
          [key: string]: {
            [key in BuildingType | 'total']: number
          }
        }
      } = { year, data: {} }
      for (const city of cities) {
        yearData.data[city] = {
          'single-family residential': 0,
          'multi-family residential': 0,
          'townhouse': 0,
          'mixed-use': 0,
          'commercial': 0,
          'industrial': 0,
          'other': 0,
          'total': 0
        }
        for (const record of groupedRecords[year]) {
          if (record.buildingType && record.city === city && record.status === status) {
            yearData.data[city][record.buildingType]++
            yearData.data[city]['total']++
          }
        }
      }
      data.push(yearData)
    }
    return { data }
  }

}

type RecordDateField = 'appliedDate' | 'publicHearingDate' | 'approvalDate' | 'denialDate' | 'withdrawnDate'

// Groups records by year in chronological order with any empty years in between filled in with empty values
// Use the field record.dates[dateField] to get the date value, string in YYYY-MM-DD format, account for potential null values
async function groupByYear(records: FullRecord[], dateField: RecordDateField) {
  const years = records.map((record) => record.dates[dateField]?.split('-')[0]).filter((year) => year !== undefined) as string[]
  const minYear = Math.min(...years.map((year) => parseInt(year)))
  const maxYear = Math.max(...years.map((year) => parseInt(year)))
  const groupedRecords: { [key: string]: FullRecord[] } = {}
  for (let year = minYear; year <= maxYear; year++) {
    groupedRecords[year.toString()] = records.filter((record) => record.dates[dateField]?.split('-')[0] === year.toString())
  }
  return groupedRecords
}
