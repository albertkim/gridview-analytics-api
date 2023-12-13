-- Re-create a table

-- Temporarily remove foreign key constraints from the 'news_links' table
-- (Assuming SQLite version is 3.6.19 or later, which supports foreign key pragma)
PRAGMA foreign_keys=off;

-- Create a new table with an additional 'createdate' column
CREATE TABLE new_news (
  id INTEGER PRIMARY KEY,
  title TEXT,
  summary TEXT,
  meeting_type TEXT,
  sentiment TEXT,
  date DATE,
  createdate DATETIME DEFAULT CURRENT_TIMESTAMP,
  city_id INTEGER REFERENCES cities(id),
  important INTEGER
);

-- Copy data from the old 'news' table to the new 'new_news' table
INSERT INTO new_news (id, title, summary, meeting_type, sentiment, date, city_id)
SELECT id, title, summary, meeting_type, sentiment, date, city_id FROM news;

-- Drop the old 'news' table
DROP TABLE news;

-- Rename the new table to 'news'
ALTER TABLE new_news RENAME TO news;

-- Re-enable foreign key constraints
PRAGMA foreign_keys=on;
