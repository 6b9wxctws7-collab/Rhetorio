export type Profile = {
  id: string;
  email: string | null;
  created_at: string;
  subscription_status: "free" | "premium";
  free_sessions_used: number;
  training_goal?: string | null;
  xp?: number;
  daily_goal_sessions?: number;
  streak_freeze_used_at?: string | null;
};
