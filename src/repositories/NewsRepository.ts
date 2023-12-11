import createHttpError from 'http-errors'
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

interface ICreateNews {
  title: string
  summary: string | null
  meetingType: string
  cityId: number
  cityName: string
  date: string
  sentiment: string | null
  links: Array<{
    title: string
    summary: string | null
    url: string
  }>
}

export const NewsRepository = {

  async getNewsById(id: number) {

    const query = knex('news')
      .leftJoin('cities', 'cities.id', 'news.city_id')
      .where('news.id', id)
      .select('news.*', 'cities.name as city_name')

    const newsObjects: INewsObject[] = await query

    if (newsObjects.length === 0) {
      throw createHttpError(404, `News with id ${id} does not exist`)
    }

    const newsObject = newsObjects[0]

    const linkObjects: ILinkObject[] = await knex('news_links')
      .where('news_id', newsObject.id)

    const news: INews = {
      id: newsObject.id,
      title: newsObject.title,
      summary: newsObject.summary,
      meetingType: newsObject.meeting_type,
      cityId: newsObject.city_id,
      cityName: newsObject.city_name,
      date: newsObject.date,
      sentiment: newsObject.sentiment,
      links: linkObjects.filter((l) => l.news_id === newsObject.id).map((l) => {
        return {
          id: l.id,
          title: l.title,
          summary: l.summary,
          url: l.url
        }
      })
    }

    return news

  },

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

  async addNews(createNews: ICreateNews) {

    const createdNewsObject = await knex('news').insert({
      title: createNews.title,
      summary: createNews.summary,
      meeting_type: createNews.meetingType,
      city_id: createNews.cityId,
      date: createNews.date,
      sentiment: createNews.sentiment
    })
    const createdNewsId = createdNewsObject[0]

    const createLinkObjects = createNews.links.map((link) => {
      return {
        title: link.title,
        summary: link.summary,
        url: link.url,
        news_id: createdNewsId
      }
    })

    await knex('news_links').insert(createLinkObjects)

    return await this.getNewsById(createdNewsId)

  },

  async updateNews(newsId: number, updateObject: INews) {

    const {links, ...newsObject} = updateObject

    // Update news parent object first
    await knex('news')
      .where('id', newsId)
      .update(newsObject)

    // Then update each link
    for (const linkObject of links) {
      await knex('links')
        .where('id', linkObject.id)
        .update(linkObject)
    }

    return await this.getNewsById(newsId)

  },

  async deleteNews(newsId: number) {

    // Delete links first
    await knex('links')
      .where('newsId', newsId)
      .delete()

    // Then delete news
    await knex('news')
      .where('id', newsId)
      .delete()

  }

}
