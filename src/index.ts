import express from 'express'
import 'dotenv/config'

const app = express()
const port = process.env.PORT || 3000

app.get('/ping', async (req, res) => {
  res.send({
    data: 'Hello world',
    date: new Date()
  })
})

app.get('/api/v1/news', async (req, res) => {
  res.send({

  })
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
