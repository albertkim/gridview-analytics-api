-- Countries schema
CREATE TABLE countries (
  id INTEGER PRIMARY KEY
);

-- Cities schema
CREATE TABLE cities (
  id INTEGER PRIMARY KEY,
  country_id INTEGER REFERENCES countries(id),
  name TEXT
);

-- City metrics
CREATE TABLE city_metrics (
  id INTEGER PRIMARY KEY,
  type TEXT
);

-- Politician schema
CREATE TABLE politicians (
  id INTEGER PRIMARY KEY,
  full_name TEXT,
  election_date DATE,
  party_name TEXT,
  public_salary INTEGER,
  public_salary_currency TEXT
);

-- Address (but somehow handle land assemblies and subdivisions)
CREATE TABLE addresses (
  id INTEGER PRIMARY KEY,
  full_address TEXT
);

-- Building application
CREATE TABLE building_applications (
  id INTEGER PRIMARY KEY,
  applicant_name TEXT,
  address INTEGER REFERENCES addresses(id),
  summary TEXT,
  date_submitted DATE,
  date_updated DATE,
  date_approved DATE,
  status TEXT
);

-- City updates (aka city council meetings)
CREATE TABLE city_updates (
  id INTEGER PRIMARY KEY,
  meeting_date DATE,

);

-- City votes
CREATE TABLE city_votes (
  id INTEGER PRIMARY KEY,
  title TEXT,
  description TEXT,
  type TEXT,
  vote_result TEXT
);

CREATE TABLE city_vote_politicians (
  city_vote_id INTEGER REFERENCES city_votes(id),
  politician_id INTEGER REFERENCES politicians(id),
  PRIMARY KEY (city_vote_id, politician_id),
  vote_status TEXT
);
