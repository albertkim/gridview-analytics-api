import 'dotenv/config'
import 'source-map-support/register'
import knex from './repositories/database'
import { App } from './App'

const port = process.env.PORT || 3000

console.log(`NODE_ENV: ${process.env.NODE_ENV}`)

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

  const app = App

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
