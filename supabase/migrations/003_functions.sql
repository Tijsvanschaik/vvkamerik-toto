-- 003_functions.sql
-- Leaderboard functie voor snelle opvraag

CREATE OR REPLACE FUNCTION calculate_leaderboard()
RETURNS TABLE (
  participant_id UUID,
  participant_name TEXT,
  has_paid BOOLEAN,
  total_points BIGINT,
  participant_created_at TIMESTAMPTZ
) AS $$
  WITH settings_row AS (
    SELECT * FROM settings LIMIT 1
  ),
  scorer_counts AS (
    -- Tel hoe vaak elke speler is gekozen per wedstrijd (voor topscoorder-deelpunten)
    SELECT
      p.match_id,
      p.chosen_player_id,
      COUNT(*)::INTEGER AS num_choosers
    FROM predictions p
    WHERE p.chosen_player_id IS NOT NULL
    GROUP BY p.match_id, p.chosen_player_id
  ),
  prediction_points AS (
    SELECT
      pred.participant_id,
      pred.match_id,
      COALESCE(
        -- Correcte winnaar
        CASE
          WHEN m.is_finished = false THEN 0
          WHEN (
            (pred.predicted_home_goals > pred.predicted_away_goals AND m.actual_home_goals > m.actual_away_goals) OR
            (pred.predicted_home_goals < pred.predicted_away_goals AND m.actual_home_goals < m.actual_away_goals) OR
            (pred.predicted_home_goals = pred.predicted_away_goals AND m.actual_home_goals = m.actual_away_goals)
          ) THEN s.points_correct_winner
          ELSE 0
        END, 0
      )
      + COALESCE(
        -- Correcte thuisgoals
        CASE
          WHEN m.is_finished = false THEN 0
          WHEN pred.predicted_home_goals = m.actual_home_goals THEN s.points_correct_home_goals
          ELSE 0
        END, 0
      )
      + COALESCE(
        -- Correcte uitgoals
        CASE
          WHEN m.is_finished = false THEN 0
          WHEN pred.predicted_away_goals = m.actual_away_goals THEN s.points_correct_away_goals
          ELSE 0
        END, 0
      )
      + COALESCE(
        -- Exact score bonus
        CASE
          WHEN m.is_finished = false THEN 0
          WHEN pred.predicted_home_goals = m.actual_home_goals
           AND pred.predicted_away_goals = m.actual_away_goals
          THEN s.points_exact_score_bonus
          ELSE 0
        END, 0
      )
      + COALESCE(
        -- Topscoorder punten
        CASE
          WHEN m.is_finished = false THEN 0
          WHEN ms.player_id IS NOT NULL THEN
            ms.goals * GREATEST(
              FLOOR(s.points_topscorer_base::NUMERIC / sc.num_choosers),
              s.points_topscorer_min
            )::INTEGER
          ELSE 0
        END, 0
      ) AS points
    FROM predictions pred
    CROSS JOIN settings_row s
    JOIN matches m ON m.id = pred.match_id
    LEFT JOIN match_scorers ms ON ms.match_id = pred.match_id AND ms.player_id = pred.chosen_player_id
    LEFT JOIN scorer_counts sc ON sc.match_id = pred.match_id AND sc.chosen_player_id = pred.chosen_player_id
  )
  SELECT
    part.id AS participant_id,
    part.name AS participant_name,
    part.has_paid,
    COALESCE(SUM(pp.points), 0)::BIGINT AS total_points,
    part.created_at AS participant_created_at
  FROM participants part
  LEFT JOIN prediction_points pp ON pp.participant_id = part.id
  GROUP BY part.id, part.name, part.has_paid, part.created_at
  ORDER BY total_points DESC, part.created_at ASC;
$$ LANGUAGE sql STABLE;
