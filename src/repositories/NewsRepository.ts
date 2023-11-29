import knex from './database'

interface INewsFilter {
  offset?: number
  limit?: number
  city?: string
}

interface INewsObject {
  id: number
  title: string
  summary: string | null
  meeting_type: string
  city_id: number
  city_name: string
  date: string
}

interface ILinkObject {
  id: number
  title: string
  url: string
  summary: string | null
  news_id: number
}

interface INews {
  id: number
  title: string
  summary: string | null
  meetingType: string
  cityId: number
  cityName: string
  date: string
  links: Array<{
    id: number
    title: string
    summary: string | null
  }>
}

export const NewsRepository = {

  async getNews(filter: INewsFilter) {
    const newsObject: INewsObject[] = await knex('news')
      .leftJoin('cities', 'cities.id', 'news.city_id')
      .select('news.*', 'cities.name as city_name')
      .orderBy('date', 'desc')

    const newsIds = newsObject.map((n) => n.id)

    const linkObjects: ILinkObject[] = await knex('news_links').whereIn('news_id', newsIds)

    const news: INews[] = newsObject.map((n) => {
      return {
        id: n.id,
        title: n.title,
        summary: n.summary,
        meetingType: n.meeting_type,
        cityId: n.city_id,
        cityName: n.city_name,
        date: n.date,
        links: linkObjects.filter((l) => l.news_id === n.id).map((l) => {
          return {
            id: l.id,
            title: l.title,
            summary: l.summary
          }
        })
      }
    })

    return news
  }

}
