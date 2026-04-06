import { describe, it, expect } from "vitest";
import { calculateMatchPoints, calculateLeaderboard } from "./scoring";
import type { Settings, Prediction, MatchScorer, Participant } from "./types";

const defaultSettings: Settings = {
  id: "s1",
  entry_fee: 5,
  prize_pct_1st: 40,
  prize_pct_2nd: 15,
  prize_pct_3rd: 10,
  prize_pct_club: 35,
  points_correct_winner: 3,
  points_correct_home_goals: 2,
  points_correct_away_goals: 2,
  points_exact_score_bonus: 3,
  points_topscorer_base: 10,
  points_topscorer_min: 1,
  predictions_open: false,
  tikkie_url: null,
  admin_password: "test",
  created_at: "2025-01-01T00:00:00Z",
};

const finishedMatch = {
  id: "m1",
  match_order: 1,
  home_team_id: "t1",
  away_team_id: "t2",
  kamerik_team_id: "t1",
  actual_home_goals: 2,
  actual_away_goals: 1,
  is_finished: true,
  created_at: "2025-01-01T00:00:00Z",
  home_team_name: "VVKamerik 1",
  away_team_name: "Tegenstander",
};

const unfinishedMatch = {
  ...finishedMatch,
  id: "m2",
  actual_home_goals: null,
  actual_away_goals: null,
  is_finished: false,
};

describe("calculateMatchPoints", () => {
  it("gives 0 points for unfinished match", () => {
    const pred: Prediction = {
      id: "p1",
      participant_id: "part1",
      match_id: "m2",
      predicted_home_goals: 2,
      predicted_away_goals: 1,
      chosen_player_id: "pl1",
      created_at: "2025-01-01T00:00:00Z",
    };

    const result = calculateMatchPoints(pred, unfinishedMatch, [], defaultSettings, 1, "Speler A");
    expect(result.total).toBe(0);
  });

  it("gives correct winner points only", () => {
    const pred: Prediction = {
      id: "p1",
      participant_id: "part1",
      match_id: "m1",
      predicted_home_goals: 3,
      predicted_away_goals: 0,
      chosen_player_id: null,
      created_at: "2025-01-01T00:00:00Z",
    };

    const result = calculateMatchPoints(pred, finishedMatch, [], defaultSettings, 1, null);
    expect(result.points_winner).toBe(3);
    expect(result.points_home_goals).toBe(0);
    expect(result.points_away_goals).toBe(0);
    expect(result.points_exact_bonus).toBe(0);
    expect(result.total).toBe(3);
  });

  it("gives exact score bonus for perfect prediction", () => {
    const pred: Prediction = {
      id: "p1",
      participant_id: "part1",
      match_id: "m1",
      predicted_home_goals: 2,
      predicted_away_goals: 1,
      chosen_player_id: null,
      created_at: "2025-01-01T00:00:00Z",
    };

    const result = calculateMatchPoints(pred, finishedMatch, [], defaultSettings, 1, null);
    expect(result.points_winner).toBe(3);
    expect(result.points_home_goals).toBe(2);
    expect(result.points_away_goals).toBe(2);
    expect(result.points_exact_bonus).toBe(3);
    expect(result.total).toBe(10);
  });

  it("gives correct home goals points even with wrong winner", () => {
    const pred: Prediction = {
      id: "p1",
      participant_id: "part1",
      match_id: "m1",
      predicted_home_goals: 2,
      predicted_away_goals: 3,
      chosen_player_id: null,
      created_at: "2025-01-01T00:00:00Z",
    };

    const result = calculateMatchPoints(pred, finishedMatch, [], defaultSettings, 1, null);
    expect(result.points_winner).toBe(0);
    expect(result.points_home_goals).toBe(2);
    expect(result.points_away_goals).toBe(0);
    expect(result.total).toBe(2);
  });

  it("handles draw prediction correctly", () => {
    const drawMatch = {
      ...finishedMatch,
      actual_home_goals: 1,
      actual_away_goals: 1,
    };

    const pred: Prediction = {
      id: "p1",
      participant_id: "part1",
      match_id: "m1",
      predicted_home_goals: 1,
      predicted_away_goals: 1,
      chosen_player_id: null,
      created_at: "2025-01-01T00:00:00Z",
    };

    const result = calculateMatchPoints(pred, drawMatch, [], defaultSettings, 1, null);
    expect(result.points_winner).toBe(3);
    expect(result.points_home_goals).toBe(2);
    expect(result.points_away_goals).toBe(2);
    expect(result.points_exact_bonus).toBe(3);
    expect(result.total).toBe(10);
  });

  it("gives topscorer points when player scores", () => {
    const scorers: MatchScorer[] = [
      { id: "ms1", match_id: "m1", player_id: "pl1", goals: 2 },
    ];

    const pred: Prediction = {
      id: "p1",
      participant_id: "part1",
      match_id: "m1",
      predicted_home_goals: 0,
      predicted_away_goals: 0,
      chosen_player_id: "pl1",
      created_at: "2025-01-01T00:00:00Z",
    };

    const result = calculateMatchPoints(pred, finishedMatch, scorers, defaultSettings, 1, "Speler A");
    expect(result.chosen_player_scored).toBe(true);
    expect(result.chosen_player_goals).toBe(2);
    expect(result.points_topscorer).toBe(20); // 2 goals * 10 base / 1 chooser
  });

  it("splits topscorer points among multiple choosers", () => {
    const scorers: MatchScorer[] = [
      { id: "ms1", match_id: "m1", player_id: "pl1", goals: 1 },
    ];

    const pred: Prediction = {
      id: "p1",
      participant_id: "part1",
      match_id: "m1",
      predicted_home_goals: 0,
      predicted_away_goals: 0,
      chosen_player_id: "pl1",
      created_at: "2025-01-01T00:00:00Z",
    };

    // 3 choosers: floor(10/3) = 3
    const result = calculateMatchPoints(pred, finishedMatch, scorers, defaultSettings, 3, "Speler A");
    expect(result.points_topscorer).toBe(3);
  });

  it("applies minimum topscorer points", () => {
    const scorers: MatchScorer[] = [
      { id: "ms1", match_id: "m1", player_id: "pl1", goals: 1 },
    ];

    const pred: Prediction = {
      id: "p1",
      participant_id: "part1",
      match_id: "m1",
      predicted_home_goals: 0,
      predicted_away_goals: 0,
      chosen_player_id: "pl1",
      created_at: "2025-01-01T00:00:00Z",
    };

    // 20 choosers: floor(10/20) = 0, but min is 1
    const result = calculateMatchPoints(pred, finishedMatch, scorers, defaultSettings, 20, "Speler A");
    expect(result.points_topscorer).toBe(1);
  });

  it("gives 0 topscorer points when player doesn't score", () => {
    const scorers: MatchScorer[] = [
      { id: "ms1", match_id: "m1", player_id: "pl2", goals: 1 },
    ];

    const pred: Prediction = {
      id: "p1",
      participant_id: "part1",
      match_id: "m1",
      predicted_home_goals: 0,
      predicted_away_goals: 0,
      chosen_player_id: "pl1",
      created_at: "2025-01-01T00:00:00Z",
    };

    const result = calculateMatchPoints(pred, finishedMatch, scorers, defaultSettings, 1, "Speler A");
    expect(result.chosen_player_scored).toBe(false);
    expect(result.points_topscorer).toBe(0);
  });

  it("handles 0-0 result correctly", () => {
    const zeroMatch = {
      ...finishedMatch,
      actual_home_goals: 0,
      actual_away_goals: 0,
    };

    const pred: Prediction = {
      id: "p1",
      participant_id: "part1",
      match_id: "m1",
      predicted_home_goals: 0,
      predicted_away_goals: 0,
      chosen_player_id: "pl1",
      created_at: "2025-01-01T00:00:00Z",
    };

    const result = calculateMatchPoints(pred, zeroMatch, [], defaultSettings, 1, "Speler A");
    expect(result.points_winner).toBe(3);
    expect(result.points_home_goals).toBe(2);
    expect(result.points_away_goals).toBe(2);
    expect(result.points_exact_bonus).toBe(3);
    expect(result.points_topscorer).toBe(0);
    expect(result.total).toBe(10);
  });
});

