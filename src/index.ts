import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express'
import { NewsRepository } from './repositories/NewsRepository'
import knex from './repositories/database'
import cors from 'cors'
import 'dotenv/config'

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

  app.get('/ping', async (req: Request, res: Response) => {
    res.send({
      data: 'Hello world',
      date: new Date()
    })
  })

  app.get('/api/v1/news', async (req: Request, res: Response) => {
    const news = await NewsRepository.getNews({
      offset: 0,
      limit: 10
    })
    res.send(news)
  })

  // Error handling middleware
  const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
    console.error(error)
    res.status(500).send(error.message)
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

// Properly handle shutdown
async function shutdown() {
  console.log('Shutting down the server...')
  await knex.destroy()
  process.exit(0)
}

// Handle shutdown signals
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
