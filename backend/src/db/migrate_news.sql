CREATE TABLE IF NOT EXISTS news_posts (
  id           SERIAL PRIMARY KEY,
  title        TEXT NOT NULL,
  body         TEXT,
  image_path   TEXT,
  publish_at   TIMESTAMPTZ DEFAULT NOW(),
  created_by   INTEGER REFERENCES users(id) ON DELETE SET NULL,
  org_unit_id  INTEGER REFERENCES org_units(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
GRANT ALL ON news_posts TO bataljon;
GRANT USAGE, SELECT ON SEQUENCE news_posts_id_seq TO bataljon;
