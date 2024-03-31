import { Router, Request, Response, NextFunction } from 'express'
import { AnalyticsService } from '@/services/analytics'

const router = Router()

router.get('/api/v1/analytics/buildingType', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const typeParam = req.query.type as 'rezoning' | 'development permit'
    const dateParam = req.query.date as 'applied' | 'approved'
    const data = await AnalyticsService.analyticsByBuildingType(typeParam, dateParam)
    res.send(data)
  } catch (error) {
    next(error)
  }
})

export const AnalyticsController = router
