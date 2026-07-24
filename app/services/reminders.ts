import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Tägliche Trainings-Erinnerung als lokale Notification (kein Server nötig).
// Auf Web wird geplantes Ausliefern nicht unterstützt — dort ist alles no-op
// und der Toggle wird gar nicht erst angezeigt.

const storageKey = "rhetocoach-reminder";
export const REMINDER_HOUR = 19;

export const remindersSupported = Platform.OS !== "web";

const reminderMessages = [
  "🔥 Dein Streak wartet! 3 Minuten Training reichen für heute.",
  "🎯 Kurzes Gespräch gefällig? Dein Tagesziel ist nur eine Session entfernt.",
  "💬 Wer heute übt, spricht morgen souveräner. Auf geht's!"
];

export async function isReminderEnabled(): Promise<boolean> {
  if (!remindersSupported) return false;
  try {
    return (await AsyncStorage.getItem(storageKey)) === "on";
  } catch {
    return false;
  }
}

export async function enableDailyReminder(): Promise<boolean> {
  if (!remindersSupported) return false;

  const permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted) return false;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("training-reminder", {
      name: "Trainings-Erinnerung",
      importance: Notifications.AndroidImportance.DEFAULT
    });
  }

  await Notifications.cancelAllScheduledNotificationsAsync();
  const message = reminderMessages[Math.floor(Math.random() * reminderMessages.length)];
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "RhetoCoach",
      body: message
    },
    trigger: {
      hour: REMINDER_HOUR,
      minute: 0,
      repeats: true,
      channelId: Platform.OS === "android" ? "training-reminder" : undefined
    }
  });

  await AsyncStorage.setItem(storageKey, "on");
  return true;
}

export async function disableDailyReminder(): Promise<void> {
  if (!remindersSupported) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  await AsyncStorage.setItem(storageKey, "off");
}
