"use client";

import { useState, useEffect, useMemo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { MoreVertical, Pencil, Trash2, ArrowRight, Video, ExternalLink } from "lucide-react";
import type { JobApplication, JobStatus, Interview } from "@/features/job-applications/types";
import { JOB_STATUSES } from "@/features/job-applications/types";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { cn } from "@/lib/utils";

const STATUS_BORDER_COLOR: Record<JobStatus, string> = {
  Wishlist: "border-l-slate-500",
  Applied: "border-l-primary",
  Interview: "border-l-terracotta",
  Offer: "border-l-success",
  Rejected: "border-l-destructive",
  Ghosted: "border-l-zinc-600",
};

function formatSchedule(date: string | null, time: string | null): string {
  if (!date) return "";
  const d = new Date(date + "T12:00:00");
  const dateStr = d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  if (time?.trim()) {
    const [h, m] = time.trim().split(":");
    const hour = parseInt(h ?? "0", 10);
    const min = m ? parseInt(m, 10) : 0;
    const t = new Date(2000, 0, 1, hour, min);
    const timeStr = t.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${dateStr} at ${timeStr}`;
  }
  return dateStr;
}

function pickDisplayInterview(interviews: Interview[]): Interview | null {
  if (interviews.length === 0) return null;
  const today = new Date().toISOString().slice(0, 10);
  const scheduled = interviews.filter((i) => i.date && (i.status === "Scheduled" || !i.status));
  const sorted = [...scheduled].sort((a, b) => {
    const d = (a.date ?? "").localeCompare(b.date ?? "");
    if (d !== 0) return d;
    return (a.time ?? "").localeCompare(b.time ?? "");
  });
  const upcoming = sorted.filter((i) => (i.date ?? "") >= today);
  return upcoming[0] ?? sorted[0] ?? interviews[0] ?? null;
}

type Props = {
  application: JobApplication;
  interviews?: Interview[];
  onEdit?: (application: JobApplication) => void;
  onDelete?: (application: JobApplication) => void;
  onMove?: (application: JobApplication, newStatus: JobStatus) => void;
  showMoveOption?: boolean;
  disableDrag?: boolean;
  alwaysShowMenu?: boolean;
};

export function JobApplicationCard({
  application,
  interviews = [],
  onEdit,
  onDelete,
  onMove,
  showMoveOption = false,
  disableDrag = false,
  alwaysShowMenu = false,
}: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const displayInterview = useMemo(
    () => (interviews.length > 0 ? pickDisplayInterview(interviews) : null),
    [interviews],
  );
  const scheduleLabel = displayInterview
    ? displayInterview.round_label?.trim() || `Round ${displayInterview.round_number}`
    : null;
  const scheduleText = displayInterview
    ? formatSchedule(displayInterview.date, displayInterview.time)
    : null;
  const hasMeetingLink =
    displayInterview?.interview_type === "Video" && displayInterview?.meeting_link?.trim();

  const canDrag = mounted && !disableDrag;
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: application.id,
    data: { type: "application" as const, application },
  });

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  const hasMenu = onEdit || onDelete || (showMoveOption && onMove);
  const statusBorder = STATUS_BORDER_COLOR[application.current_status as JobStatus];
  const currentStatus = application.current_status as JobStatus;
  const otherStatuses = JOB_STATUSES.filter((s) => s !== currentStatus);

  return (
    <div
      ref={canDrag ? setNodeRef : undefined}
      style={style}
      className={cn(
        "group rounded-lg border border-border border-l-4 bg-card p-3 shadow-sm transition-shadow hover:shadow-md",
        canDrag && "cursor-grab active:cursor-grabbing",
        statusBorder,
        isDragging && "z-50 opacity-90 shadow-lg",
      )}
      {...(canDrag ? { ...attributes, ...listeners } : {})}
      {...(canDrag ? { "aria-label": "Drag to move" as const } : {})}
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground wrap-break-word">{application.company_name}</p>
          <p className="text-sm text-muted-foreground wrap-break-word">{application.role_title}</p>
          {scheduleLabel && scheduleText && (
            <p className="mt-1 text-xs font-medium text-terracotta">
              {scheduleLabel}: {scheduleText}
            </p>
          )}
          {hasMeetingLink && (
            <a
              href={displayInterview!.meeting_link!}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <Video className="h-3.5 w-3.5" />
              Join meeting
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
        {hasMenu && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  "shrink-0 h-8 w-4!  hover:bg-transparent! bg-transparent text-foreground! !hover:border-transparent ",
                  alwaysShowMenu ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                )}
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                aria-label="Open menu"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    onEdit(application);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {showMoveOption && onMove && otherStatuses.length > 0 && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <ArrowRight className="h-4 w-4" />
                    Move to…
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {otherStatuses.map((status) => (
                      <DropdownMenuItem
                        key={status}
                        onClick={(e) => {
                          e.preventDefault();
                          onMove(application, status);
                        }}
                      >
                        {status}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    onDelete(application);
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
