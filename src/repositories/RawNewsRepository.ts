import fs from 'fs'
import path from 'path'
import moment from 'moment'
import { IRawNews } from '@/models/News'

function reorderItems(items: IRawNews[]) {
  return items.sort((a, b) => {
    const dateA = moment(a.date, 'YYYY-MM-DD')
    const dateB = moment(b.date, 'YYYY-MM-DD')
    
    if (dateA.isBefore(dateB)) {
      return 1
    }
    if (dateA.isAfter(dateB)) {
      return -1
    }
    return 0
  })
}

const databaseFilePath = path.join(__dirname, '../../database/raw-news.json')

export const RawNewsRepository = {

  getNews(filter: {city?: string, startDate?: string, endDate?: string, limit?: number, offset?: number}) {
    
    const rawData = JSON.parse(fs.readFileSync(databaseFilePath, 'utf8')) as IRawNews[]

    let filteredData: IRawNews[] = rawData

    if (filter?.startDate) {
      filteredData = filteredData.filter((item) => moment(item.date).isSameOrAfter(filter.startDate))
    }

    if (filter?.endDate) {
      filteredData = filteredData.filter((item) => moment(item.date).isBefore(filter.endDate))
    }

    if (filter?.limit) {
      filteredData = filteredData.slice(0, filter.limit)
    }

    if (filter?.offset) {
      filteredData = filteredData.slice(filter.offset)
    }

    if (filter?.city) {
      filteredData = filteredData.filter((item) => item.city === filter.city)
    }

    return {
      offset: filter.offset,
      limit: filter.limit,
      total: rawData.length,
      data: filteredData
    }

  },

  getLatestDate(city: string) {
    const news = this.getNews({city: city})
    if (news.length > 0) {
      return news[0].date
    } else {
      return null
    }
  },

  // Replaces all news with the same city
  dangerouslyUpdateNews(city: string, news: IRawNews[], dateOptions?: {startDate: string, endDate: string}) {
    const previousEntries = this.getNews()
    // Remove all entries with the same city and are in the date range if specified
    const filteredData = previousEntries.filter((item) => {
      const isCityMatching = item.city === city
      let isInDateRange = true
      if (dateOptions) {
        isInDateRange = moment(item.date).isBetween(moment(dateOptions.startDate), moment(dateOptions.endDate))
      }
      return !(isCityMatching && isInDateRange)
    })
    const orderedData = reorderItems([...filteredData, ...news])
    fs.writeFileSync(
      databaseFilePath,
      JSON.stringify(orderedData, null, 2),
      'utf8'
    )
  },

  // Add news to the database but ignore ones with the same city/date/meeting type
  upsertNews(news: IRawNews[]) {
    const previousEntries = this.getNews()
    const onlyNewEntries = news.filter((item) => {
      const matchingPreviousEntry = previousEntries.find((entry) => {
        const sameCity = entry.city === item.city
        const sameDate = entry.date === item.date
        const sameMeetingType = entry.meetingType === item.meetingType
        return sameCity && sameDate && sameMeetingType
      })
      return matchingPreviousEntry ? false : true
    })
    const orderedData = reorderItems([...previousEntries, ...onlyNewEntries])
    fs.writeFileSync(
      databaseFilePath,
      JSON.stringify(orderedData, null, 2),
      'utf8'
    )
  },

  // Replaces all news
  dangerouslyUpdateAllNews(news: IRawNews[]) {
    const orderedMeetingDetails = reorderItems(news)
    fs.writeFileSync(
      databaseFilePath,
      JSON.stringify(orderedMeetingDetails, null, 2),
      'utf8'
    )
    return this.getNews()
  }

}
