import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/colors";

type Props = {
  score: number;
  size?: number;
};

export function ScoreCircle({ score, size = 128 }: Props) {
  const borderColor = score >= 80 ? colors.success : score >= 60 ? colors.warning : colors.accent;

  // Count-up-Animation: Der Score zählt beim Einblenden von 0 hoch — macht
  // den Wert-Moment nach der Session spürbarer als eine statische Zahl.
  const animated = useRef(new Animated.Value(0)).current;
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const listener = animated.addListener(({ value }) => setDisplayed(Math.round(value)));
    Animated.timing(animated, {
      toValue: score,
      duration: 1100,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false
    }).start();

    return () => {
      animated.removeListener(listener);
    };
  }, [animated, score]);

  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2, borderColor }]}>
      <Text style={styles.score}>{displayed}</Text>
      <Text style={styles.label}>Score</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignSelf: "center",
    borderWidth: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card
  },
  score: {
    color: colors.primary,
    fontSize: 34,
    fontWeight: "800"
  },
  label: {
    color: colors.muted,
    fontSize: 13
  }
});
