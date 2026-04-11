import type {
  Settings,
  Match,
  Prediction,
  MatchScorer,
  MatchPointBreakdown,
  LeaderboardEntry,
  Participant,
} from "@/lib/types";

interface MatchWithTeamNames extends Match {
  home_team_name: string;
  away_team_name: string;
  // is_cancelled and cancelled_reason already inherited from Match
}

interface ScoringInput {
  participants: Participant[];
  predictions: Prediction[];
  matches: MatchWithTeamNames[];
  matchScorers: MatchScorer[];
  settings: Settings;
  playerNames: Record<string, string>;
}

function getWinner(
  homeGoals: number,
  awayGoals: number
): "home" | "away" | "draw" {
  if (homeGoals > awayGoals) return "home";
  if (homeGoals < awayGoals) return "away";
  return "draw";
}

function countChoosersByMatchAndPlayer(
  predictions: Prediction[]
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const pred of predictions) {
    if (!pred.chosen_player_id) continue;
    const key = `${pred.match_id}:${pred.chosen_player_id}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

export function calculateMatchPoints(
  prediction: Prediction,
  match: MatchWithTeamNames,
  matchScorers: MatchScorer[],
  settings: Settings,
  chooserCount: number,
  playerName: string | null
): MatchPointBreakdown {
  const result: MatchPointBreakdown = {
    match_id: match.id,
    match_order: match.match_order,
    home_team_name: match.home_team_name,
    away_team_name: match.away_team_name,
    is_cancelled: match.is_cancelled,
    cancelled_reason: match.cancelled_reason ?? null,
    predicted_home_goals: prediction.predicted_home_goals,
    predicted_away_goals: prediction.predicted_away_goals,
    actual_home_goals: match.actual_home_goals,
    actual_away_goals: match.actual_away_goals,
    chosen_player_name: playerName,
    chosen_player_scored: false,
    chosen_player_goals: 0,
    points_winner: 0,
    points_home_goals: 0,
    points_away_goals: 0,
    points_exact_bonus: 0,
    points_topscorer: 0,
    total: 0,
  };

  // Afgelaste wedstrijd: iedereen krijgt 0 punten (standings blijven eerlijk)
  if (match.is_cancelled) {
    result.is_cancelled = true;
    result.cancelled_reason = match.cancelled_reason ?? null;
    return result;
  }

  // Punten worden berekend zodra een score is ingevuld (is_finished niet vereist)
  if (match.actual_home_goals == null || match.actual_away_goals == null) {
    return result;
  }

  const predictedWinner = getWinner(
    prediction.predicted_home_goals,
    prediction.predicted_away_goals
  );
  const actualWinner = getWinner(
    match.actual_home_goals,
    match.actual_away_goals
  );

  if (predictedWinner === actualWinner) {
    result.points_winner = settings.points_correct_winner;
  }

  if (prediction.predicted_home_goals === match.actual_home_goals) {
    result.points_home_goals = settings.points_correct_home_goals;
  }

  if (prediction.predicted_away_goals === match.actual_away_goals) {
    result.points_away_goals = settings.points_correct_away_goals;
  }

  if (
    prediction.predicted_home_goals === match.actual_home_goals &&
    prediction.predicted_away_goals === match.actual_away_goals
  ) {
    result.points_exact_bonus = settings.points_exact_score_bonus;
  }

  if (prediction.chosen_player_id) {
    const scorer = matchScorers.find(
      (s) => s.match_id === match.id && s.player_id === prediction.chosen_player_id
    );

    if (scorer) {
      result.chosen_player_scored = true;
      result.chosen_player_goals = scorer.goals;

      const pointsPerGoal = Math.max(
        Math.floor(settings.points_topscorer_base / chooserCount),
        settings.points_topscorer_min
      );
      result.points_topscorer = scorer.goals * pointsPerGoal;
    }
  }

  result.total =
    result.points_winner +
    result.points_home_goals +
    result.points_away_goals +
    result.points_exact_bonus +
    result.points_topscorer;

  return result;
}

export function calculateLeaderboard(input: ScoringInput): LeaderboardEntry[] {
  const { participants, predictions, matches, matchScorers, settings, playerNames } =
    input;

  const chooserCounts = countChoosersByMatchAndPlayer(predictions);

  const entries: LeaderboardEntry[] = participants.map((participant) => {
    const participantPredictions = predictions.filter(
      (p) => p.participant_id === participant.id
    );

    const matchPoints: MatchPointBreakdown[] = matches.map((match) => {
      const prediction = participantPredictions.find(
        (p) => p.match_id === match.id
      );

      if (!prediction) {
        return {
          match_id: match.id,
          match_order: match.match_order,
          home_team_name: match.home_team_name,
          away_team_name: match.away_team_name,
          predicted_home_goals: 0,
          predicted_away_goals: 0,
          actual_home_goals: match.actual_home_goals,
          actual_away_goals: match.actual_away_goals,
          chosen_player_name: null,
          chosen_player_scored: false,
          chosen_player_goals: 0,
          points_winner: 0,
          points_home_goals: 0,
          points_away_goals: 0,
          points_exact_bonus: 0,
          points_topscorer: 0,
          total: 0,
        };
      }

      const chooserKey = `${match.id}:${prediction.chosen_player_id}`;
      const chooserCount = chooserCounts.get(chooserKey) ?? 1;
      const playerName = prediction.chosen_player_id
        ? playerNames[prediction.chosen_player_id] ?? null
        : null;

      return calculateMatchPoints(
        prediction,
        match,
        matchScorers,
        settings,
        chooserCount,
        playerName
      );
    });

    const totalPoints = matchPoints.reduce((sum, mp) => sum + mp.total, 0);

    return {
      participant_id: participant.id,
      participant_name: participant.name,
      has_paid: participant.has_paid,
      total_points: totalPoints,
      rank: 0,
      match_points: matchPoints,
      created_at: participant.created_at,
    };
  });

  entries.sort((a, b) => {
    if (b.total_points !== a.total_points) return b.total_points - a.total_points;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  entries.forEach((entry, index) => {
    if (
      index > 0 &&
      entries[index - 1].total_points === entry.total_points
    ) {
      entry.rank = entries[index - 1].rank;
    } else {
      entry.rank = index + 1;
    }
  });

  return entries;
}
