# Gridview Analytics - API

This repository is for the protype version of Gridview Analytics. The main purpose is to hold a SQLite database that will not only hold the schema but the data I analyze from city councils meetings for a select few cities.

The API it self will be a simple Node and Express server.

Notion research documentation: https://www.notion.so/albertkim1/Gridview-Analytics-ffbe17da843540ccab11eeb0eff0f295

# Architecture

- Node.js
- Express
- Sqlite3

# API

### GET all news articles

`GET /api/v1/news`

Filters
```
{
  city?: string
  limit?: number
  offset?: number
}
```

Response
```
{
  limit: number
  offset: number
  data: News[]
}
```

News
```
{
  title: string
  date: string
  summary: string
  sentiment: string
  meetingType: string
  links: [
    {
      title: string
      url: string
      summary?: string
    }
  ]
}
```

# Build
```
# Local
yarn install
yarn run build
yarn start

# Docker
docker build -t gridview-analytics-api .
docker run -dp 127.0.0.1:3000:80 gridview-analytics-api
```
