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
      { data: teamsData },
    ] = await Promise.all([
      supabaseAdmin.from("settings").select("*").single(),
      supabaseAdmin
        .from("matches")
        .select("*, home_team:teams!matches_home_team_id_fkey(name), away_team:teams!matches_away_team_id_fkey(name), kamerik_team:teams!matches_kamerik_team_id_fkey(name)")
        .order("match_order"),
      supabaseAdmin.from("participants").select("*"),
      supabaseAdmin.from("predictions").select("*"),
      supabaseAdmin.from("match_scorers").select("*"),
      supabaseAdmin.from("players").select("id, name, team_id"),
      supabaseAdmin.from("teams").select("id, name"),
    ]);

    if (!settingsData || !matchesRaw) {
      return Response.json({ error: "Kon data niet ophalen" }, { status: 500 });
    }

    const safeParticipants = participants ?? [];
    const safePredictions = predictions ?? [];
    const safeScorers = matchScorers ?? [];
    const safePlayers = playersData ?? [];
    const safeTeams = teamsData ?? [];

    // Player and team lookup maps
    const playerNames: Record<string, string> = {};
    const playerTeam: Record<string, string> = {};
    for (const p of safePlayers) playerNames[p.id] = p.name;
    const teamNames: Record<string, string> = {};
    for (const t of safeTeams) teamNames[t.id] = t.name;
    for (const p of safePlayers) playerTeam[p.id] = teamNames[p.team_id] ?? "";

    // Build matches with team names
    const matches = matchesRaw.map((m: Record<string, unknown>) => ({
      ...(m as unknown as Match),
      home_team_name: (m.home_team as { name: string })?.name ?? "?",
      away_team_name: (m.away_team as { name: string })?.name ?? "?",
      kamerik_team_name: (m.kamerik_team as { name: string })?.name ?? "?",
    }));

    // --- Leaderboard ---
    // Een wedstrijd "telt" zodra er een score is ingevuld (is_finished niet vereist)
    const activeMatches = matches.filter((m) => !m.is_cancelled);
    const hasFinished = activeMatches.some((m) => m.actual_home_goals != null);
    const allFinished = activeMatches.length > 0 && activeMatches.every((m) => m.actual_home_goals != null);

    const leaderboard = hasFinished
      ? calculateLeaderboard({
          participants: safeParticipants as Participant[],
          predictions: safePredictions as Prediction[],
          matches,
          matchScorers: safeScorers as MatchScorer[],
          settings: settingsData as Settings,
          playerNames,
        })
      : [];

    // --- Prijzenpot ---
    const participantCount = safeParticipants.length;
    const totalPot = participantCount * Number(settingsData.entry_fee);
    const clubShare = (totalPot * (settingsData.prize_pct_club ?? 35)) / 100;

    // --- Wedstrijd Voorspellingen (% home win / draw / away win per match) ---
    const matchPredictionStats = matches.map((match) => {
      const matchPreds = safePredictions.filter(
        (p: Prediction) => p.match_id === match.id
      );
      const total = matchPreds.length;
      let homeWin = 0, draw = 0, awayWin = 0;
      for (const p of matchPreds as Prediction[]) {
        if (p.predicted_home_goals > p.predicted_away_goals) homeWin++;
        else if (p.predicted_home_goals === p.predicted_away_goals) draw++;
        else awayWin++;
      }
      return {
        match_id: match.id,
        match_order: match.match_order,
        home_team_name: match.home_team_name,
        away_team_name: match.away_team_name,
        kamerik_team_name: match.kamerik_team_name,
        home_win_count: homeWin,
        draw_count: draw,
        away_win_count: awayWin,
        total,
        home_win_pct: total > 0 ? Math.round((homeWin / total) * 100) : 0,
        draw_pct: total > 0 ? Math.round((draw / total) * 100) : 0,
        away_win_pct: total > 0 ? Math.round((awayWin / total) * 100) : 0,
        avg_home_goals: total > 0
          ? +((matchPreds as Prediction[]).reduce((s, p) => s + p.predicted_home_goals, 0) / total).toFixed(1)
          : null,
        avg_away_goals: total > 0
          ? +((matchPreds as Prediction[]).reduce((s, p) => s + p.predicted_away_goals, 0) / total).toFixed(1)
          : null,
        actual_home_goals: match.actual_home_goals,
        actual_away_goals: match.actual_away_goals,
        is_finished: match.is_finished,
        is_cancelled: match.is_cancelled ?? false,
        cancelled_reason: match.cancelled_reason ?? null,
      };
    });

    // --- Doelpuntenmakers (meest gekozen spelers) ---
    // Afgelaste wedstrijden worden uitgesloten: stemmen én goals tellen niet mee
    const cancelledMatchIds = new Set(
      matches.filter((m) => m.is_cancelled).map((m) => m.id)
    );

    const playerVoteCounts: Record<string, number> = {};
    for (const pred of safePredictions as Prediction[]) {
      if (!pred.chosen_player_id) continue;
      if (cancelledMatchIds.has(pred.match_id)) continue;
      playerVoteCounts[pred.chosen_player_id] =
        (playerVoteCounts[pred.chosen_player_id] ?? 0) + 1;
    }

    // Only count goals from non-cancelled matches
    const activeScorers = (safeScorers as MatchScorer[]).filter(
      (s) => !cancelledMatchIds.has(s.match_id)
    );

    const playerVoteStats = Object.entries(playerVoteCounts)
      .map(([playerId, count]) => ({
        player_id: playerId,
        player_name: playerNames[playerId] ?? "Onbekend",
        team_name: playerTeam[playerId] ?? "",
        vote_count: count,
        actual_goals: activeScorers
          .filter((s) => s.player_id === playerId)
          .reduce((sum, s) => sum + s.goals, 0),
      }))
      .sort((a, b) => b.vote_count - a.vote_count);

    // --- Alle voorspellingen ---
    const allPredictions = safeParticipants
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map((participant) => {
        const preds = (safePredictions as Prediction[]).filter(
          (p) => p.participant_id === participant.id
        );
        return {
          participant_name: participant.name,
          has_paid: participant.has_paid,
          predictions: matches.map((match) => {
            const pred = preds.find((p) => p.match_id === match.id);
            return {
              match_id: match.id,
              match_order: match.match_order,
              predicted_home_goals: pred?.predicted_home_goals ?? null,
              predicted_away_goals: pred?.predicted_away_goals ?? null,
              chosen_player_name: pred?.chosen_player_id
                ? playerNames[pred.chosen_player_id] ?? null
                : null,
            };
          }),
        };
      });

    return Response.json({
      leaderboard,
      matches: matches.map((m) => ({
        id: m.id,
        match_order: m.match_order,
        home_team_name: m.home_team_name,
        away_team_name: m.away_team_name,
        kamerik_team_name: m.kamerik_team_name,
        actual_home_goals: m.actual_home_goals,
        actual_away_goals: m.actual_away_goals,
        is_finished: m.is_finished,
        is_cancelled: m.is_cancelled ?? false,
        cancelled_reason: m.cancelled_reason ?? null,
      })),
      settings: {
        entry_fee: settingsData.entry_fee,
        prize_1st: settingsData.prize_1st ?? 25,
        prize_2nd: settingsData.prize_2nd ?? 10,
        prize_3rd: settingsData.prize_3rd ?? 5,
        prize_pct_club: settingsData.prize_pct_club ?? 35,
      },
      participant_count: participantCount,
      total_pot: totalPot,
      club_share: clubShare,
      all_finished: allFinished,
      has_finished: hasFinished,
      standings_visible: settingsData.standings_visible !== false,
      match_prediction_stats: matchPredictionStats,
      player_vote_stats: playerVoteStats,
      all_predictions: allPredictions,
    });
  } catch {
    return Response.json({ error: "Er ging iets mis" }, { status: 500 });
  }
}
