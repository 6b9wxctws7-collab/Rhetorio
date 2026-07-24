import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { LogOut } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Switch, Text, View } from "react-native";

import { AppButton } from "../components/AppButton";
import { AppCard } from "../components/AppCard";
import { ScreenContainer } from "../components/ScreenContainer";
import { VoicePicker } from "../components/VoicePicker";
import { colors } from "../constants/colors";
import { trainingGoals } from "../constants/goals";
import { typography } from "../constants/typography";
import { useAuth } from "../hooks/useAuth";
import { RootStackParamList } from "../navigation/types";
import { achievementCatalog, getXp, levelForXp, listUnlockedAchievements } from "../services/gamification";
import {
  disableDailyReminder,
  enableDailyReminder,
  isReminderEnabled,
  REMINDER_HOUR,
  remindersSupported
} from "../services/reminders";
import { signOut } from "../services/supabase/auth";
import { updateTrainingGoal } from "../services/supabase/profiles";
import { defaultVoiceId, getVoicePreference, setVoicePreference } from "../services/voicePreference";

export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, profile, refreshProfile } = useAuth();
  const [voiceId, setVoiceId] = useState<string>(defaultVoiceId);
  const [savingGoal, setSavingGoal] = useState(false);
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [xp, setXp] = useState(0);
  const [reminderOn, setReminderOn] = useState(false);

  useEffect(() => {
    getVoicePreference().then(setVoiceId);
    isReminderEnabled().then(setReminderOn);
  }, []);

  async function toggleReminder(next: boolean) {
    if (next) {
      const granted = await enableDailyReminder();
      setReminderOn(granted);
      if (!granted) {
        Alert.alert(
          "Benachrichtigungen deaktiviert",
          "Bitte erlaube RhetoCoach Benachrichtigungen in den Systemeinstellungen."
        );
      }
    } else {
      await disableDailyReminder();
      setReminderOn(false);
    }
  }

  useEffect(() => {
    if (!user?.id) return;
    listUnlockedAchievements(user.id)
      .then(setUnlocked)
      .catch(() => setUnlocked(new Set()));
    getXp(user.id)
      .then(setXp)
      .catch(() => setXp(0));
  }, [user?.id]);

  const level = levelForXp(xp);

  async function pickVoice(nextVoiceId: string) {
    setVoiceId(nextVoiceId);
    await setVoicePreference(nextVoiceId);
  }

  async function pickGoal(goal: string) {
    if (!user?.id || savingGoal || goal === profile?.training_goal) return;
    setSavingGoal(true);
    try {
      await updateTrainingGoal(user.id, goal);
      await refreshProfile();
    } catch (error) {
      Alert.alert("Speichern fehlgeschlagen", error instanceof Error ? error.message : "Bitte versuche es erneut.");
    } finally {
      setSavingGoal(false);
    }
  }

  async function logout() {
    try {
      await signOut();
    } catch (error) {
      Alert.alert("Logout fehlgeschlagen", error instanceof Error ? error.message : "Bitte versuche es erneut.");
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Profil</Text>
        <Text style={styles.subtitle}>{user?.email}</Text>
      </View>

      <AppCard>
        <Text style={styles.label}>Abo-Status</Text>
        <Text style={styles.status}>{profile?.subscription_status ?? "free"}</Text>
        <AppButton title="Premium ansehen" onPress={() => navigation.navigate("Upgrade")} variant="secondary" />
      </AppCard>

      <AppCard>
        <Text style={styles.label}>Trainingsziel</Text>
        <View style={styles.goalGrid}>
          {trainingGoals.map((goal) => {
            const selected = goal === (profile?.training_goal ?? "Selbstbewusster sprechen");
            return (
              <Pressable key={goal} onPress={() => pickGoal(goal)} style={[styles.goalChip, selected && styles.goalChipSelected]}>
                <Text style={[styles.goalChipText, selected && styles.goalChipTextSelected]}>{goal}</Text>
              </Pressable>
            );
          })}
        </View>
      </AppCard>

      <AppCard>
        <Text style={styles.label}>Level & Abzeichen</Text>
        <Text style={styles.levelLine}>
          Level {level.level} · {level.title} · {xp} XP
        </Text>
        <View style={styles.badgeGrid}>
          {achievementCatalog.map((achievement) => {
            const isUnlocked = unlocked.has(achievement.key);
            return (
              <View key={achievement.key} style={[styles.badge, !isUnlocked && styles.badgeLocked]}>
                <Text style={[styles.badgeEmoji, !isUnlocked && styles.badgeEmojiLocked]}>
                  {isUnlocked ? achievement.emoji : "🔒"}
                </Text>
                <Text style={[styles.badgeTitle, !isUnlocked && styles.badgeTitleLocked]}>{achievement.title}</Text>
                <Text style={styles.badgeDescription}>{achievement.description}</Text>
              </View>
            );
          })}
        </View>
      </AppCard>

      <AppCard>
        <Text style={styles.label}>Verlauf</Text>
        <Text style={styles.body}>Sieh dir abgeschlossene Trainings, Scores und Tipps an.</Text>
        <AppButton title="Verlauf öffnen" onPress={() => navigation.navigate("History")} variant="secondary" />
      </AppCard>

      <AppCard>
        <VoicePicker
          value={voiceId}
          onChange={pickVoice}
          title="Rhetos Stimme"
          subtitle="Wird beim nächsten Voice-Training verwendet."
        />
      </AppCard>

      {remindersSupported && (
        <AppCard>
          <View style={styles.reminderRow}>
            <View style={styles.reminderText}>
              <Text style={styles.label}>Tägliche Erinnerung</Text>
              <Text style={styles.body}>Jeden Tag um {REMINDER_HOUR}:00 Uhr — damit dein Streak nicht reißt.</Text>
            </View>
            <Switch value={reminderOn} onValueChange={toggleReminder} />
          </View>
        </AppCard>
      )}

      <AppCard>
        <Text style={styles.label}>Datenschutz</Text>
        <Text style={styles.body}>Deine Gespräche sind privat. Audiofunktionen werden später optional mit automatischem Löschen unterstützt.</Text>
      </AppCard>

      <AppCard>
        <Text style={styles.label}>Sprache</Text>
        <Text style={styles.value}>Deutsch</Text>
        <Text style={styles.label}>Support</Text>
        <Text style={styles.value}>support@rhetocoach.app</Text>
      </AppCard>

      <Pressable onPress={logout} style={styles.logout}>
        <LogOut color={colors.error} size={19} />
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 6
  },
  title: {
    ...typography.title,
    color: colors.primary
  },
  subtitle: {
    color: colors.muted
  },
  label: {
    color: colors.muted,
    fontWeight: "700"
  },
  levelLine: {
    color: colors.primary,
    fontWeight: "800",
    fontSize: 16
  },
  badgeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  badge: {
    width: "47%",
    backgroundColor: colors.softAccent,
    borderRadius: 14,
    padding: 12,
    gap: 4
  },
  badgeLocked: {
    backgroundColor: colors.background
  },
  badgeEmoji: {
    fontSize: 24
  },
  badgeEmojiLocked: {
    opacity: 0.6
  },
  badgeTitle: {
    color: colors.primary,
    fontWeight: "800",
    fontSize: 13
  },
  badgeTitleLocked: {
    color: colors.muted
  },
  badgeDescription: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16
  },
  reminderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  reminderText: {
    flex: 1,
    gap: 4
  },
  status: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  value: {
    color: colors.primary,
    fontWeight: "700"
  },
  goalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  goalChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border
  },
  goalChipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.softAccent
  },
  goalChipText: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 13
  },
  goalChipTextSelected: {
    color: colors.accent
  },
  body: {
    color: colors.text,
    lineHeight: 22
  },
  logout: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16
  },
  logoutText: {
    color: colors.error,
    fontWeight: "800"
  }
});
