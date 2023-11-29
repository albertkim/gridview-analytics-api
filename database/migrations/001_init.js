exports.up = async function(knex) {

  await knex.raw(`
    CREATE TABLE countries (
      id INTEGER PRIMARY KEY,
      name TEXT
    );
  `)

  await knex.raw(`
    CREATE TABLE cities (
      id INTEGER PRIMARY KEY,
      country_id INTEGER REFERENCES countries(id),
      name TEXT
    );
  `)

  await knex.raw(`
    CREATE TABLE city_metrics (
      id INTEGER PRIMARY KEY,
      type TEXT,
      year INTEGER,
      value INTEGER,
      source TEXT,
      city_id INTEGER REFERENCES cities(id)
    );
  `)

  await knex.raw(`
    CREATE TABLE news (
      id INTEGER PRIMARY KEY,
      title TEXT,
      summary TEXT,
      meeting_type TEXT,
      sentiment TEXT,
      date DATE,
      city_id INTEGER REFERENCES cities(id)
    );
  `)

  await knex.raw(`
    CREATE TABLE news_links (
      id INTEGER PRIMARY KEY,
      title TEXT,
      summary TEXT,
      url TEXT,
      news_id INTEGER REFERENCES news(id)
    );
  `)

  await knex.raw(`
    -- Politician schema
    CREATE TABLE politicians (
      id INTEGER PRIMARY KEY,
      full_name TEXT,
      election_date DATE,
      next_election_date DATE,
      party_name TEXT,
      city_id INTEGER REFERENCES cities(id)
    );
  `)

}

exports.down = async function(knex) {

}
