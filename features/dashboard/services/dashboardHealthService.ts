import type { HealthStatus } from "../types";

export function getJobSearchHealth(
  total: number,
  activeCount: number,
  offerCount: number,
  applicationsThisWeek: number,
  weeklyGoal: number | null,
  interviewsCount: number,
  byStatus: { Wishlist: number; Applied: number },
): { healthStatus: HealthStatus; healthMessages: string[] } {
  const weeklyTarget = weeklyGoal ?? 5;
  const goalProgress = weeklyTarget > 0 ? applicationsThisWeek / weeklyTarget : 0;
  const hasPipeline = activeCount > 0;
  const hasInterviews = interviewsCount > 0;
  const hasOffer = offerCount > 0;

  let healthStatus: HealthStatus = "on-track";
  const healthMessages: string[] = [];

  if (total === 0) {
    healthStatus = "needs-attention";
    healthMessages.push("Add your first application to start tracking.");
  } else if (hasOffer) {
    healthStatus = "good";
    healthMessages.push("You have an offer in hand.");
    if (activeCount > 0) healthMessages.push("Keep options open until you decide.");
  } else if (hasInterviews) {
    healthMessages.push("You have upcoming interviews—prepare and follow up.");
    if (goalProgress >= 0.5) {
      healthStatus = "good";
      healthMessages.push("Weekly application pace is on target.");
    } else if (applicationsThisWeek > 0) {
      healthStatus = "on-track";
      healthMessages.push("Keep applying while you interview.");
    } else if (weeklyTarget > 0) {
      healthStatus = "needs-attention";
      healthMessages.push("Try to send a few more applications this week.");
    }
  } else if (hasPipeline) {
    if (goalProgress >= 1) {
      healthStatus = "good";
      healthMessages.push("You hit your weekly application goal.");
    } else if (goalProgress >= 0.5 || applicationsThisWeek > 0) {
      healthStatus = "on-track";
      healthMessages.push("You're applying regularly.");
    }
    if (byStatus.Wishlist > 0) healthMessages.push("You have applications ready to send.");
    if (byStatus.Applied > 0 && healthMessages.length < 2)
      healthMessages.push("Waiting to hear back on some applications.");
  } else {
    healthStatus = "needs-attention";
    healthMessages.push("Add or move applications to keep your pipeline active.");
  }
  if (healthMessages.length === 0)
    healthMessages.push("Keep tracking and applying—momentum helps.");

  return { healthStatus, healthMessages };
}
