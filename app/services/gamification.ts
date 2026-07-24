import { supabase } from "./supabase/client";

// ── Level-System ────────────────────────────────────────────────────────
// 500 XP pro Level; eine gute Session bringt ~60-90 XP (= ihr Score).
// So dauert ein Level ca. 6-8 Sessions — spürbarer Fortschritt ohne Inflation.

const XP_PER_LEVEL = 500;

const levelTitles = [
  "Neuling",
  "Plauderer",
  "Gesprächspartner",
  "Wortgewandt",
  "Redner",
  "Überzeuger",
  "Verhandler",
  "Rhetoriker",
  "Meisterredner",
  "Rhetorik-Legende"
];

export type LevelInfo = {
  level: number;
  title: string;
  xp: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  progress: number;
};

export function levelForXp(xp: number): LevelInfo {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpIntoLevel = xp % XP_PER_LEVEL;
  return {
    level,
    title: levelTitles[Math.min(level - 1, levelTitles.length - 1)],
    xp,
    xpIntoLevel,
    xpForNextLevel: XP_PER_LEVEL,
    progress: xpIntoLevel / XP_PER_LEVEL
  };
}

// ── Streak mit Freeze ───────────────────────────────────────────────────

export type StreakInfo = {
  streak: number;
  trainedToday: boolean;
  freezeAvailable: boolean;
  // true, wenn der aktuelle Streak nur dank eines Freezes noch lebt
  freezeBridged: boolean;
};

const FREEZE_COOLDOWN_DAYS = 7;

function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

