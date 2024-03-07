export interface INewsObject {
  id: number
  title: string
  summary: string | null
  meeting_type: string
  city_id: number
  city_name: string
  date: string
  create_date: string
  sentiment: string | null
  important: number | null
}

export interface ILinkObject {
  id: number
  title: string
  url: string
  summary: string | null
  news_id: number
}

export interface IRawNews {
  city: string
  metroCity: string | null
  url: string
  date: string
  meetingType: string
  title: string
  resolutionId: string | null
  contents: string
  minutesUrl: string | null
  reportUrls: Array<{
    title: string
    url: string
  }>
}

export interface INews {
  id: number
  title: string
  summary: string | null
  meetingType: string
  cityId: number
  cityName: string
  date: string
  createDate: string | null
  sentiment: string | null
  important: number | null // 0 - not important, 1 - locally important, 2 - globally important
  links: Array<{
    id: number
    title: string
    summary: string | null
    url: string
  }>
}

export interface ICreateNews {
  title: string
  summary: string | null
  meetingType: string
  cityId: number
  cityName: string
  date: string
  sentiment: string | null
  important: number | null
  links: Array<{
    title: string
    summary: string | null
    url: string
  }>
}

export interface IUpdateNews extends ICreateNews {
  id: number
}
