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

When developing, the file structure looks like this:

Root
- /database
- /src
- /dist
- package.json

During the production deployment process, we move the contents of the /dist folder into a new folder that becomes the deploy folder.

Package (new root)
- /database
- (contents of /dist)
- package.json

During this process, we also remove the `canvas` npm package due to its size. Not needed in production, and the code checks for its availability at runtime so that it does not error out.

Shifting the file directory structure in the new Package folder means that all the relative paths that use the @ module alias or references the /database folder will be incorrect. These are fixed with the following:

- `sed -i 's/"@": "\.\/dist"/"@": "\.\/"/g' package.json` inside `lambda-prod-deploy.yml`, which shifts the @ module alias directory.
- `getDatabasePath(filename: string)` function in the `DatabaseUtilities.ts` file, which checks NODE_ENV and adjusts the path accordingly.

These approaches will not be necessary once the SQLite database is moved out into it's own remote instance. But for now it is sufficient.

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
