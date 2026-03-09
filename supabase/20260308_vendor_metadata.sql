BEGIN;

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS vendor_domain TEXT,
  ADD COLUMN IF NOT EXISTS vendor_confidence NUMERIC(4,2),
  ADD COLUMN IF NOT EXISTS vendor_match_type TEXT;

COMMIT;
