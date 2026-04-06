-- 005_fixed_prizes.sql
-- Voeg vaste prijsbedragen toe aan de settings tabel
-- Hiermee kunnen vaste euro-bedragen worden ingesteld i.p.v. percentages

ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS prize_1st NUMERIC(6,2) DEFAULT 25.00,
  ADD COLUMN IF NOT EXISTS prize_2nd NUMERIC(6,2) DEFAULT 10.00,
  ADD COLUMN IF NOT EXISTS prize_3rd NUMERIC(6,2) DEFAULT 5.00;

-- Update de bestaande rij
UPDATE settings SET
  prize_1st = 25.00,
  prize_2nd = 10.00,
  prize_3rd = 5.00;
