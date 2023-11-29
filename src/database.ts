import knex from 'knex'
const config = require('./knexfile') as any

const environment = process.env.NODE_ENV || 'development'
const dbConfig = config[environment]
const db = knex(dbConfig)

export default db
