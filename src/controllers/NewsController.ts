import createHttpError from 'http-errors'
import moment from 'moment'
import { Router, Request, Response, NextFunction } from 'express'
import { NewsRepository } from '@/repositories/NewsRepository'
import { RawNewsRepository } from '@/repositories/RawNewsRepository'
import { analyzeRawNews } from '@/services/analyze-raw-news'
import { IRawNews } from '@/models/News'

const router = Router()

router.get('/api/v1/news/raw', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawNews = await RawNewsRepository.getNews({
      startDate: moment().subtract(2, 'months').format('YYYY-MM-DD')
    })
    res.send(rawNews)
  } catch (error) {
    next(error)
  }
})

router.post('/api/v1/news/raw/analyze', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawNews = req.body as IRawNews
    const analyzedNews = await analyzeRawNews(rawNews)
    res.send(analyzedNews)
  } catch (error) {
    next(error)
  }
})

router.get('/api/v1/news/:newsId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newsIdParam = req.params.newsId
    if (!newsIdParam) {
      throw createHttpError(400, `newsId must be a number`)
    }
    const newsId = parseInt(newsIdParam)
    const news = await NewsRepository.getNewsById(newsId)
    res.send(news)
  } catch (error) {
    next(error)
  }
})

router.get('/api/v1/news', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawLimit = req.query.limit as string | undefined
    const rawOffset = req.query.offset as string | undefined
    const rawCity = req.query.city as string | undefined
    const rawImportant = req.query.important as string | undefined
    const limit = rawLimit ? parseInt(rawLimit) : 10
    const offset = rawOffset ? parseInt(rawOffset) : 0
    const city: string[] | string | null = rawCity || null
    const important = rawImportant ? parseInt(rawImportant) : null
    const news = await NewsRepository.getNews({
      offset: offset,
      limit: limit,
      city: city,
      important: important
    })
    res.send(news)
  } catch (error) {
    next(error)
  }
})

export const NewsController = router