describe("calculateLeaderboard", () => {
  it("ranks participants by total points", () => {
    const participants: Participant[] = [
      { id: "part1", name: "Alice", has_paid: true, mollie_payment_id: null, created_at: "2025-01-01T00:00:00Z" },
      { id: "part2", name: "Bob", has_paid: true, mollie_payment_id: null, created_at: "2025-01-01T01:00:00Z" },
    ];

    const predictions: Prediction[] = [
      { id: "p1", participant_id: "part1", match_id: "m1", predicted_home_goals: 2, predicted_away_goals: 1, chosen_player_id: null, created_at: "2025-01-01T00:00:00Z" },
      { id: "p2", participant_id: "part2", match_id: "m1", predicted_home_goals: 0, predicted_away_goals: 3, chosen_player_id: null, created_at: "2025-01-01T01:00:00Z" },
    ];

    const result = calculateLeaderboard({
      participants,
      predictions,
      matches: [finishedMatch],
      matchScorers: [],
      settings: defaultSettings,
      playerNames: {},
    });

    expect(result[0].participant_name).toBe("Alice");
    expect(result[0].total_points).toBe(10);
    expect(result[0].rank).toBe(1);
    expect(result[1].participant_name).toBe("Bob");
    expect(result[1].total_points).toBe(0);
    expect(result[1].rank).toBe(2);
  });

  it("uses created_at as tiebreaker (earlier = higher rank)", () => {
    const participants: Participant[] = [
      { id: "part1", name: "Alice", has_paid: true, mollie_payment_id: null, created_at: "2025-01-01T02:00:00Z" },
      { id: "part2", name: "Bob", has_paid: true, mollie_payment_id: null, created_at: "2025-01-01T01:00:00Z" },
    ];

    const predictions: Prediction[] = [
      { id: "p1", participant_id: "part1", match_id: "m1", predicted_home_goals: 2, predicted_away_goals: 1, chosen_player_id: null, created_at: "2025-01-01T02:00:00Z" },
      { id: "p2", participant_id: "part2", match_id: "m1", predicted_home_goals: 2, predicted_away_goals: 1, chosen_player_id: null, created_at: "2025-01-01T01:00:00Z" },
    ];

    const result = calculateLeaderboard({
      participants,
      predictions,
      matches: [finishedMatch],
      matchScorers: [],
      settings: defaultSettings,
      playerNames: {},
    });

    expect(result[0].participant_name).toBe("Bob");
    expect(result[1].participant_name).toBe("Alice");
    expect(result[0].rank).toBe(1);
    expect(result[1].rank).toBe(1); // Same rank for same points
  });
});
