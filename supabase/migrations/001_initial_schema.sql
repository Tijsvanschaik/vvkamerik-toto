-- 001_initial_schema.sql
-- Alle CREATE TABLE statements voor de VVKamerik Toto

-- Settings: singleton tabel met alle configureerbare waarden
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_fee NUMERIC(6,2) DEFAULT 5.00,
  prize_pct_1st INTEGER DEFAULT 40,
  prize_pct_2nd INTEGER DEFAULT 15,
  prize_pct_3rd INTEGER DEFAULT 10,
  prize_pct_club INTEGER DEFAULT 35,
  points_correct_winner INTEGER DEFAULT 3,
  points_correct_home_goals INTEGER DEFAULT 2,
  points_correct_away_goals INTEGER DEFAULT 2,
  points_exact_score_bonus INTEGER DEFAULT 3,
  points_topscorer_base INTEGER DEFAULT 10,
  points_topscorer_min INTEGER DEFAULT 1,
  predictions_open BOOLEAN DEFAULT true,
  tikkie_url TEXT,
  admin_password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Teams: alle teams (VVKamerik + tegenstanders)
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  is_kamerik BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Players: spelers van VVKamerik-teams
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  shirt_number INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Matches: de 5 wedstrijden per ronde
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_order INTEGER NOT NULL,
  home_team_id UUID REFERENCES teams(id),
  away_team_id UUID REFERENCES teams(id),
  kamerik_team_id UUID REFERENCES teams(id),
  actual_home_goals INTEGER,
  actual_away_goals INTEGER,
  is_finished BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Match scorers: welke VVKamerik-spelers hebben gescoord per wedstrijd
CREATE TABLE match_scorers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  goals INTEGER DEFAULT 1,
  UNIQUE(match_id, player_id)
);

-- Participants: deelnemers aan de toto
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  has_paid BOOLEAN DEFAULT false,
  mollie_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Predictions: voorspellingen per deelnemer per wedstrijd
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  predicted_home_goals INTEGER NOT NULL,
  predicted_away_goals INTEGER NOT NULL,
  chosen_player_id UUID REFERENCES players(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(participant_id, match_id)
);
