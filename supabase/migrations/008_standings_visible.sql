-- 008_standings_visible.sql
-- Hiermee kan de beheerder de standen verbergen vlak voor de prijsuitreiking
-- en ze daarna feestelijk onthullen.

ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS standings_visible BOOLEAN DEFAULT true;
