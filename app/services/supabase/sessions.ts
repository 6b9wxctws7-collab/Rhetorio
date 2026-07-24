import { HistoryItem, TrainingSession } from "../../types/session";
import { canStartSession } from "./profiles";
import { supabase } from "./client";

type HistoryRow = TrainingSession & {
  scenarios?: { title?: string } | null;
  analyses?: { summary?: string; weaknesses?: string[] }[];
};

export async function startSession(userId: string, scenarioId: string): Promise<TrainingSession> {
  const permission = await canStartSession(userId);
  if (!permission.allowed) throw new Error("SESSION_LIMIT_REACHED");

  const { data, error } = await supabase
    .from("sessions")
    .insert({ user_id: userId, scenario_id: scenarioId, status: "active" })
    .select("*")
    .single();

  if (error) throw error;
  return data as TrainingSession;
}

export async function completeSession(sessionId: string, startedAt: string) {
  const durationSeconds = Math.max(1, Math.round((Date.now() - new Date(startedAt).getTime()) / 1000));
  const { data, error } = await supabase
    .from("sessions")
    .update({ ended_at: new Date().toISOString(), duration_seconds: durationSeconds, status: "analyzing" })
    .eq("id", sessionId)
    .select("*")
    .single();

  if (error) throw error;
  return data as TrainingSession;
}

export type HomeStats = {
  sessionsThisWeek: number;
  bestScore: number | null;
};

export async function getHomeStats(userId: string): Promise<HomeStats> {
  const startOfWeek = new Date();
  const day = startOfWeek.getDay();
  // getDay(): Sunday = 0 — shift so the week starts on Monday.
  const daysSinceMonday = (day + 6) % 7;
  startOfWeek.setDate(startOfWeek.getDate() - daysSinceMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const [{ count }, { data: best }] = await Promise.all([
    supabase
      .from("sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .neq("status", "active")
      .gte("started_at", startOfWeek.toISOString()),
    supabase
      .from("sessions")
      .select("score_total")
      .eq("user_id", userId)
      .not("score_total", "is", null)
      .order("score_total", { ascending: false })
      .limit(1)
      .maybeSingle()
  ]);

  return {
    sessionsThisWeek: count ?? 0,
    bestScore: best?.score_total ?? null
  };
}

// Score der letzten abgeschlossenen Session vor der aktuellen — für den
// "+X seit letztem Mal"-Vergleich auf dem Analyse-Screen.
export async function getPreviousScore(userId: string, excludeSessionId: string): Promise<number | null> {
  const { data } = await supabase
    .from("sessions")
    .select("score_total")
    .eq("user_id", userId)
    .neq("id", excludeSessionId)
    .not("score_total", "is", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data?.score_total ?? null;
}

// Anzahl aufeinanderfolgender Trainingstage bis heute (oder gestern, damit
// der Streak nicht schon morgens auf 0 springt).
export async function getStreak(userId: string): Promise<number> {
  const { data } = await supabase
    .from("sessions")
    .select("started_at")
    .eq("user_id", userId)
    .neq("status", "active")
    .order("started_at", { ascending: false })
    .limit(200);

  if (!data?.length) return 0;

  const dayKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  const trainedDays = new Set(data.map((row) => dayKey(new Date(row.started_at))));

  const cursor = new Date();
  // Heute noch nicht trainiert? Dann zählt der Streak ab gestern weiter.
  if (!trainedDays.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  while (trainedDays.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export async function listHistory(userId: string): Promise<HistoryItem[]> {
  const { data, error } = await supabase
    .from("sessions")
    .select("*, scenarios(title), analyses(summary, weaknesses)")
    .eq("user_id", userId)
    .neq("status", "active")
    .order("started_at", { ascending: false });

  if (error) throw error;

  return ((data ?? []) as unknown as HistoryRow[]).map((row) => ({
    ...row,
    scenario_title: row.scenarios?.title ?? "Training",
    main_tip: Array.isArray(row.analyses?.[0]?.weaknesses) ? row.analyses?.[0]?.weaknesses?.[0] : row.analyses?.[0]?.summary
  }));
}
