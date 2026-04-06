-- 004_seed_settings.sql
-- Default settings rij aanmaken
-- ⚠️ HANDMATIGE ACTIE: Wijzig 'WIJZIG_DIT_WACHTWOORD' naar een echt wachtwoord voordat je dit uitvoert!

INSERT INTO settings (
  entry_fee, prize_pct_1st, prize_pct_2nd, prize_pct_3rd, prize_pct_club,
  points_correct_winner, points_correct_home_goals, points_correct_away_goals,
  points_exact_score_bonus, points_topscorer_base, points_topscorer_min,
  predictions_open, admin_password
) VALUES (
  5.00, 40, 15, 10, 35,
  3, 2, 2, 3, 10, 1,
  true, 'Tijs4ever!'
);
