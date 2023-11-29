module.exports = {

  development: {
    client: 'sqlite3',
    connection: {
      filename: './database/database.db'
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
      tableName: 'knex_migrations'
    },
    useNullAsDefault: true
  }

};
