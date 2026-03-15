"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { CheckSquare } from "lucide-react";
import type { ChecklistItem } from "@/lib/types/checklist";
import { CHECKLIST_STATUSES, CHECKLIST_STATUS_COLORS, type ChecklistStatus } from "@/lib/types/checklist";

type Props = { items: ChecklistItem[] };

export function ChecklistProgressCard({ items }: Props) {
  const total = items.length;
  const byStatus = CHECKLIST_STATUSES.reduce(
    (acc, status) => {
      acc[status] = items.filter((i) => i.status === status).length;
      return acc;
    },
    {} as Record<ChecklistStatus, number>
  );

  const size = 120;
  const strokeWidth = 20;
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  const segments = CHECKLIST_STATUSES.map((status) => {
    const count = byStatus[status];
    const length = total > 0 ? (count / total) * circumference : 0;
    const seg = { status, count, length, offset };
    offset += length;
    return seg;
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <CheckSquare className="h-4 w-4" />
          Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center">
          <div className="relative" style={{ width: size, height: size }}>
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className="-rotate-90"
              aria-hidden
            >
              {total === 0 ? (
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  className="text-muted"
                />
              ) : (
                segments.map(({ status, count, length, offset: segOffset }) => {
                  if (count === 0) return null;
                  return (
                    <circle
                      key={status}
                      cx={cx}
                      cy={cy}
                      r={r}
                      fill="none"
                      stroke={CHECKLIST_STATUS_COLORS[status]}
                      strokeWidth={strokeWidth}
                      strokeDasharray={`${length} ${circumference}`}
                      strokeDashoffset={-segOffset}
                      strokeLinecap="round"
                      className="transition-[stroke-dasharray,stroke-dashoffset] duration-300"
                    />
                  );
                })
              )}
            </svg>
            <div
              className="absolute inset-0 flex items-center justify-center text-xl font-semibold tabular-nums"
              aria-hidden
            >
              {total}
            </div>
          </div>
          <p className="sr-only">
            {total} total items: {CHECKLIST_STATUSES.map((s) => `${byStatus[s]} ${s}`).join(", ")}
          </p>
          <div className="mt-4 flex w-full flex-wrap justify-center gap-6">
            {CHECKLIST_STATUSES.map((status) => (
              <div
                key={status}
                className="flex flex-col items-center gap-0.5 text-center"
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: CHECKLIST_STATUS_COLORS[status] }}
                  aria-hidden
                />
                <span className="text-sm font-medium tabular-nums">
                  {byStatus[status]}
                </span>
                <span className="text-xs text-muted-foreground">{status}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
