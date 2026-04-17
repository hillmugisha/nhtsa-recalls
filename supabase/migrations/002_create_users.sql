-- NHTSA Recalls — user access table
-- Run this in the Supabase SQL editor

CREATE TABLE IF NOT EXISTS users (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email          TEXT        UNIQUE NOT NULL,
  access_granted BOOLEAN     NOT NULL DEFAULT FALSE,
  login_count    INT4        NOT NULL DEFAULT 0,
  last_login     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast email lookup
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
