"use client";

import { useDroppable } from "@dnd-kit/core";
import type {
  JobApplication,
  JobStatus,
  Interview,
} from "@/features/job-applications/types";
import { JobApplicationCard } from "./JobApplicationCard";
import { cn } from "@/lib/utils";

const COLUMN_BADGE_BG: Record<JobStatus, string> = {
  Wishlist: "bg-slate-500 text-white",
  Applied: "bg-primary text-primary-foreground",
  Interview: "bg-terracotta text-white",
  Offer: "bg-success text-white",
  Rejected: "bg-destructive text-white",
  Ghosted: "bg-zinc-600 text-white",
};

type Props = {
  status: JobStatus;
  applications: JobApplication[];
  interviewsByApplicationId?: Record<string, Interview[]>;
  isDragging?: boolean;
  onEdit?: (application: JobApplication) => void;
  onDelete?: (application: JobApplication) => void;
};

export function KanbanColumn({
  status,
  applications,
  interviewsByApplicationId = {},
  isDragging,
  onEdit,
  onDelete,
}: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const badgeBg = COLUMN_BADGE_BG[status];

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-muted/30 p-3 transition-colors",
        isOver && "ring-2 ring-rose-500/80 bg-rose-500/10",
      )}
    >
      <h3 className="mb-3 flex shrink-0 items-center gap-2 px-1 text-sm font-semibold text-foreground">
        <span className="truncate">{status}</span>
        <span
          className={cn(
            "inline-flex min-w-6 justify-center rounded-md px-1.5 py-0.5 text-xs font-medium",
            badgeBg,
          )}
        >
          {applications.length}
        </span>
      </h3>
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto",
          isDragging && "overflow-hidden",
        )}
      >
        {applications.map((app) => (
          <JobApplicationCard
            key={app.id}
            application={app}
            interviews={interviewsByApplicationId[app.id]}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
