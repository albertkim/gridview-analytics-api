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

export interface IFullRecordDetail {
  id: string
  city: string
  metroCity: string | null
  applicationId: string | null
  address: string
  applicant: string | null
  behalf: string | null
  description: string
  type: 'rezoning' | 'development permit'
  buildingType: ZoningType | null
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
  reportUrls: {
    title: string
    url: string
    date: string
    status: ZoningStatus
  }[]
  minutesUrls: {
    url: string
    date: string
    status: ZoningStatus
  }[]
  createDate: string
  updateDate: string
}