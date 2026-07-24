import { StyleSheet, Text, View } from "react-native";

import { colors } from "../constants/colors";
import { DailyGoalInfo, LevelInfo, StreakInfo } from "../services/gamification";

type Props = {
  streak: StreakInfo;
  goal: DailyGoalInfo;
  level: LevelInfo;
};

// Duolingo-artige Motivationskarte: Flamme + Streak, Tagesziel-Fortschritt
// und Level-Progress an einem Ort — der erste Blickfang auf dem Home-Screen.
export function StreakCard({ streak, goal, level }: Props) {
  const flame = streak.streak > 0 ? "🔥" : "🕯️";
  const streakLine = (() => {
    if (streak.streak === 0) return "Starte heute deinen Streak!";
    if (streak.trainedToday) return "Streak gesichert — stark!";
    return "Trainiere heute, um deinen Streak zu halten!";
  })();

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.streakBlock}>
          <Text style={styles.flame}>{flame}</Text>
          <View>
            <Text style={styles.streakCount}>{streak.streak}</Text>
            <Text style={styles.streakLabel}>{streak.streak === 1 ? "Tag" : "Tage"} Streak</Text>
          </View>
        </View>
        <View style={styles.levelChip}>
          <Text style={styles.levelText}>Level {level.level}</Text>
          <Text style={styles.levelTitle}>{level.title}</Text>
        </View>
      </View>

      <Text style={styles.streakLine}>{streakLine}</Text>
      {streak.freezeBridged ? (
        <Text style={styles.freezeNote}>🧊 Dein Streak-Freeze hat einen verpassten Tag gerettet.</Text>
      ) : streak.freezeAvailable && streak.streak > 0 ? (
        <Text style={styles.freezeNote}>🧊 Streak-Freeze bereit — ein verpasster Tag ist abgesichert.</Text>
      ) : null}

      <View style={styles.goalRow}>
        <Text style={styles.goalLabel}>Tagesziel</Text>
        <Text style={styles.goalValue}>
          {goal.reached ? "Geschafft! ✓" : `${goal.sessionsToday}/${goal.goal} Sessions`}
        </Text>
      </View>
      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            {
              width: `${Math.min(100, Math.round((goal.sessionsToday / Math.max(1, goal.goal)) * 100))}%`,
              backgroundColor: goal.reached ? colors.success : colors.accent
            }
          ]}
        />
      </View>

      <View style={styles.goalRow}>
        <Text style={styles.goalLabel}>{level.xpIntoLevel}/{level.xpForNextLevel} XP</Text>
        <Text style={styles.goalValue}>bis Level {level.level + 1}</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${Math.round(level.progress * 100)}%`, backgroundColor: colors.secondary }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  streakBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  flame: {
    fontSize: 40
  },
  streakCount: {
    color: colors.primary,
    fontSize: 26,
    fontWeight: "800",
    lineHeight: 28
  },
  streakLabel: {
    color: colors.muted,
    fontSize: 13
  },
  levelChip: {
    backgroundColor: colors.softAccent,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center"
  },
  levelText: {
    color: colors.accent,
    fontWeight: "800"
  },
  levelTitle: {
    color: colors.accent,
    fontSize: 12
  },
  streakLine: {
    color: colors.text,
    fontWeight: "700"
  },
  freezeNote: {
    color: colors.muted,
    fontSize: 13
  },
  goalRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  goalLabel: {
    color: colors.muted,
    fontSize: 13
  },
  goalValue: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 13
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    overflow: "hidden"
  },
  barFill: {
    height: 8,
    borderRadius: 4
  }
});
