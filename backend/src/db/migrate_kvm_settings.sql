CREATE TABLE IF NOT EXISTS kvm_settings (
  org_unit_id  INTEGER PRIMARY KEY REFERENCES org_units(id),
  myndighet    TEXT,
  foradsplats  TEXT,
  natv_order   TEXT,
  kostbadsstalle TEXT,
  transkod     TEXT,
  vernr        TEXT,
  konto        TEXT,
  kloss        TEXT,
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
