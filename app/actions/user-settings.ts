"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUserInAction } from "@/lib/supabase/auth";
import { toSafeMessage } from "@/lib/safe-errors";
import { weeklyGoalSchema } from "@/lib/validations/user-settings";

const DEFAULT_WEEKLY_GOAL = 5;

export async function getWeeklyApplicationGoal(userId: string): Promise<number> {
  const user = await requireUserInAction();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_settings")
    .select("weekly_application_goal")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return DEFAULT_WEEKLY_GOAL;
  return data?.weekly_application_goal ?? DEFAULT_WEEKLY_GOAL;
}

export async function setWeeklyApplicationGoal(
  userId: string,
  goal: number
): Promise<{ success: boolean; error?: string }> {
  const user = await requireUserInAction();
  const parsed = weeklyGoalSchema.safeParse(goal);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map((e) => e.message).join("; ") || "Invalid goal." };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("user_settings").upsert(
    {
      user_id: user.id,
      weekly_application_goal: parsed.data,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
  if (error) return { success: false, error: toSafeMessage(error, "setWeeklyApplicationGoal") };
  return { success: true };
}
