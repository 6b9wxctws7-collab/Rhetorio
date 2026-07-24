import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const onboardingKey = "rhetocoach-onboarding-seen";

export async function getOnboardingSeen() {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return window.localStorage.getItem(onboardingKey) === "true";
  }

  const value = await AsyncStorage.getItem(onboardingKey);
  return value === "true";
}

export async function setOnboardingSeen() {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    window.localStorage.setItem(onboardingKey, "true");
    return;
  }

  await AsyncStorage.setItem(onboardingKey, "true");
}

// The training goal is picked during onboarding, before an account exists.
// Park it locally and apply it to the profile right after the first login.
const pendingGoalKey = "rhetocoach-pending-goal";

export async function setPendingTrainingGoal(goal: string) {
  try {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.localStorage.setItem(pendingGoalKey, goal);
      return;
    }
    await AsyncStorage.setItem(pendingGoalKey, goal);
  } catch {
    // Losing the pending goal is not critical.
  }
}

export async function consumePendingTrainingGoal(): Promise<string | null> {
  try {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const value = window.localStorage.getItem(pendingGoalKey);
      if (value) window.localStorage.removeItem(pendingGoalKey);
      return value;
    }
    const value = await AsyncStorage.getItem(pendingGoalKey);
    if (value) await AsyncStorage.removeItem(pendingGoalKey);
    return value;
  } catch {
    return null;
  }
}
