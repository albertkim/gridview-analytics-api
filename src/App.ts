import express, { ErrorRequestHandler } from 'express'
import cors from 'cors'
import { BaseController } from './BaseController'
import { AdminController } from './AdminController'

const app = express()

// Allow requests from all origins (will have to change in the future for security)
app.use(cors())

// Allow Express to parse json request bodies
// Crazy that this is not a default setting
app.use(express.json())

app.use(BaseController)
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
