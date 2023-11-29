import knex from './database'

interface INewsFilter {
  offset?: number
  limit?: number
  city?: string
}

interface INewsObject {
  id: number
  title: string
  summary: string
  meeting_type: string
  city_id: number
  city_name: string
}

export const NewsRepository = {

  async getNews(filter: INewsFilter) {
    const newsObject: INewsObject = await knex('news')
      .leftJoin('cities', 'cities.id', 'news.city_id')
      .select('news.*', 'cities.name as city_name')
    return newsObject
  }

}
