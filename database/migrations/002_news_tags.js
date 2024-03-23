exports.up = async function(knex) {

  // Remove the news 'sentiment' column
  await knex.raw(`
    ALTER TABLE news DROP COLUMN sentiment;
  `)

  // Add the news tag table with a foreign key to the news table
  // Start using the unique column id strategy
  await knex.raw(`
    CREATE TABLE news_tags (
      tag_id INTEGER PRIMARY KEY,
      news_id INTEGER REFERENCES news(id),
      tag_name TEXT
    );
  `)

}

exports.down = async function(knex) {

}
