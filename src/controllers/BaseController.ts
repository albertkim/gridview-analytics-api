import createHttpError from 'http-errors'
import { Router, Request, Response, NextFunction } from 'express'
import { NewsRepository } from '../repositories/NewsRepository'
import { RecordsRepository } from '../repositories/RecordsRepository'
import { RawNewsRepository } from '../repositories/RawNewsRepository'

const router = Router()

const recordsRepository = new RecordsRepository('final')

router.get('/ping', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.send({
      data: 'Hello world',
      date: new Date()
    })
  } catch (error) {
    next(error)
  }
})

router.get('/api/v1/news/raw', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawNews = await RawNewsRepository.getNews()
    res.send(rawNews)
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

// TODO: Add authentication when ready
router.get('/api/v1/rezonings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawCity = req.query.city as string | undefined
    const city: string[] | string | null = rawCity || null
    const rezonings = await recordsRepository.getRecords('rezoning', {
      city: city
    })
    res.send(rezonings)
  } catch (error) {
    next(error)
  }
})

// TODO: Add authentication when ready
router.get('/api/v1/developmentPermits', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawCity = req.query.city as string | undefined
    const city: string[] | string | null = rawCity || null
    const developmentPermits = await recordsRepository.getRecords('development permit', {
      city: city
    })
    res.send(developmentPermits)
  } catch (error) {
    next(error)
  }
})

export const BaseController = router
