-- 007_match_cancelled.sql
-- Voeg is_cancelled toe aan matches zodat afgelaste wedstrijden
-- worden overgeslagen in de puntentelling (iedereen krijgt 0 punten,
-- wat de onderlinge standen eerlijk houdt).

ALTER TABLE matches
  ADD COLUMN IF NOT EXISTS is_cancelled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS cancelled_reason TEXT;
