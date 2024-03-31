import { Router, Request, Response, NextFunction } from 'express'
import { RecordsRepository } from '@/repositories/RecordsRepository'

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

router.get('/api/v1/records/rezonings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawCity = req.query.city as string | undefined
    const city: string[] | string | null = rawCity || null
    const rezonings = await recordsRepository.getRecords('rezoning', {
      city: city
    })
    const simplifiedRezonings = rezonings.data.map((rezoning) => {
      return {
        id: rezoning.id,
        address: rezoning.address,
        city: rezoning.city,
        metroCity: rezoning.metroCity,
        location: rezoning.location,
        buildingType: rezoning.buildingType,
        stats: rezoning.stats,
        status: rezoning.status,
        lastUpdateDate: rezoning.lastUpdateDate
      }
    })
    res.send({
      data: simplifiedRezonings,
      total: rezonings.total,
      limit: rezonings.limit,
      offset: rezonings.offset
    })
  } catch (error) {
    next(error)
  }
})

router.get('/api/v1/records/development-permits', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawCity = req.query.city as string | undefined
    const city: string[] | string | null = rawCity || null
    const rezonings = await recordsRepository.getRecords('development permit', {
      city: city
    })
    const simplifiedRezonings = rezonings.data.map((rezoning) => {
      return {
        id: rezoning.id,
        address: rezoning.address,
        city: rezoning.city,
        metroCity: rezoning.metroCity,
        location: rezoning.location,
        buildingType: rezoning.buildingType,
        stats: rezoning.stats,
        status: rezoning.status,
        lastUpdateDate: rezoning.lastUpdateDate
      }
    })
    res.send({
      data: simplifiedRezonings,
      total: rezonings.total,
      limit: rezonings.limit,
      offset: rezonings.offset
    })
  } catch (error) {
    next(error)
  }
})

router.get('/api/v1/records/:recordId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recordId = req.params.recordId
    const rezoning = await recordsRepository.getRecords('all', {
      id: recordId
    })
    if (rezoning.data.length === 0) {
      res.status(404).send({
        error: 'Record not found'
      })
      return
    } else {
      const record = rezoning.data[0]
      res.send(record)
    }
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
