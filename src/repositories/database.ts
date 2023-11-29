import knex from 'knex'

const config = {

  development: {
    client: 'sqlite3',
    connection: {
      filename: './database/database.db'
    },
    migrations: {
      directory: './database/migrations',
      tableName: 'knex_migrations'
    },
    useNullAsDefault: true
  },

  production: {
    client: 'postgresql',
    connection: {
      filename: './database/database.db'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './database/migrations',
      tableName: 'knex_migrations'
    },
    useNullAsDefault: true
  }

}

const environment = process.env.NODE_ENV as 'development' | 'production' || 'development'
const dbConfig = config[environment]
const db = knex(dbConfig)

db.raw('PRAGMA foreign_keys = ON;').then(() => {
  console.log('SQLite3 Foreign key enforcement is enabled.')
})

export default db
