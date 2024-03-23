export interface INewsObject {
  id: number
  title: string
  summary: string | null
  meeting_type: string
  city_id: number
  city_name: string
  date: string
  create_date: string
  important: number | null
}

export interface ILinkObject {
  id: number
  title: string
  url: string
  summary: string | null
  news_id: number
}

export interface INewsTagObject {
  tag_id: number
  news_id: number
  tag_name: string
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
  important: number | null // 0 - not important, 1 - locally important, 2 - globally important
  tags: string[]
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
  important: number | null
  tags: string[]
  links: Array<{
    title: string
    summary: string | null
    url: string
  }>
}

export interface IUpdateNews extends ICreateNews {
  id: number
}
