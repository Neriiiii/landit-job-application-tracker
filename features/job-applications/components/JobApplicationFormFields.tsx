"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { Copy, Check } from "lucide-react";
import { JOB_STATUSES, type JobStatus } from "@/features/job-applications/types";
import { ResumeSelect } from "./ResumeSelect";
import { CoverLetterSelect } from "./CoverLetterSelect";

export type JobApplicationBasicValues = {
  companyName: string;
  roleTitle: string;
  jobLink: string;
  currentStatus: JobStatus;
  jobDescription: string;
  notes: string;
  selectedResumeFileId: string | null;
  selectedCoverLetterFileId: string | null;
};

type CopyLinkApi = { copy: (text: string) => void; copied: boolean };

type Props = {
  values: JobApplicationBasicValues;
  onChange: <K extends keyof JobApplicationBasicValues>(
    field: K,
    value: JobApplicationBasicValues[K],
  ) => void;
  copyJobLink: CopyLinkApi;
  userId: string;
  dialogOpen: boolean;
  idPrefix?: string;
};

export function JobApplicationFormFields({
  values,
  onChange,
  copyJobLink,
  userId,
  dialogOpen,
  idPrefix = "",
}: Props) {
  const id = (name: string) => (idPrefix ? `${idPrefix}${name}` : name);

  return (
    <div className="min-w-0 space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor={id("company_name")}>Company name *</Label>
          <Input
            id={id("company_name")}
            name="company_name"
            placeholder="Acme Inc."
            required
            value={values.companyName}
            onChange={(e) => onChange("companyName", e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={id("role_title")}>Role / job title *</Label>
          <Input
            id={id("role_title")}
            name="role_title"
            placeholder="Senior Engineer"
            required
            value={values.roleTitle}
            onChange={(e) => onChange("roleTitle", e.target.value)}
          />
        </div>
      </div>
      <div className="grid min-w-0 gap-2">
        <Label htmlFor={id("job_description")}>Job description (paste)</Label>
        <RichTextEditor
          value={values.jobDescription}
          onChange={(html) => onChange("jobDescription", html)}
          placeholder="Paste the job description here..."
          minHeight="6rem"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor={id("job_link")}>Job link</Label>
          <div className="flex gap-2">
            <Input
              id={id("job_link")}
              name="job_link"
              type="url"
              value={values.jobLink}
              onChange={(e) => onChange("jobLink", e.target.value)}
              placeholder="https://..."
              className="min-w-0"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0"
              onClick={() => copyJobLink.copy(values.jobLink)}
              disabled={!values.jobLink.trim()}
              aria-label={copyJobLink.copied ? "Copied" : "Copy link"}
              title="Copy link"
            >
              {copyJobLink.copied ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Status</Label>
          <Select
            value={values.currentStatus}
            onValueChange={(v) => onChange("currentStatus", v as JobStatus)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {JOB_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ResumeSelect
          userId={userId}
          dialogOpen={dialogOpen}
          value={values.selectedResumeFileId}
          onChange={(fileId) => onChange("selectedResumeFileId", fileId)}
          id={id("resume")}
          showOpenLink={!!idPrefix}
        />
        <CoverLetterSelect
          userId={userId}
          dialogOpen={dialogOpen}
          value={values.selectedCoverLetterFileId}
          onChange={(fileId) => onChange("selectedCoverLetterFileId", fileId)}
          id={id("cover-letter")}
          showOpenLink={!!idPrefix}
        />
      </div>
      <div className="grid min-w-0 gap-2">
        <Label htmlFor={id("notes")}>Notes</Label>
        <RichTextEditor
          value={values.notes}
          onChange={(html) => onChange("notes", html)}
          placeholder="Your notes..."
          minHeight="4rem"
        />
      </div>
    </div>
  );
}
