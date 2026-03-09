-- NUCLEAR RESET (DESTRUCTIVE)
-- Run in Supabase SQL Editor only if you want a near-empty project state.
-- This script will:
-- 1) Delete ALL Storage objects and buckets (via Storage API functions)
-- 2) Delete ALL Auth users/sessions/identities/tokens
-- 3) Drop and recreate the entire public schema
--
-- It does NOT delete edge functions, project secrets, or project settings.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1) STORAGE WIPE
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  b RECORD;
BEGIN
  -- Must use storage functions; direct DELETE on storage tables is blocked.
  FOR b IN SELECT id FROM storage.buckets LOOP
    PERFORM storage.empty_bucket(b.id);
    PERFORM storage.delete_bucket(b.id);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 2) AUTH WIPE
-- ---------------------------------------------------------------------------
-- Order matters due to foreign keys in auth schema.
DELETE FROM auth.refresh_tokens;
DELETE FROM auth.sessions;
DELETE FROM auth.identities;
DELETE FROM auth.mfa_challenges;
DELETE FROM auth.mfa_factors;
DELETE FROM auth.one_time_tokens;
DELETE FROM auth.users;

-- ---------------------------------------------------------------------------
-- 3) PUBLIC SCHEMA WIPE
-- ---------------------------------------------------------------------------
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Re-apply standard grants for Supabase roles
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON SCHEMA public TO postgres, service_role;

COMMIT;

-- Next steps:
-- 1) Run supabase/migration.sql
-- 2) Run supabase/audit_sync.sql
