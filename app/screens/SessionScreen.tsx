import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ArrowLeft, Lightbulb, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppButton } from "../components/AppButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { VoiceOrb } from "../components/VoiceOrb";
import { colors } from "../constants/colors";
import { typography } from "../constants/typography";
import { useAuth } from "../hooks/useAuth";
import { useConversationSession } from "../hooks/useConversationSession";
import { useRealtimeVoice } from "../hooks/useRealtimeVoice";
import { RootStackParamList } from "../navigation/types";
import { getHint } from "../services/ai/getHint";
import { getScenario } from "../services/supabase/scenarios";
import { defaultVoiceId, getVoicePreference } from "../services/voicePreference";
import { Scenario } from "../types/scenario";

type Props = NativeStackScreenProps<RootStackParamList, "Session">;

export function SessionScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [voiceId, setVoiceId] = useState<string>(defaultVoiceId);
  const conversation = useConversationSession(user?.id, scenario);
  const voice = useRealtimeVoice({ sessionId: conversation.session?.id, scenario, voiceId });
  const [hint, setHint] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);

  async function requestHint() {
    if (!conversation.session || !scenario || hintLoading) return;
    setHintLoading(true);
    try {
      const text = await getHint({ session_id: conversation.session.id, scenario_id: scenario.id });
      setHint(text || "Gerade kein Tipp verfügbar — versuch es gleich nochmal.");
    } catch {
      setHint("Gerade kein Tipp verfügbar — versuch es gleich nochmal.");
    } finally {
      setHintLoading(false);
    }
  }

  useEffect(() => {
    getScenario(route.params.scenarioId).then(setScenario).catch(() => setScenario(null));
  }, [route.params.scenarioId]);

  useEffect(() => {
    getVoicePreference().then(setVoiceId);
  }, []);

  useEffect(() => {
    if (conversation.error === "SESSION_LIMIT_REACHED") navigation.replace("Upgrade");
  }, [conversation.error, navigation]);

  useEffect(() => {
    if (voice.error === "VOICE_LIMIT_REACHED") navigation.replace("Upgrade");
  }, [voice.error, navigation]);

  async function finish() {
    if (voice.connected || voice.mode === "connecting") await voice.stop();
    const analysis = await conversation.finish();
    if (conversation.session && analysis) {
      navigation.replace("Analysis", { sessionId: conversation.session.id, analysis });
    }
  }

  const idle = voice.mode === "idle" || voice.mode === "error";
  const subtitle = (() => {
    if (voice.mode === "speaking") return "Rheto spricht …";
    if (voice.mode === "connected") return "Du bist dran — sprich einfach los.";
    if (voice.mode === "connecting") return "Verbinde …";
    if (voice.mode === "error") return "Verbindung verloren. Tippe zum erneuten Starten.";
    return "Tippe auf die Kugel, um das Gespräch zu starten.";
  })();

  const elapsed = `${Math.floor(conversation.elapsedSeconds / 60)}:${String(conversation.elapsedSeconds % 60).padStart(2, "0")}`;
  const sessionError = conversation.error && conversation.error !== "SESSION_LIMIT_REACHED" ? conversation.error : null;
  const voiceError = voice.error === "VOICE_LIMIT_REACHED"
    ? "Dein monatliches Voice-Kontingent ist aufgebraucht."
    : voice.error;
  const displayError = sessionError ?? voiceError ?? null;

  return (
    <ScreenContainer scroll={false}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.back}>
          <ArrowLeft color={colors.primary} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title}>{scenario?.title ?? "Training"}</Text>
          <Text style={styles.timer}>{elapsed} · Live Voice</Text>
        </View>
      </View>

      {displayError ? <Text style={styles.error}>{displayError}</Text> : null}

      <View style={styles.center}>
        <VoiceOrb mode={voice.mode} onPress={idle ? voice.start : undefined} />
        <Text style={styles.subtitle}>{subtitle}</Text>
        {idle ? <Text style={styles.hint}>Tipp: Kopfhörer nutzen für die beste Klangqualität.</Text> : null}
      </View>

      {hint ? (
        <View style={styles.hintCard}>
          <View style={styles.hintHeader}>
            <Lightbulb color={colors.accent} size={18} />
            <Text style={styles.hintTitle}>Vorschlag</Text>
            <Pressable onPress={() => setHint(null)} hitSlop={8}>
              <X color={colors.muted} size={18} />
            </Pressable>
          </View>
          <Text style={styles.hintBody}>{hint}</Text>
        </View>
      ) : (
        <Pressable onPress={requestHint} style={styles.stuckButton} disabled={!conversation.session || hintLoading}>
          <Lightbulb color={colors.accent} size={17} />
          <Text style={styles.stuckText}>{hintLoading ? "Rheto überlegt …" : "Ich stecke fest — gib mir einen Tipp"}</Text>
        </Pressable>
      )}

      <AppButton
        title="Gespräch beenden & Analyse starten"
        onPress={finish}
        loading={conversation.loading}
        variant="secondary"
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  back: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center"
  },
  headerText: {
    flex: 1
  },
  title: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "800"
  },
  timer: {
    color: colors.muted
  },
  error: {
    color: colors.error
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14
  },
  subtitle: {
    ...typography.body,
    color: colors.primary,
    textAlign: "center"
  },
  hint: {
    color: colors.muted,
    fontSize: 13,
    textAlign: "center"
  },
  stuckButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: colors.softAccent
  },
  stuckText: {
    color: colors.accent,
    fontWeight: "700"
  },
  hintCard: {
    backgroundColor: colors.softAccent,
    borderRadius: 14,
    padding: 14,
    gap: 8
  },
  hintHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  hintTitle: {
    flex: 1,
    color: colors.accent,
    fontWeight: "800"
  },
  hintBody: {
    color: colors.text,
    lineHeight: 21
  }
});
