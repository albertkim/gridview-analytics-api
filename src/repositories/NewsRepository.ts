import createHttpError from 'http-errors'
import knex from './database'
import { ILinkObject, INews, INewsObject, ICreateNews, IUpdateNews } from '../models/News'

export interface INewsFilter {
  offset: number | null
  limit: number | null
  city: string[] | string | null
  important: number | null
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
      createDate: newsObject.create_date,
      sentiment: newsObject.sentiment,
      important: newsObject.important,
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
        if (Array.isArray(filter.city)) {
          query.whereIn('cities.name', filter.city)
        } else {
          query.where('cities.name', filter.city)
        }
      }
      if (filter.important) {
        query.where('news.important', '>', filter.important)
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
        createDate: n.create_date,
        important: n.important,
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
      sentiment: createNews.sentiment,
      important: createNews.important
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

  async updateNews(newsId: number, updateObject: IUpdateNews) {

    // Update news parent object first
    await knex('news')
      .where('id', newsId)
      .update({
        title: updateObject.title,
        summary: updateObject.summary,
        meeting_type: updateObject.meetingType,
        city_id: updateObject.cityId,
        date: updateObject.date,
        sentiment: updateObject.sentiment,
        important: updateObject.important
      })

    // Delete all links and re-create (to easily handle create, edit, and delete cases)
    await knex('news_links')
      .where('news_id', newsId)
      .delete()

    // Re-create each link
    for (const linkObject of updateObject.links) {
      await knex('news_links')
        .insert({
          title: linkObject.title,
          summary: linkObject.summary,
          url: linkObject.url,
          news_id: newsId
        })
    }

    return await this.getNewsById(newsId)

  },

  async deleteNews(newsId: number) {

    // Delete links first
    await knex('news_links')
      .where('news_id', newsId)
      .delete()

    // Then delete news
    await knex('news')
      .where('id', newsId)
      .delete()

  }

}
