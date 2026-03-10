"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import type { JobApplication, Interview } from "@/features/job-applications/types";
import { JOB_STATUSES, type JobStatus } from "@/features/job-applications/types";
import { updateJobApplicationStatus } from "@/features/job-applications/api";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { KanbanColumn } from "./KanbanColumn";
import { JobApplicationCard } from "./JobApplicationCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
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
  userId: string;
  initialApplications: JobApplication[];
  interviewsByApplicationId?: Record<string, Interview[]>;
  onEdit?: (application: JobApplication) => void;
  onDelete?: (application: JobApplication) => void;
};

function groupByStatus(applications: JobApplication[]): Record<JobStatus, JobApplication[]> {
  const groups = Object.fromEntries(JOB_STATUSES.map((s) => [s, [] as JobApplication[]])) as Record<
    JobStatus,
    JobApplication[]
  >;
  for (const app of applications) {
    const status = app.current_status as JobStatus;
    if (groups[status]) groups[status].push(app);
  }
  return groups;
}

const MAX_LG_QUERY = "(max-width: 1023px)";

export function KanbanBoard({
  userId,
  initialApplications,
  interviewsByApplicationId = {},
  onEdit,
  onDelete,
}: Props) {
  const router = useRouter();
  const isMaxLg = useMediaQuery(MAX_LG_QUERY);
  const [applications, setApplications] = useState(initialApplications);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [columnModalStatus, setColumnModalStatus] = useState<JobStatus | null>(null);

  useEffect(() => {
    setApplications(initialApplications);
  }, [initialApplications]);

  useEffect(() => {
    if (activeId) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [activeId]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const applicationId = active.id as string;
      const newStatus = over.id as JobStatus;
      if (!JOB_STATUSES.includes(newStatus)) return;
      const app = applications.find((a) => a.id === applicationId);
      if (!app || app.current_status === newStatus) return;
      setApplications((prev) =>
        prev.map((a) => (a.id === applicationId ? { ...a, current_status: newStatus } : a)),
      );
      try {
        await updateJobApplicationStatus(applicationId, userId, newStatus);
      } catch {
        setApplications(initialApplications);
      }
    },
    [applications, userId, initialApplications],
  );

  const groups = groupByStatus(applications);
  const activeApp = activeId ? applications.find((a) => a.id === activeId) : null;

  const handleMoveInModal = useCallback(
    async (application: JobApplication, newStatus: JobStatus) => {
      if (application.current_status === newStatus) return;
      setApplications((prev) =>
        prev.map((a) => (a.id === application.id ? { ...a, current_status: newStatus } : a)),
      );
      try {
        await updateJobApplicationStatus(application.id, userId, newStatus);
      } catch {
        setApplications(initialApplications);
      }
    },
    [userId, initialApplications],
  );

  if (isMaxLg) {
    return (
      <>
        <div className="grid grid-cols-2 gap-3 pb-4 sm:grid-cols-3">
          {JOB_STATUSES.map((status) => {
            const list = groups[status];
            const buttonBg = COLUMN_BADGE_BG[status];
            return (
              <button
                key={status}
                type="button"
                onClick={() => setColumnModalStatus(status)}
                className={cn(
                  "flex aspect-square w-full flex-col items-center justify-center rounded-xl border border-transparent p-3 text-center transition-opacity hover:opacity-90 active:opacity-95",
                  buttonBg,
                )}
              >
                <span className="text-xl font-semibold opacity-90 sm:text-sm">{status}</span>
                <span className="mt-1.5 text-6xl font-bold tabular-nums ">{list.length}</span>
              </button>
            );
          })}
        </div>
        <Dialog
          open={columnModalStatus !== null}
          onOpenChange={(open) => !open && setColumnModalStatus(null)}
        >
          <DialogContent size="lg">
            <DialogHeader className="shrink-0">
              <DialogTitle>{columnModalStatus ?? ""}</DialogTitle>
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {columnModalStatus !== null && (
                <div className="flex flex-col gap-2">
                  {groups[columnModalStatus].length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      No applications in this column.
                    </p>
                  ) : (
                    groups[columnModalStatus].map((app) => (
                      <JobApplicationCard
                        key={app.id}
                        application={app}
                        interviews={interviewsByApplicationId[app.id]}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onMove={handleMoveInModal}
                        showMoveOption
                        disableDrag
                        alwaysShowMenu
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="h-full min-h-0 overflow-auto py-1">
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid h-full min-h-0 grid-cols-3 gap-3 px-1 xl:grid-cols-6">
          {JOB_STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              applications={groups[status]}
              interviewsByApplicationId={interviewsByApplicationId}
              isDragging={!!activeId}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
        <DragOverlay>
          {activeApp ? (
            <div
              className={cn("min-w-[260px] rounded-lg border border-border bg-card p-3 shadow-lg")}
            >
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground wrap-break-word">
                    {activeApp.company_name}
                  </p>
                  <p className="text-sm  text-muted-foreground wrap-break-word">
                    {activeApp.role_title}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
