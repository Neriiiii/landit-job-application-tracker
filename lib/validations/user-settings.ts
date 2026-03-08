import { z } from "zod";

const MIN_WEEKLY_GOAL = 1;
const MAX_WEEKLY_GOAL = 50;

export const weeklyGoalSchema = z
  .number()
  .int()
  .min(MIN_WEEKLY_GOAL, `Goal must be at least ${MIN_WEEKLY_GOAL}`)
  .max(MAX_WEEKLY_GOAL, `Goal must be at most ${MAX_WEEKLY_GOAL}`);

export type WeeklyGoalInput = z.infer<typeof weeklyGoalSchema>;
