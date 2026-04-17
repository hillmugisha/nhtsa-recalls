-- NHTSA Recalls table
-- Run this in the Supabase SQL editor to create the schema

CREATE TABLE IF NOT EXISTS recalls (
  id                      BIGSERIAL PRIMARY KEY,
  campno                  TEXT UNIQUE NOT NULL,
  make                    TEXT,
  model                   TEXT,
  model_year              INTEGER,
  mfg_campaign_no         TEXT,
  component_name          TEXT,
  manufacturer_name       TEXT,
  recall_type             TEXT,
  potential_units_affected INTEGER,
  owner_notification_date DATE,
  influenced_by           TEXT,
  report_received_date    DATE,
  defect_description      TEXT,
  consequence_description TEXT,
  corrective_action       TEXT,
  notes                   TEXT,
  do_not_drive            BOOLEAN,
  park_outside            BOOLEAN,
  synced_at               TIMESTAMPTZ DEFAULT NOW()
);

-- Index for common filter queries
CREATE INDEX IF NOT EXISTS idx_recalls_make       ON recalls (make);
CREATE INDEX IF NOT EXISTS idx_recalls_model      ON recalls (model);
CREATE INDEX IF NOT EXISTS idx_recalls_model_year ON recalls (model_year);
CREATE INDEX IF NOT EXISTS idx_recalls_campno     ON recalls (campno);
