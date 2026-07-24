import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ArrowLeft, Check } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppButton } from "../components/AppButton";
import { AppCard } from "../components/AppCard";
import { ScreenContainer } from "../components/ScreenContainer";
import { colors } from "../constants/colors";
import { typography } from "../constants/typography";
import { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Upgrade">;

// Nutzen-orientierte Benefits: nicht was Premium *hat*, sondern was der
// Nutzer damit *erreicht*.
const benefits = [
  "Unbegrenzt üben — auch kurz vor dem wichtigen Gespräch",
  "Alle 30+ Szenarien, inkl. Gehalt, Führung & Konflikt",
  "Detaillierte Analysen mit besseren Formulierungen",
  "Dein Fortschritt über Wochen sichtbar",
  "Live-Voice-Training (im Browser)"
];

export function UpgradeScreen({ navigation }: Props) {
  return (
    <ScreenContainer>
      <Pressable onPress={() => navigation.goBack()} style={styles.back}>
        <ArrowLeft color={colors.primary} />
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.kicker}>RhetoCoach Premium</Text>
        <Text style={styles.title}>Werde souverän in den Gesprächen, die zählen.</Text>
        <Text style={styles.subtitle}>
          Eine einzige gelungene Gehaltsverhandlung zahlt Premium für Jahre.
        </Text>
      </View>

      <AppCard>
        {benefits.map((benefit) => (
          <View key={benefit} style={styles.benefit}>
            <Check color={colors.success} size={19} />
            <Text style={styles.benefitText}>{benefit}</Text>
          </View>
        ))}
      </AppCard>

      <View style={styles.prices}>
        <AppCard>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Beliebt — 33% günstiger</Text>
          </View>
          <Text style={styles.price}>79,99 €/Jahr</Text>
          <Text style={styles.muted}>Das sind nur 0,22 € pro Tag</Text>
        </AppCard>
        <AppCard>
          <Text style={styles.price}>9,99 €/Monat</Text>
          <Text style={styles.muted}>Monatlich kündbar</Text>
        </AppCard>
      </View>

      <AppButton title="Premium freischalten" onPress={() => navigation.goBack()} />
      <Text style={styles.notice}>
        Hinweis: Die Zahlung ist noch nicht angebunden (RevenueCat folgt). Der Kauf ist aktuell nicht möglich.
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  back: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card
  },
  header: {
    gap: 10
  },
  kicker: {
    color: colors.accent,
    fontWeight: "800"
  },
  title: {
    ...typography.title,
    color: colors.primary
  },
  subtitle: {
    color: colors.muted,
    lineHeight: 21
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.softAccent,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  badgeText: {
    color: colors.accent,
    fontWeight: "800",
    fontSize: 12
  },
  benefit: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center"
  },
  benefitText: {
    color: colors.text,
    fontWeight: "700"
  },
  prices: {
    gap: 12
  },
  price: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: "800"
  },
  muted: {
    color: colors.muted
  },
  notice: {
    color: colors.muted,
    textAlign: "center",
    lineHeight: 19
  }
});
