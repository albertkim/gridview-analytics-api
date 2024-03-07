import { IFullRecordDetail } from '../models/Records'
import './rezonings.json'

interface IRecordsFilter {
  city: string[] | string | null
}

export const RecordsRepository = {

  async getRezonings(filter: IRecordsFilter) {

    const rezonings: IFullRecordDetail[] = require('./rezonings.json')
    const filteredRezonings = rezonings
      .filter((rezonings) => {
        return rezonings.type === 'rezoning'
      })
      .filter((rezoning) => {
        if (filter.city) {
          if (Array.isArray(filter.city)) {
            return filter.city.includes(rezoning.city)
          } else {
            return rezoning.city === filter.city
          }
        } else {
          return true
        }
      })

    return {
      total: filteredRezonings.length,
      data: filteredRezonings
    }

  },

  async getDevelopmentPermits(filter: IRecordsFilter) {

    const rezonings: IFullRecordDetail[] = require('./rezonings.json')
    const filteredRezonings = rezonings
      .filter((rezonings) => {
        return rezonings.type === 'development permit'
      })
      .filter((rezoning) => {
        if (filter.city) {
          if (Array.isArray(filter.city)) {
            return filter.city.includes(rezoning.city)
          } else {
            return rezoning.city === filter.city
          }
        } else {
          return true
        }
      })
    return {
      total: filteredRezonings.length,
      data: filteredRezonings
    }

  }

}
