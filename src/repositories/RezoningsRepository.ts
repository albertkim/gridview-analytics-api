import './rezonings.json'

interface IRezoningsFilter {
  city: string[] | string | null
}

export type ZoningType =
  'single-family residential' |
  'townhouse' |
  'mixed-use' |
  'multi-family residential' |
  'industrial' |
  'commercial'

export type ZoningStatus =
  'applied' |
  'pending' |
  'public hearing' |
  'approved' |
  'denied' |
  'withdrawn'

export interface IRezoningDetail {
  city: string
  metroCity: string | null
  rezoningId: string | null
  address: string
  applicant: string | null
  behalf: string | null
  description: string
  type: ZoningType | null
  stats: {
    buildings: number | null
    stratas: number | null
    rentals: number | null
    hotels: number | null
    fsr: number | null
    height: number | null
  }
  zoning: {
    previousZoningCode: string | null
    previousZoningDescription: string | null
    newZoningCode: string | null
    newZoningDescription: string | null
  }
  status: ZoningStatus
  dates: {
    appliedDate: string | null
    publicHearingDate: string | null
    approvalDate: string | null
    denialDate: string | null
    withdrawnDate: string | null
  }
  urls: {
    title: string
    url: string
    date: string
  }[]
  minutesUrls: {
    url: string
    date: string
  }[]
  createDate: string
  updateDate: string
}

export const RezoningsRepository = {

  async getRezonings(filter: IRezoningsFilter) {

    const rezonings: IRezoningDetail[] = require('./rezonings.json')
    const filteredRezonings = rezonings.filter((rezoning) => {
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
