import knex from './database'

interface INewsFilter {
  offset: number | null
  limit: number | null
  city: string | null
}

interface INewsObject {
  id: number
  title: string
  summary: string | null
  meeting_type: string
  city_id: number
  city_name: string
  date: string
  sentiment: string | null
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
  sentiment: string | null
  links: Array<{
    id: number
    title: string
    summary: string | null
    url: string
  }>
}

export const NewsRepository = {

  async getNews(filter: INewsFilter) {

    function baseNewsQuery() {
      const query = knex('news')
        .leftJoin('cities', 'cities.id', 'news.city_id')
        .orderBy('date', 'desc')
      
      if (filter.city) {
        query.where('cities.name', filter.city)
      }
      return query
    }

    const baseQuery = baseNewsQuery()
      .select('news.*', 'cities.name as city_name')
    if ((filter.limit !== null) && (filter.offset !== null)) {
      baseQuery.limit(filter.limit).offset(filter.offset)
    }

    const newsObject: INewsObject[] = await baseQuery
      

    const totalObject = await baseNewsQuery().count()
    const total = totalObject[0] ? totalObject[0]['count(*)'] : 0

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
        sentiment: n.sentiment,
        links: linkObjects.filter((l) => l.news_id === n.id).map((l) => {
          return {
            id: l.id,
            title: l.title,
            summary: l.summary,
            url: l.url
          }
        })
      }
    })

    return {
      offset: filter.offset,
      limit: filter.limit,
      total: total,
      data: news
    }

  },

  async addNews() {

  },

  async updateNews(updateObject: INews) {

  }

}
