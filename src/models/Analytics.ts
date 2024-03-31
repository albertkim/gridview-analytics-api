import { BuildingType } from './Records'

export interface IBuildingTypeAnalytics {
  cityData: IBuildingTypeAnalyticsCityEntry[]
}

export interface IBuildingTypeAnalyticsCityEntry {
  city: {
    cityName: string
  }
  yearData: IBuildingTypeAnalyticsYearEntry[]
}

export interface IBuildingTypeAnalyticsYearEntry {
  year: string // 'YYYY-MM-DD'
  buildingTypeData: {
    [key in BuildingType]: number
  }
}
