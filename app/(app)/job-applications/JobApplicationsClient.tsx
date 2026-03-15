/** Client wrapper for job applications: Kanban board, create/edit dialogs, and status updates. */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CirclePlus, Plus } from "lucide-react";
import type { JobApplication, Interview } from "@/features/job-applications";
import {
  deleteJobApplication,
  KanbanBoard,
  CreateJobApplicationDialog,
  EditJobApplicationDialog,
} from "@/features/job-applications";
import { AppPageHeader } from "@/components/layout/PageHeader";
import { AppPageTitleBlock } from "@/components/layout/AppPageTitleBlock";

type Props = {
  userId: string;
  applications: JobApplication[];
  interviewsByApplicationId?: Record<string, Interview[]>;
};

export function JobApplicationsClient({
  userId,
  applications,
  interviewsByApplicationId = {},
}: Props) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null);
  const [deletingApplication, setDeletingApplication] = useState<JobApplication | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!deletingApplication) return;
    setIsDeleting(true);
    try {
      await deleteJobApplication(deletingApplication.id, userId);
      setDeletingApplication(null);
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col h-screen max-h-screen sm:overflow-hidden">
        <AppPageHeader title="Job applications" />
        <div className="flex-1 min-h-0 flex flex-col max-sm:gap-3 gap-4  max-sm:p-4 p-8 overflow-hidden max-xl:overflow-y-auto">
          <AppPageTitleBlock
            title="Track your applications"
            description="Drag cards between columns to update status. Hover a card to edit or delete."
            action={
              <Button
                onClick={() => setCreateOpen(true)}
                size="lg"
                className="gap-2 shrink-0 rounded-lg px-6 text-base"
              >
                <CirclePlus className="h-4 w-4" />
                Add application
              </Button>
            }
          />
          <div className="flex min-h-0 flex-1 flex-col">
            <KanbanBoard
              userId={userId}
              initialApplications={applications}
              interviewsByApplicationId={interviewsByApplicationId}
              onEdit={setEditingApplication}
              onDelete={setDeletingApplication}
            />
          </div>
        </div>
      </div>
      <CreateJobApplicationDialog open={createOpen} onOpenChange={setCreateOpen} userId={userId} />
      <EditJobApplicationDialog
        open={!!editingApplication}
        onOpenChange={(open) => !open && setEditingApplication(null)}
        userId={userId}
        application={editingApplication}
      />
      <ConfirmDialog
        open={!!deletingApplication}
        onOpenChange={(open) => !open && setDeletingApplication(null)}
        title="Confirm before deleting important data"
        description={
          deletingApplication ? (
            <>
              You are about to permanently delete this application and all its data:{" "}
              <span className="font-medium text-foreground">
                {deletingApplication.company_name} – {deletingApplication.role_title}
              </span>
              . This cannot be undone. Are you sure you want to continue?
            </>
          ) : (
            "You are about to permanently delete important data. This cannot be undone."
          )
        }
        confirmLabel="Yes, delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
        variant="destructive"
      />
    </>
  );
}
