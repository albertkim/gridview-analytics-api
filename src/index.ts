import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express'
import { NewsRepository } from './repositories/NewsRepository'
import knex from './repositories/database'
import cors from 'cors'
import 'dotenv/config'
import 'source-map-support/register'
import createHttpError from 'http-errors'

// Run knex database migrations
async function runMigrations() {
  console.log('Checking database migrations...')
  try {
    const [batchNo, log] = await knex.migrate.latest()
    if (log.length === 0) {
      console.log('No migrations were needed.')
    } else {
      console.log(`Migrations were run. Batch number: ${batchNo}. Migrated:`, log)
    }
  } catch (error) {
    console.error('Migrations failed:', error)
    process.exit(1)
  }
}

// Start the API server
async function startServer() {

  const app = express()
  const port = process.env.PORT || 3000

  // Allow requests from all origins (will have to change in the future for security)
  app.use(cors())

  // Allow Express to parse json request bodies
  // Crazy that this is not a default setting
  app.use(express.json())

  app.get('/ping', async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.send({
        data: 'Hello world',
        date: new Date()
      })
    } catch (error) {
      next(error)
    }
  })

  app.get('/api/v1/news', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rawLimit = req.query.limit as string | undefined
      const rawOffset = req.query.offset as string | undefined
      const rawCity = req.query.city as string | undefined
      const limit = rawLimit ? parseInt(rawLimit) : 10
      const offset = rawOffset ? parseInt(rawOffset) : 0
      const city = rawCity || null
      const news = await NewsRepository.getNews({
        offset: offset,
        limit: limit,
        city: city
      })
      res.send(news)
    } catch (error) {
      next(error)
    }
  })

  app.post('/api/v1/admin/news', async (req: Request, res: Response, next: NextFunction) => {

    try {
      const createNewsObject = req.body
  
      if (!createNewsObject) {
        res.statusMessage = 'Empty body'
        res.status(400).end()
      }
  
      // News summary can be empty
      const noNewsEmptyFields = ['title', 'meetingType', 'cityId', 'date', 'sentiment']
  
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

  // Error handling middleware
  const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
    console.error(error)
    if (error.status && error.message) {
      res.status(error.status).send({ error: error.message })
    } else {
      res.status(500).send({ error: 'Internal Server Error' })
    }
  }

  app.use(errorHandler)

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
  })

}

async function initialize() {
  await runMigrations()
  startServer()
}

// Run the functions
initialize()
