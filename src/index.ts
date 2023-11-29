import { express, Request, Response } from 'express'
import knex from './database'
import 'dotenv/config'

const app = express()
const port = process.env.PORT || 3000

app.get('/ping', async (req: Request, res: Response) => {
  res.send({
    data: 'Hello world',
    date: new Date()
  })
})

app.get('/api/v1/news', async (req: Request, res: Response) => {
  const news = await knex('news')
  res.send({
    data: news
  })
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
