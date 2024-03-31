import { Router, Request, Response, NextFunction } from 'express'
import { AnalyticsService } from '@/services/analytics'

const router = Router()

router.get('/api/v1/analytics/buildingType', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await AnalyticsService.analysisByBuildingType('rezoning', 'applied')
    res.send(data)
  } catch (error) {
    next(error)
  }
})

export const AnalyticsController = router
