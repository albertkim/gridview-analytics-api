import express, { ErrorRequestHandler } from 'express'
import cors from 'cors'
import { BaseController } from '@/controllers/BaseController'
import { AdminController } from '@/controllers/AdminController'
import { NewsController } from '@/controllers/NewsController'
import { AnalyticsController } from './controllers/AnalyticsController'

const app = express()

// Allow requests from all origins (change in the future for security)
app.use(cors())

// Allow Express to parse json request bodies
// Crazy that this is not a default setting
app.use(express.json())

app.use(BaseController)
app.use(NewsController)
app.use(AnalyticsController)

if (process.env.NODE_ENV === 'development') {
  app.use(AdminController)
}

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

export const App = app