// Berechnet den Streak. Ein verpasster Tag kann durch einen Streak-Freeze
// überbrückt werden; der Freeze lädt sich 7 Tage nach Verbrauch wieder auf.
// Es wird nur der letzte Freeze gespeichert — überschreibt ein neuer Freeze
// einen älteren, endet der historische Streak an der alten Lücke. Für den
// MVP ist das ein akzeptabler Kompromiss.
export async function getStreakInfo(userId: string): Promise<StreakInfo> {
  const [{ data: sessions }, { data: profile }] = await Promise.all([
    supabase
      .from("sessions")
      .select("started_at")
      .eq("user_id", userId)
      .neq("status", "active")
      .order("started_at", { ascending: false })
      .limit(200),
    supabase.from("profiles").select("streak_freeze_used_at").eq("id", userId).maybeSingle()
  ]);

  const trainedDays = new Set((sessions ?? []).map((row) => dayKey(new Date(row.started_at))));
  const today = new Date();
  const trainedToday = trainedDays.has(dayKey(today));

  const freezeUsedAt = profile?.streak_freeze_used_at ? new Date(profile.streak_freeze_used_at) : null;
  // Der gespeicherte Freeze-Tag zählt als trainiert — er IST die Überbrückung.
  if (freezeUsedAt) trainedDays.add(dayKey(freezeUsedAt));

  const freezeAvailable =
    !freezeUsedAt || Date.now() - freezeUsedAt.getTime() > FREEZE_COOLDOWN_DAYS * 86400000;

  const cursor = new Date();
  if (!trainedToday) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  let freezeBridged = false;
  let canBridge = freezeAvailable;

  while (true) {
    if (trainedDays.has(dayKey(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }
    // Lücke: genau einen Tag überbrücken, wenn ein Freeze verfügbar ist —
    // aber nur, wenn dahinter überhaupt ein Streak weitergeht.
    if (canBridge) {
      const behind = new Date(cursor);
      behind.setDate(behind.getDate() - 1);
      if (trainedDays.has(dayKey(behind))) {
        await supabase
          .from("profiles")
          .update({ streak_freeze_used_at: cursor.toISOString() })
          .eq("id", userId);
        freezeBridged = true;
        canBridge = false;
        cursor.setDate(cursor.getDate() - 1);
        continue;
      }
    }
    break;
  }

  return { streak, trainedToday, freezeAvailable: freezeAvailable && !freezeBridged, freezeBridged };
}

// ── Tagesziel ───────────────────────────────────────────────────────────

export type DailyGoalInfo = {
  sessionsToday: number;
  goal: number;
  reached: boolean;
};

export async function getDailyGoal(userId: string): Promise<DailyGoalInfo> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [{ count }, { data: profile }] = await Promise.all([
    supabase
      .from("sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .neq("status", "active")
      .gte("started_at", startOfDay.toISOString()),
    supabase.from("profiles").select("daily_goal_sessions").eq("id", userId).maybeSingle()
  ]);

  const goal = profile?.daily_goal_sessions ?? 1;
  const sessionsToday = count ?? 0;
  return { sessionsToday, goal, reached: sessionsToday >= goal };
}

export async function getXp(userId: string): Promise<number> {
  const { data } = await supabase.from("profiles").select("xp").eq("id", userId).maybeSingle();
  return data?.xp ?? 0;
}

// ── Achievements ────────────────────────────────────────────────────────

export type AchievementDef = {
  key: string;
  emoji: string;
  title: string;
  description: string;
};

export const achievementCatalog: AchievementDef[] = [
  { key: "first_session", emoji: "🎯", title: "Erste Schritte", description: "Deine erste Session abgeschlossen" },
  { key: "five_sessions", emoji: "💪", title: "Dranbleiber", description: "5 Sessions abgeschlossen" },
  { key: "twenty_sessions", emoji: "🏋️", title: "Trainingstier", description: "20 Sessions abgeschlossen" },
  { key: "streak_3", emoji: "🔥", title: "Warmgelaufen", description: "3 Tage am Stück trainiert" },
  { key: "streak_7", emoji: "⚡", title: "Wochen-Flamme", description: "7 Tage am Stück trainiert" },
  { key: "streak_30", emoji: "🌋", title: "Unaufhaltsam", description: "30 Tage am Stück trainiert" },
  { key: "score_80", emoji: "⭐", title: "Starker Auftritt", description: "Score von 80+ erreicht" },
  { key: "score_95", emoji: "🏆", title: "Rhetorik-Profi", description: "Score von 95+ erreicht" },
  { key: "early_bird", emoji: "🌅", title: "Frühaufsteher", description: "Vor 8 Uhr trainiert" },
  { key: "night_owl", emoji: "🦉", title: "Nachteule", description: "Nach 22 Uhr trainiert" }
];

export async function listUnlockedAchievements(userId: string): Promise<Set<string>> {
  const { data } = await supabase.from("achievements").select("achievement_key").eq("user_id", userId);
  return new Set((data ?? []).map((row) => row.achievement_key));
}

// Prüft nach einer abgeschlossenen Session, welche Abzeichen neu freigeschaltet
// werden, speichert sie und gibt die neuen zurück (für den Feier-Moment).
export async function checkAchievements(userId: string, latestScore: number): Promise<AchievementDef[]> {
  const [unlocked, streakInfo, { count: totalSessions }] = await Promise.all([
    listUnlockedAchievements(userId),
    getStreakInfo(userId),
    supabase
      .from("sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .neq("status", "active")
  ]);

  const hour = new Date().getHours();
  const sessions = totalSessions ?? 0;

  const earned = achievementCatalog.filter((def) => {
    if (unlocked.has(def.key)) return false;
    switch (def.key) {
      case "first_session":
        return sessions >= 1;
      case "five_sessions":
        return sessions >= 5;
      case "twenty_sessions":
        return sessions >= 20;
      case "streak_3":
        return streakInfo.streak >= 3;
      case "streak_7":
        return streakInfo.streak >= 7;
      case "streak_30":
        return streakInfo.streak >= 30;
      case "score_80":
        return latestScore >= 80;
      case "score_95":
        return latestScore >= 95;
      case "early_bird":
        return hour < 8;
      case "night_owl":
        return hour >= 22;
      default:
        return false;
    }
  });

  if (earned.length) {
    // unique constraint fängt Doppel-Unlocks bei parallelen Aufrufen ab
    await supabase
      .from("achievements")
      .upsert(
        earned.map((def) => ({ user_id: userId, achievement_key: def.key })),
        { onConflict: "user_id,achievement_key", ignoreDuplicates: true }
      );
  }

  return earned;
}
