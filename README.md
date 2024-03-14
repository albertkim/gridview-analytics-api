# Gridview Analytics - API

This repository is for the protype version of Gridview Analytics. The main purpose is to hold a SQLite database that will not only hold the schema but the data I analyze from city councils meetings for a select few cities.

The API it self will be a simple Node and Express server. The database is a mix of a local Sqlite `database.db` file and static json files.

Notion product research documentation: https://www.notion.so/albertkim1/Gridview-Analytics-ffbe17da843540ccab11eeb0eff0f295

# Getting started

I use Macbook M series laptops for development. Pre-requisites:

- Install git
- Install Node LTS
- Install yarn globally
- Install Python 3+ and add to system PATH
- Install XCode command line tools or XCode fully
- Run: brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman

Then, you need to set up your environment variables. The expected environment variables are:

```
NODE_ENV (recommended development)
PORT (recommended 3001)
CHAT_GPT_API_KEY (get from OpenAI developer page)
GOOGLE_APPLICATION_CREDENTIALS (google cloud json file absolute directory)
GOOGLE_MAPS_API_KEY (get from Google Cloud maps page)
```

# Deployments

Log into the AWS console (ask Lisa for URL, hosted on us-west-2)

Currently deployed on AWS Lambda (see `.github/workflows/lambda-prod-deploy.yml` file)

# API (work in progress)

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

`GET /api/v1/rezonings`

Response
```
{
  total: number
  data: IFullRezoningDetail[]
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
