import { Router, Request, Response, NextFunction } from 'express'
import { NewsRepository } from '@/repositories/NewsRepository'
import { chatGPTTextQuery } from '@/utilities/AIUtilities'
import createHttpError from 'http-errors'

const router = Router()

router.post('/api/v1/admin/news', async (req: Request, res: Response, next: NextFunction) => {

  try {
    const createNewsObject = req.body

    if (!createNewsObject) {
      res.statusMessage = 'Empty body'
      res.status(400).end()
    }

    // News summary can be empty
    const noNewsEmptyFields = ['title', 'meetingType', 'cityId', 'date', 'sentiment', 'important']

    // Link summary can be empty
    const noLinkEmptyFields = ['title', 'url']

    noNewsEmptyFields.forEach((n) => {
      if (!createNewsObject[n]) {
        throw createHttpError(400, `${n} cannot be empty in news object`)
      }
    })

    if (!createNewsObject.links) {
      throw createHttpError(400, `links must be an array in news object`)
    }

    createNewsObject.links.forEach((link: any) => {
      noLinkEmptyFields.forEach((n) => {
        if (!link[n]) {
          throw createHttpError(400, `${n} cannot be empty in link object`)
        }
      })
    })

    const news = await NewsRepository.addNews(createNewsObject)
    res.send(news)
  } catch (error) {
    next(error)
  }

})

router.put('/api/v1/admin/news/:newsId', async (req: Request, res: Response, next: NextFunction) => {

  try {

    const rawNewsId = req.params.newsId as string | undefined
    if (!rawNewsId) {
      throw createHttpError(400, 'News ID required')
    }

    const newsId = parseInt(rawNewsId)

    const updateNewsObject = req.body

    if (!updateNewsObject) {
      res.statusMessage = 'Empty body'
      res.status(400).end()
    }

    // News summary can be empty
    const noNewsEmptyFields = ['id', 'title', 'meetingType', 'cityId', 'date', 'sentiment', 'important']

    // Link summary can be empty
    // Link IDs are not necessary, all entries are re-created in database
    const noLinkEmptyFields = ['title', 'url']

    noNewsEmptyFields.forEach((n) => {
      if (!updateNewsObject[n]) {
        throw createHttpError(400, `${n} cannot be empty in news object`)
      }
    })

    if (!updateNewsObject.links) {
      throw createHttpError(400, `links must be an array in news object`)
    }

    updateNewsObject.links.forEach((link: any) => {
      noLinkEmptyFields.forEach((n) => {
        if (!link[n]) {
          throw createHttpError(400, `${n} cannot be empty in link object`)
        }
      })
    })

    const updatedNews = await NewsRepository.updateNews(newsId, updateNewsObject)

    res.send(updatedNews)

  } catch (error) {
    next(error)
  }

})

router.delete('/api/v1/admin/news/:newsId', async (req: Request, res: Response, next: NextFunction) => {

  try {

    const rawNewsId = req.params.newsId as string | undefined

    if (!rawNewsId) {
      throw createHttpError(400, 'News ID required')
    }

    const newsId = parseInt(rawNewsId)

    await NewsRepository.deleteNews(newsId)

    res.send()

  } catch (error) {
    next(error)
  }

})

router.post('/api/v1/admin/news/summarize', async (req: Request, res: Response, next: NextFunction) => {

  try {

    const contents = req.body.contents as string | undefined

    if (!contents) {
      throw createHttpError(400, 'Contents required')
    }

    const query = `
      You are a news article summarizing the provided document, crafted for mostly city policy and real estate professionals. Replace the original document by providing an immediate and direct overview of the key points, without referring to yourself as a separate entity. Include specifics and practical details that real estate agents would find useful. Begin with a succinct 1-2 sentence introduction, followed by bullet points for detailed information. Try to keep the number of bullet points between 3-5 if possible. Clearly indicate the current stage of each legislative item, including relevant dates.

      ${contents}
    `

    const response = await chatGPTTextQuery(query)

    res.send({ summary: response })

  } catch (error) {
    next(error)
  }

})

export const AdminController = router
