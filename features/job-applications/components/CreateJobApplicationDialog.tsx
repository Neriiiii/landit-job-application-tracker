"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { FormMessage } from "@/components/ui/FormMessage";
import type { JobStatus } from "@/features/job-applications/types";
import { useCopyToClipboard } from "@/lib/hooks/useCopyToClipboard";
import { createJobApplication } from "@/features/job-applications/api";
import {
  JobApplicationFormFields,
  type JobApplicationBasicValues,
} from "./JobApplicationFormFields";
import { CirclePlus, Loader2 } from "lucide-react";

const initialValues: JobApplicationBasicValues = {
  companyName: "",
  roleTitle: "",
  jobLink: "",
  currentStatus: "Applied" as JobStatus,
  jobDescription: "",
  notes: "",
  selectedResumeFileId: null,
  selectedCoverLetterFileId: null,
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
};

export function CreateJobApplicationDialog({ open, onOpenChange, userId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<JobApplicationBasicValues>(initialValues);
  const copyJobLink = useCopyToClipboard();

  function handleFieldChange<K extends keyof JobApplicationBasicValues>(
    field: K,
    value: JobApplicationBasicValues[K],
  ) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const company_name = values.companyName.trim();
    const role_title = values.roleTitle.trim();
    const job_link = values.jobLink.trim() || null;
    const job_description = values.jobDescription.trim() || null;
    const notes = values.notes.trim() || null;

    if (!company_name || !role_title) {
      setError("Company name and role title are required.");
      setLoading(false);
      return;
    }

    try {
      await createJobApplication(userId, {
        user_id: userId,
        company_name,
        role_title,
        job_link,
        job_description,
        current_status: values.currentStatus,
        notes,
        archived: false,
        is_fake: false,
        resume_file_id: values.selectedResumeFileId ?? null,
        cover_letter_file_id: values.selectedCoverLetterFileId ?? null,
      });
      onOpenChange(false);
      setValues(initialValues);
      router.push(`/job-applications`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create application.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="min-h-0 flex flex-col">
        <DialogHeader className="shrink-0 bg-background">
          <DialogTitle>Add job application</DialogTitle>
          <DialogDescription>
            Add a new application to track. You can move it between columns on the board.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 max-md:p-2 space-y-4">
            {error && <FormMessage variant="error">{error}</FormMessage>}

            <JobApplicationFormFields
              values={values}
              onChange={handleFieldChange}
              copyJobLink={copyJobLink}
              userId={userId}
              dialogOpen={open}
            />
          </div>
          <div className="shrink-0 border-t border-border bg-background p-4 max-md:p-2">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CirclePlus className="h-4 w-4" />
              )}
              Add application
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
