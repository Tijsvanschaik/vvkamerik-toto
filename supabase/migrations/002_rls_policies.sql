-- 002_rls_policies.sql
-- Row Level Security policies
-- Publieke routes gaan via anon key, admin routes via service_role key (bypassed RLS)

-- Enable RLS op alle tabellen
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_scorers ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- Settings: iedereen mag lezen (publieke settings worden gefilterd in API)
CREATE POLICY "settings_read" ON settings FOR SELECT USING (true);

-- Teams: iedereen mag lezen
CREATE POLICY "teams_read" ON teams FOR SELECT USING (true);

-- Players: iedereen mag lezen
CREATE POLICY "players_read" ON players FOR SELECT USING (true);

-- Matches: iedereen mag lezen
CREATE POLICY "matches_read" ON matches FOR SELECT USING (true);

-- Match scorers: iedereen mag lezen
CREATE POLICY "match_scorers_read" ON match_scorers FOR SELECT USING (true);

-- Participants: inserten via anon, lezen via anon
CREATE POLICY "participants_insert" ON participants FOR INSERT WITH CHECK (true);
CREATE POLICY "participants_read" ON participants FOR SELECT USING (true);

-- Predictions: inserten via anon, lezen via anon (voor leaderboard)
CREATE POLICY "predictions_insert" ON predictions FOR INSERT WITH CHECK (true);
CREATE POLICY "predictions_read" ON predictions FOR SELECT USING (true);

-- Alle schrijfoperaties (UPDATE, DELETE) gaan via service_role key
-- die RLS bypassed, dus daar zijn geen policies voor nodig.
