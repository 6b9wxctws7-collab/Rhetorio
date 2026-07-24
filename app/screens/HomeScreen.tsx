import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "../components/AppButton";
import { AppCard } from "../components/AppCard";
import { ScreenContainer } from "../components/ScreenContainer";
import { ScenarioCard } from "../components/ScenarioCard";
import { StatCard } from "../components/StatCard";
import { colors } from "../constants/colors";
import { typography } from "../constants/typography";
import { useAuth } from "../hooks/useAuth";
import { useScenarios } from "../hooks/useScenarios";
import { RootStackParamList } from "../navigation/types";
import { getHomeStats, getStreak, HomeStats } from "../services/supabase/sessions";

function dayOfYear(date: Date) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86400000);
}

function greetingForNow() {
  const hour = new Date().getHours();
  if (hour < 11) return "Guten Morgen";
  if (hour < 18) return "Guten Tag";
  return "Guten Abend";
}

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const { scenarios } = useScenarios();
  const [stats, setStats] = useState<HomeStats | null>(null);
  const [streak, setStreak] = useState(0);
  const quickStarts = scenarios.slice(0, 3);
  const hasTrained = (stats?.sessionsThisWeek ?? 0) > 0 || stats?.bestScore != null;

  // Deterministic daily rotation so every user sees the same exercise on a
  // given day without any backend involvement.
  const dailyScenario = useMemo(() => {
    if (!scenarios.length) return null;
    return scenarios[dayOfYear(new Date()) % scenarios.length];
  }, [scenarios]);

  useFocusEffect(
    useCallback(() => {
      if (!user?.id) return;
      getHomeStats(user.id)
        .then(setStats)
        .catch(() => setStats(null));
      getStreak(user.id)
        .then(setStreak)
        .catch(() => setStreak(0));
    }, [user?.id])
  );

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.greeting}>{greetingForNow()}</Text>
        <Text style={styles.title}>Was möchtest du heute trainieren?</Text>
      </View>

      <AppCard>
        <Text style={styles.cardLabel}>Tagesübung</Text>
        <Text style={styles.cardTitle}>{dailyScenario?.title ?? "Smalltalk auf einem Networking-Event"}</Text>
        <Text style={styles.cardText}>{dailyScenario?.description ?? "Ein klarer Gesprächseinstieg und mindestens zwei offene Rückfragen."}</Text>
        <AppButton
          title="Jetzt üben"
          onPress={() => dailyScenario && navigation.navigate("Session", { scenarioId: dailyScenario.id })}
          disabled={!dailyScenario}
        />
      </AppCard>

      <AppCard>
        <Text style={styles.cardLabel}>Eigenes Training</Text>
        <Text style={styles.cardTitle}>Lade dein Material hoch</Text>
        <Text style={styles.cardText}>Skript, CV oder Manuskript hochladen — Rheto baut daraus ein Quiz, Bewerbungsgespräch oder Pitch-Sparring.</Text>
        <AppButton
          title="Material hochladen"
          onPress={() => navigation.navigate("MainTabs", { screen: "CustomTraining" } as never)}
          variant="secondary"
        />
      </AppCard>

      {/* Neue Nutzer sehen einen motivierenden Einstieg statt "0 / –". */}
      {hasTrained ? (
        <View style={styles.stats}>
          <StatCard label="Tage-Streak" value={streak > 0 ? `${streak} 🔥` : "–"} />
          <StatCard label="Trainings diese Woche" value={stats?.sessionsThisWeek ?? 0} />
          <StatCard label="Bester Score" value={stats?.bestScore ?? "–"} />
        </View>
      ) : (
        <AppCard>
          <Text style={styles.cardLabel}>Dein Start</Text>
          <Text style={styles.cardTitle}>In 3 Minuten zu deinem ersten Score</Text>
          <Text style={styles.cardText}>
            Starte eine kurze Session — Rheto analysiert dein Gespräch und zeigt dir sofort, was schon stark ist und
            was du verbessern kannst.
          </Text>
        </AppCard>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Schnellstart</Text>
        {quickStarts.map((scenario) => (
          <ScenarioCard key={scenario.id} scenario={scenario} onPress={() => navigation.navigate("ScenarioDetail", { scenarioId: scenario.id })} />
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 6
  },
  greeting: {
    color: colors.muted,
    fontSize: 16
  },
  title: {
    ...typography.h1,
    color: colors.primary
  },
  cardLabel: {
    color: colors.accent,
    fontWeight: "800"
  },
  cardTitle: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: "800"
  },
  cardText: {
    color: colors.muted,
    lineHeight: 21
  },
  stats: {
    flexDirection: "row",
    gap: 12
  },
  section: {
    gap: 12
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.primary
  }
});
