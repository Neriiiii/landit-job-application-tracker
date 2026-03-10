"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Pencil, Target } from "lucide-react";
import { setWeeklyApplicationGoal } from "@/app/actions/user-settings";

function getWeekRange(): { start: Date; end: Date } {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const start = new Date(now);
  start.setDate(now.getDate() + mondayOffset);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function formatWeekLabel(): string {
  const { start, end } = getWeekRange();
  return `${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${end.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
}

interface DashboardWeeklyGoalProps {
  userId: string;
  applicationsThisWeek: number;
  initialGoal: number;
}

export function DashboardWeeklyGoal({
  userId,
  applicationsThisWeek,
  initialGoal,
}: DashboardWeeklyGoalProps) {
  const router = useRouter();
  const [goal, setGoal] = useState(initialGoal);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progress = initialGoal > 0 ? Math.min(100, (applicationsThisWeek / initialGoal) * 100) : 0;
  const isComplete = applicationsThisWeek >= initialGoal;

  async function handleSaveGoal() {
    if (goal < 1 || goal > 50) return;
    setIsSubmitting(true);
    const result = await setWeeklyApplicationGoal(userId, goal);
    setIsSubmitting(false);
    if (result.success) {
      setIsEditing(false);
      router.refresh();
    }
  }

  return (
    <Card className="rounded-xl border-border/80 bg-card justify-center shadow-sm h-full">
      <CardHeader className="flex flex-row items-start justify-between gap-2 ">
        <div className="min-w-0 space-y-2">
          <CardTitle className="flex items-center gap-1.5 font-semibold">
            <Target className="h-5 w-5 shrink-0 text-muted-foreground" />
            Weekly goal
          </CardTitle>
          <CardDescription>Track how many applications you send this week</CardDescription>
        </div>
        {!isEditing ? (
          <Button
            variant="ghost"
            size="icon-xs"
            className="shrink-0"
            onClick={() => setIsEditing(true)}
            aria-label="Edit weekly goal"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-2 ">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-bold tabular-nums text-foreground">
            {applicationsThisWeek}
          </span>
          <span className="text-xs text-muted-foreground">
            /{" "}
            {isEditing ? (
              <span className="inline-flex items-center gap-1">
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={goal}
                  onChange={(e) => setGoal(Number(e.target.value) || 1)}
                  className="h-6 w-12 text-center text-xs tabular-nums"
                />
                <Button
                  size="xs"
                  className="h-6 px-2"
                  onClick={handleSaveGoal}
                  disabled={isSubmitting || goal < 1 || goal > 50}
                >
                  Save
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  className="h-6 px-2"
                  onClick={() => {
                    setGoal(initialGoal);
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
              </span>
            ) : (
              initialGoal
            )}{" "}
            apps
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-progress-track">
            <div
              className={`h-full rounded-full transition-all duration-300 ${isComplete ? "bg-success" : "bg-primary"}`}
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
          {isComplete && (
            <span className="shrink-0 text-[10px] font-medium text-success">Done</span>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground">{formatWeekLabel()}</p>
      </CardContent>
    </Card>
  );
}
