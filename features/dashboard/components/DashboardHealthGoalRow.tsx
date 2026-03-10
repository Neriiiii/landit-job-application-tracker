import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Heart } from "lucide-react";
import { DashboardWeeklyGoal } from "./DashboardWeeklyGoal";
import type { HealthStatus } from "../types";

interface DashboardJobSearchHealthProps {
  healthStatus: HealthStatus;
  healthMessages: string[];
}

export function DashboardJobSearchHealth({
  healthStatus,
  healthMessages,
}: DashboardJobSearchHealthProps) {
  return (
    <Card className="h-full rounded-2xl border-border/80 bg-card shadow-sm">
      <CardHeader className="flex min-h-16 xl:flex-row lg:flex-col items-start justify-between gap-2">
        <div className="min-w-0 space-y-2">
          <CardTitle className="flex items-center gap-1.5 font-semibold">
            <Heart className="h-5 w-5 shrink-0 text-muted-foreground" />
            Job search health
          </CardTitle>
          <CardDescription className="text-base">How your search is going</CardDescription>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-sm font-medium ${
            healthStatus === "good"
              ? "bg-success/15 text-primary"
              : healthStatus === "on-track"
                ? "bg-primary/15 text-primary"
                : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
          }`}
        >
          {healthStatus === "good"
            ? "Good"
            : healthStatus === "on-track"
              ? "On track"
              : "Needs attention"}
        </span>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2">
          {healthMessages.map((msg, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="mt-2.25 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
              <span className="leading-relaxed">{msg}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

interface DashboardHealthGoalRowProps {
  healthStatus: HealthStatus;
  healthMessages: string[];
  userId: string;
  applicationsThisWeek: number;
  weeklyGoal: number | null;
}

export function DashboardHealthGoalRow({
  healthStatus,
  healthMessages,
  userId,
  applicationsThisWeek,
  weeklyGoal,
}: DashboardHealthGoalRowProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <DashboardJobSearchHealth healthStatus={healthStatus} healthMessages={healthMessages} />
      <DashboardWeeklyGoal
        userId={userId}
        applicationsThisWeek={applicationsThisWeek}
        initialGoal={weeklyGoal ?? 0}
      />
    </div>
  );
}
