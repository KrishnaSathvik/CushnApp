-- DB-ONLY RESET (keeps auth + storage untouched)
-- Run in Supabase SQL Editor.
-- This wipes only the public schema, then recreates it.

BEGIN;

DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Standard Supabase grants
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON SCHEMA public TO postgres, service_role;

COMMIT;

-- Next:
-- 1) Run supabase/migration.sql
-- 2) Run supabase/audit_sync.sql
