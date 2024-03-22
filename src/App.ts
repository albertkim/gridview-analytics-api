import express, { ErrorRequestHandler } from 'express'
import cors from 'cors'
import serverless from 'serverless-http'
import { BaseController } from '@/controllers/BaseController'
import { AdminController } from '@/controllers/AdminController'
import { NewsController } from '@/controllers/NewsController'

const app = express()

// Run as serverless function in production
// Must use before any routes are defined, otherwise query parameters are null (reference: https://stackoverflow.com/questions/70890442/how-do-i-get-my-parameters-to-pass-from-serverless-to-my-express-router)
module.exports.handler = serverless(app)

// Allow requests from all origins (change in the future for security)
app.use(cors())

// Allow Express to parse json request bodies
// Crazy that this is not a default setting
app.use(express.json())

app.use(BaseController)
app.use(NewsController)

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
