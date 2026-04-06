export interface Settings {
  id: string;
  entry_fee: number;
  prize_1st: number;
  prize_2nd: number;
  prize_3rd: number;
  prize_pct_1st: number;
  prize_pct_2nd: number;
  prize_pct_3rd: number;
  prize_pct_club: number;
  points_correct_winner: number;
  points_correct_home_goals: number;
  points_correct_away_goals: number;
  points_exact_score_bonus: number;
  points_topscorer_base: number;
  points_topscorer_min: number;
  predictions_open: boolean;
  tikkie_url: string | null;
  admin_password: string;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  is_kamerik: boolean;
  created_at: string;
}

export interface Player {
  id: string;
  team_id: string;
  name: string;
  shirt_number: number | null;
  created_at: string;
}

export interface Match {
  id: string;
  match_order: number;
  home_team_id: string;
  away_team_id: string;
  kamerik_team_id: string;
  actual_home_goals: number | null;
  actual_away_goals: number | null;
  is_finished: boolean;
  created_at: string;
}

export interface MatchWithTeams extends Match {
  home_team: Team;
  away_team: Team;
  kamerik_team: Team;
}

export interface MatchScorer {
  id: string;
  match_id: string;
  player_id: string;
  goals: number;
}

export interface MatchScorerWithPlayer extends MatchScorer {
  player: Player;
}

export interface Participant {
  id: string;
  name: string;
  has_paid: boolean;
  mollie_payment_id: string | null;
  created_at: string;
}

export interface Prediction {
  id: string;
  participant_id: string;
  match_id: string;
  predicted_home_goals: number;
  predicted_away_goals: number;
  chosen_player_id: string | null;
  created_at: string;
}

export interface PredictionWithDetails extends Prediction {
  match: MatchWithTeams;
  chosen_player: Player | null;
}

export interface LeaderboardEntry {
  participant_id: string;
  participant_name: string;
  has_paid: boolean;
  total_points: number;
  rank: number;
  match_points: MatchPointBreakdown[];
  created_at: string;
}

export interface MatchPointBreakdown {
  match_id: string;
  match_order: number;
  home_team_name: string;
  away_team_name: string;
  predicted_home_goals: number;
  predicted_away_goals: number;
  actual_home_goals: number | null;
  actual_away_goals: number | null;
  chosen_player_name: string | null;
  chosen_player_scored: boolean;
  chosen_player_goals: number;
  points_winner: number;
  points_home_goals: number;
  points_away_goals: number;
  points_exact_bonus: number;
  points_topscorer: number;
  total: number;
}

export interface PredictionSubmission {
  participant_name: string;
  predictions: {
    match_id: string;
    predicted_home_goals: number;
    predicted_away_goals: number;
    chosen_player_id: string;
  }[];
}

export interface PublicSettings {
  predictions_open: boolean;
  tikkie_url: string | null;
  entry_fee: number;
}

export interface TopScorerStat {
  player_id: string;
  player_name: string;
  team_name: string;
  times_chosen: number;
  actual_goals: number;
  is_sleeper: boolean;
}
