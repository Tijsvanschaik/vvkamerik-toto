import { supabaseAdmin } from "@/lib/supabase-server";
import { calculateLeaderboard } from "@/lib/scoring";
import type { Match, Participant, Prediction, MatchScorer, Settings } from "@/lib/types";

export async function GET() {
  try {
    const [
      { data: settingsData },
      { data: matchesRaw },
      { data: participants },
      { data: predictions },
      { data: matchScorers },
      { data: playersData },
    ] = await Promise.all([
      supabaseAdmin.from("settings").select("*").single(),
      supabaseAdmin
        .from("matches")
        .select("*, home_team:teams!matches_home_team_id_fkey(name), away_team:teams!matches_away_team_id_fkey(name)")
        .order("match_order"),
      supabaseAdmin.from("participants").select("*"),
      supabaseAdmin.from("predictions").select("*"),
      supabaseAdmin.from("match_scorers").select("*"),
      supabaseAdmin.from("players").select("id, name"),
    ]);

    if (!settingsData || !matchesRaw || !participants || !predictions || !matchScorers) {
      return Response.json({ error: "Kon data niet ophalen" }, { status: 500 });
    }

    const hasFinished = matchesRaw.some(
      (m: Match) => m.is_finished
    );

    if (!hasFinished) {
      return Response.json({
        leaderboard: [],
        matches: matchesRaw.map((m: Record<string, unknown>) => ({
          id: m.id,
          match_order: m.match_order,
          home_team_name: (m.home_team as { name: string })?.name,
          away_team_name: (m.away_team as { name: string })?.name,
          actual_home_goals: m.actual_home_goals,
          actual_away_goals: m.actual_away_goals,
          is_finished: m.is_finished,
        })),
        settings: {
          entry_fee: settingsData.entry_fee,
          prize_1st: settingsData.prize_1st ?? 25,
          prize_2nd: settingsData.prize_2nd ?? 10,
          prize_3rd: settingsData.prize_3rd ?? 5,
        },
        message: "Nog geen wedstrijden afgelopen",
      });
    }

    const playerNames: Record<string, string> = {};
    if (playersData) {
      for (const p of playersData) {
        playerNames[p.id] = p.name;
      }
    }

    const matches = matchesRaw.map((m: Record<string, unknown>) => ({
      ...(m as unknown as Match),
      home_team_name: (m.home_team as { name: string })?.name ?? "?",
      away_team_name: (m.away_team as { name: string })?.name ?? "?",
    }));

    const leaderboard = calculateLeaderboard({
      participants: participants as Participant[],
      predictions: predictions as Prediction[],
      matches,
      matchScorers: matchScorers as MatchScorer[],
      settings: settingsData as Settings,
      playerNames,
    });

    const allFinished = matchesRaw.every((m: Match) => m.is_finished);
    const totalPot = participants.length * Number(settingsData.entry_fee);

    return Response.json({
      leaderboard,
      matches: matches.map((m: Record<string, unknown>) => ({
        id: m.id,
        match_order: m.match_order,
        home_team_name: m.home_team_name,
        away_team_name: m.away_team_name,
        actual_home_goals: m.actual_home_goals,
        actual_away_goals: m.actual_away_goals,
        is_finished: m.is_finished,
      })),
      settings: {
        entry_fee: settingsData.entry_fee,
        prize_1st: settingsData.prize_1st ?? 25,
        prize_2nd: settingsData.prize_2nd ?? 10,
        prize_3rd: settingsData.prize_3rd ?? 5,
      },
      total_pot: totalPot,
      all_finished: allFinished,
    });
  } catch {
    return Response.json({ error: "Er ging iets mis" }, { status: 500 });
  }
}
