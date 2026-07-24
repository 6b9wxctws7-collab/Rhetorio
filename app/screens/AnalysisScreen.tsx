import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "../components/AppButton";
import { AppCard } from "../components/AppCard";
import { ScoreCircle } from "../components/ScoreCircle";
import { ScreenContainer } from "../components/ScreenContainer";
import { colors } from "../constants/colors";
import { typography } from "../constants/typography";
import { useAnalysis } from "../hooks/useAnalysis";
import { useAuth } from "../hooks/useAuth";
import { RootStackParamList } from "../navigation/types";
import { canStartSession } from "../services/supabase/profiles";
import { getPreviousScore } from "../services/supabase/sessions";
import { scoreRows } from "../utils/calculateScores";

type Props = NativeStackScreenProps<RootStackParamList, "Analysis">;

export function AnalysisScreen({ navigation, route }: Props) {
  const { analysis: loadedAnalysis, loading, error } = useAnalysis(route.params.sessionId);
  const analysis = route.params.analysis ?? loadedAnalysis;
  const { user } = useAuth();
  const [previousScore, setPreviousScore] = useState<number | null>(null);
  const [freeInfo, setFreeInfo] = useState<{ used: number; limit: number } | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    getPreviousScore(user.id, route.params.sessionId)
      .then(setPreviousScore)
      .catch(() => setPreviousScore(null));
    canStartSession(user.id)
      .then((info) => setFreeInfo(info.status === "premium" ? null : { used: info.used, limit: info.limit }))
      .catch(() => setFreeInfo(null));
  }, [user?.id, route.params.sessionId]);

  const delta = analysis && previousScore != null ? analysis.score_total - previousScore : null;

  if (!analysis) {
    return (
      <ScreenContainer>
        <Text style={styles.title}>Analyse</Text>
        <Text style={styles.muted}>{loading ? "Rheto wertet dein Gespräch aus..." : error ?? "Noch keine Analyse gefunden."}</Text>
        <AppButton title="Zum Verlauf" onPress={() => navigation.navigate("MainTabs")} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.kicker}>Dein Feedback</Text>
        <Text style={styles.title}>Rheto hat dein Gespräch analysiert</Text>
      </View>

      <ScoreCircle score={analysis.score_total} />

      {delta != null && delta !== 0 && (
        <Text style={[styles.delta, { color: delta > 0 ? colors.success : colors.warning }]}>
          {delta > 0 ? `▲ +${delta} seit deiner letzten Session` : `▼ ${delta} seit deiner letzten Session`}
        </Text>
      )}

      <AppCard>
        <Text style={styles.cardTitle}>Kurzfazit</Text>
        <Text style={styles.body}>{analysis.summary}</Text>
      </AppCard>

      <AppCard>
        <Text style={styles.cardTitle}>Top 3 Stärken</Text>
        {analysis.strengths.slice(0, 3).map((item) => (
          <Text key={item} style={styles.listItem}>• {item}</Text>
        ))}
      </AppCard>

      <AppCard>
        <Text style={styles.cardTitle}>Top 3 Verbesserungen</Text>
        {analysis.weaknesses.slice(0, 3).map((item) => (
          <Text key={item} style={styles.listItem}>• {item}</Text>
        ))}
      </AppCard>

      <AppCard>
        <Text style={styles.cardTitle}>Bessere Formulierungen</Text>
        {analysis.better_phrases.map((phrase) => (
          <View key={`${phrase.original}-${phrase.improved}`} style={styles.phrase}>
            <Text style={styles.original}>{phrase.original}</Text>
            <Text style={styles.improved}>{phrase.improved}</Text>
            <Text style={styles.reason}>{phrase.reason}</Text>
          </View>
        ))}
      </AppCard>

      <AppCard>
        <Text style={styles.cardTitle}>Detail-Scores</Text>
        {scoreRows(analysis).map((row) => (
          <View key={row.label} style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>{row.label}</Text>
            <Text style={styles.scoreValue}>{row.value}{row.label === "Füllwörter" ? "" : "/100"}</Text>
          </View>
        ))}
      </AppCard>

      <AppCard>
        <Text style={styles.cardTitle}>Nächste Übung</Text>
        <Text style={styles.body}>{analysis.next_exercise}</Text>
      </AppCard>

      {/* Soft-Paywall am Wert-Moment: Free-Nutzer sehen direkt nach der
          Analyse, wie viele Gratis-Sessions übrig sind — mit Upgrade-Pfad. */}
      {freeInfo && (
        <AppCard>
          <Text style={styles.cardTitle}>
            {Math.max(0, freeInfo.limit - freeInfo.used) > 0
              ? `Noch ${Math.max(0, freeInfo.limit - freeInfo.used)} von ${freeInfo.limit} Gratis-Sessions diesen Monat`
              : "Deine Gratis-Sessions für diesen Monat sind aufgebraucht"}
          </Text>
          <Text style={styles.body}>
            Mit Premium trainierst du ohne Limit und behältst deinen Fortschritt im Blick.
          </Text>
          <AppButton title="Premium ansehen" onPress={() => navigation.navigate("Upgrade")} variant="secondary" />
        </AppCard>
      )}

      <AppButton title="Weiter trainieren" onPress={() => navigation.navigate("MainTabs")} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8
  },
  kicker: {
    color: colors.accent,
    fontWeight: "800"
  },
  title: {
    ...typography.h1,
    color: colors.primary
  },
  muted: {
    color: colors.muted
  },
  delta: {
    textAlign: "center",
    fontWeight: "800"
  },
  cardTitle: {
    color: colors.primary,
    fontWeight: "800",
    fontSize: 17
  },
  body: {
    color: colors.text,
    lineHeight: 22
  },
  listItem: {
    color: colors.text,
    lineHeight: 22
  },
  phrase: {
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  original: {
    color: colors.error
  },
  improved: {
    color: colors.success,
    fontWeight: "800"
  },
  reason: {
    color: colors.muted,
    lineHeight: 20
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  scoreLabel: {
    color: colors.text
  },
  scoreValue: {
    color: colors.primary,
    fontWeight: "800"
  }
});
