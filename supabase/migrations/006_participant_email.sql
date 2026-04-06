-- 006_participant_email.sql
-- Voeg e-mail toe aan deelnemers zodat winnaars bereikbaar zijn

ALTER TABLE participants
  ADD COLUMN IF NOT EXISTS email TEXT;
