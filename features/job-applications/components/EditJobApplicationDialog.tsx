"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { DatePicker } from "@/components/ui/DatePicker";
import { TimeInput } from "@/components/ui/TimeInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { FormMessage } from "@/components/ui/FormMessage";
import type {
  JobApplication,
  Interview,
  JobOffer,
} from "@/features/job-applications/types";
import {
  INTERVIEW_TYPES_DB,
  INTERVIEW_STATUSES,
  type InterviewTypeDb,
  type InterviewStatus,
} from "@/features/job-applications/types";
import {
  updateJobApplication,
  getInterviewsByApplication,
  createInterview,
  updateInterview,
  deleteInterview,
  getJobOfferByApplication,
  upsertJobOffer,
  acceptJobOffer,
} from "@/features/job-applications/api";
import {
  JobApplicationFormFields,
  type JobApplicationBasicValues,
} from "./JobApplicationFormFields";
import { useCopyToClipboard } from "@/lib/hooks/useCopyToClipboard";
import { CalendarDays, Banknote, Plus, Pencil, Trash2, Copy, Check, Video } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  application: JobApplication | null;
};

export function EditJobApplicationDialog({ open, onOpenChange, userId, application }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<JobApplicationBasicValues>({
    companyName: "",
    roleTitle: "",
    jobLink: "",
    currentStatus: "Applied",
    jobDescription: "",
    notes: "",
    selectedResumeFileId: null,
    selectedCoverLetterFileId: null,
  });
  const copyJobLink = useCopyToClipboard();
  const interviewSectionRef = useRef<HTMLDivElement>(null);

  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [interviewsLoading, setInterviewsLoading] = useState(false);
  const [jobOffer, setJobOffer] = useState<JobOffer | null>(null);
  const [offerLoading, setOfferLoading] = useState(false);

  const [addingInterview, setAddingInterview] = useState(false);
  const [newInterviewDate, setNewInterviewDate] = useState("");
  const [newInterviewTime, setNewInterviewTime] = useState("");
  const [newInterviewType, setNewInterviewType] = useState<InterviewTypeDb | "">("");
  const [newInterviewMeetingLink, setNewInterviewMeetingLink] = useState("");
  const [newInterviewStatus, setNewInterviewStatus] = useState<InterviewStatus | "">("Scheduled");
  const [newInterviewNotes, setNewInterviewNotes] = useState("");
  const [newInterviewRoundLabel, setNewInterviewRoundLabel] = useState("");
  const [editingInterviewId, setEditingInterviewId] = useState<string | null>(null);
  const [editInterviewDate, setEditInterviewDate] = useState("");
  const [editInterviewTime, setEditInterviewTime] = useState("");
  const [editInterviewType, setEditInterviewType] = useState<InterviewTypeDb | "">("");
  const [editInterviewMeetingLink, setEditInterviewMeetingLink] = useState("");
  const [editInterviewStatus, setEditInterviewStatus] = useState<InterviewStatus | "">("Scheduled");
  const [editInterviewNotes, setEditInterviewNotes] = useState("");
  const [editInterviewRoundLabel, setEditInterviewRoundLabel] = useState("");

  const [offerExpectedSalary, setOfferExpectedSalary] = useState("");
  const [offerSalaryOffer, setOfferSalaryOffer] = useState("");
  const [offerBenefits, setOfferBenefits] = useState("");
  const [offerStartDate, setOfferStartDate] = useState("");
  const [offerWorkDays, setOfferWorkDays] = useState("");
  const [offerWorkTimeStart, setOfferWorkTimeStart] = useState("");
  const [offerWorkTimeEnd, setOfferWorkTimeEnd] = useState("");
  const [offerSaving, setOfferSaving] = useState(false);

  useEffect(() => {
    if (application) {
      setValues({
        companyName: application.company_name,
        roleTitle: application.role_title,
        jobLink: application.job_link ?? "",
        currentStatus: application.current_status,
        jobDescription: application.job_description ?? "",
        notes: application.notes ?? "",
        selectedResumeFileId: application.resume_file_id ?? null,
        selectedCoverLetterFileId: application.cover_letter_file_id ?? null,
      });
    }
  }, [application]);

  useEffect(() => {
    if (!open || !application) return;
    if (values.currentStatus === "Interview") {
      setInterviewsLoading(true);
      getInterviewsByApplication(application.id, userId)
        .then(setInterviews)
        .finally(() => setInterviewsLoading(false));
      const t = setTimeout(() => {
        interviewSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
      return () => clearTimeout(t);
    }
    if (values.currentStatus === "Offer") {
      setOfferLoading(true);
      getJobOfferByApplication(application.id)
        .then((o) => {
          setJobOffer(o);
          if (o) {
            setOfferExpectedSalary(o.expected_salary ?? "");
            setOfferSalaryOffer(o.salary_offer ?? "");
            setOfferBenefits(o.benefits ?? "");
            setOfferStartDate(o.start_date ?? "");
            setOfferWorkDays(o.work_days ?? "");
            setOfferWorkTimeStart(o.work_time_start ?? "");
            setOfferWorkTimeEnd(o.work_time_end ?? "");
          } else {
            setOfferExpectedSalary("");
            setOfferSalaryOffer("");
            setOfferBenefits("");
            setOfferStartDate("");
            setOfferWorkDays("");
            setOfferWorkTimeStart("");
            setOfferWorkTimeEnd("");
          }
        })
        .finally(() => setOfferLoading(false));
    }
  }, [open, application?.id, userId, values.currentStatus]);

  function handleFieldChange<K extends keyof JobApplicationBasicValues>(
    field: K,
    value: JobApplicationBasicValues[K],
  ) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!application) return;
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
      await updateJobApplication(application.id, userId, {
        company_name,
        role_title,
        job_link,
        job_description,
        current_status: values.currentStatus,
        notes,
        resume_file_id: values.selectedResumeFileId ?? null,
        cover_letter_file_id: values.selectedCoverLetterFileId ?? null,
      });
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update application.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddInterview() {
    if (!application) return;
    setError(null);
    try {
      const created = await createInterview(userId, {
        application_id: application.id,
        round_number: interviews.length + 1,
        round_label: newInterviewRoundLabel.trim() || null,
        date: newInterviewDate.trim() || null,
        time: newInterviewTime.trim() || null,
        interview_type: newInterviewType || null,
        meeting_link: newInterviewMeetingLink.trim() || null,
        status: newInterviewStatus || "Scheduled",
        notes: newInterviewNotes.trim() || null,
      });
      setInterviews((prev) => [...prev, created].sort((a, b) => (a.round_number - b.round_number)));
      setAddingInterview(false);
      setNewInterviewDate("");
      setNewInterviewTime("");
      setNewInterviewType("");
      setNewInterviewMeetingLink("");
      setNewInterviewStatus("Scheduled");
      setNewInterviewNotes("");
      setNewInterviewRoundLabel("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add interview.");
    }
  }

  async function handleUpdateInterview(id: string) {
    setError(null);
    try {
      await updateInterview(id, userId, {
        date: editInterviewDate.trim() || null,
        time: editInterviewTime.trim() || null,
        interview_type: editInterviewType || null,
        meeting_link: editInterviewMeetingLink.trim() || null,
        status: editInterviewStatus || null,
        notes: editInterviewNotes.trim() || null,
        round_label: editInterviewRoundLabel.trim() || null,
      });
      setInterviews((prev) =>
        prev.map((i) =>
          i.id === id
            ? {
                ...i,
                date: editInterviewDate.trim() || null,
                time: editInterviewTime.trim() || null,
                interview_type: editInterviewType || null,
                meeting_link: editInterviewMeetingLink.trim() || null,
                status: editInterviewStatus || null,
                notes: editInterviewNotes.trim() || null,
                round_label: editInterviewRoundLabel.trim() || null,
              }
            : i,
        ),
      );
      setEditingInterviewId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update interview.");
    }
  }

  async function handleDeleteInterview(id: string) {
    setError(null);
    try {
      await deleteInterview(id, userId);
      setInterviews((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete interview.");
    }
  }

  function startEditInterview(i: Interview) {
    setEditingInterviewId(i.id);
    setEditInterviewDate(i.date ?? "");
    setEditInterviewTime(i.time ?? "");
    setEditInterviewType((i.interview_type as InterviewTypeDb) ?? "");
    setEditInterviewMeetingLink(i.meeting_link ?? "");
    setEditInterviewStatus((i.status as InterviewStatus) ?? "Scheduled");
    setEditInterviewNotes(i.notes ?? "");
    setEditInterviewRoundLabel(i.round_label ?? "");
  }

  async function handleSaveOffer() {
    if (!application) return;
    setError(null);
    setOfferSaving(true);
    try {
      const updated = await upsertJobOffer(application.id, {
        expected_salary: offerExpectedSalary.trim() || null,
        salary_offer: offerSalaryOffer.trim() || null,
        benefits: offerBenefits.trim() || null,
        start_date: offerStartDate.trim() || null,
        work_days: offerWorkDays.trim() || null,
        work_time_start: offerWorkTimeStart.trim() || null,
        work_time_end: offerWorkTimeEnd.trim() || null,
      });
      setJobOffer(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save offer.");
    } finally {
      setOfferSaving(false);
    }
  }

  async function handleAcceptOffer() {
    if (!application) return;
    setError(null);
    try {
      await acceptJobOffer(application.id);
      onOpenChange(false);
      router.push(`/offer-accepted?id=${application.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept offer.");
    }
  }

  function formatInterviewDateTime(date: string | null, time: string | null) {
    if (!date) return "—";
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

  const copyMeetingLink = useCopyToClipboard();
  const isInterviewOrOffer =
    values.currentStatus === "Interview" || values.currentStatus === "Offer";
  const dialogSize = isInterviewOrOffer ? "xl" : "lg";

  if (!application) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size={dialogSize} className="min-h-0 flex flex-col">
        <DialogHeader className="shrink-0 bg-background">
          <DialogTitle>Edit job application</DialogTitle>
          <DialogDescription>
            Update the details below. Changing status will be recorded in history.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 max-md:p-2 space-y-4">
            {error && (
              <FormMessage variant="error" className="col-span-2">
                {error}
              </FormMessage>
            )}
            <div className="flex max-xl:flex-col xl:flex-row min-w-0 gap-4">
              <div className="min-w-0 flex-1">
                <JobApplicationFormFields
                  values={values}
                  onChange={handleFieldChange}
                  copyJobLink={copyJobLink}
                  userId={userId}
                  dialogOpen={open}
                  idPrefix="edit-"
                />
              </div>

              {values.currentStatus === "Interview" && (
                <div
                  ref={interviewSectionRef}
                  className="rounded-lg border border-terracotta/20 bg-terracotta/5 p-4 space-y-4 min-w-0 flex-1 xl:max-w-md"
                >
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <CalendarDays className="h-4 w-4" />
                    Interview details
                  </div>
                  {interviewsLoading ? (
                    <p className="text-sm text-muted-foreground">Loading…</p>
                  ) : (
                    <>
                      <ul className="space-y-2">
                        {interviews.map((i) => (
                          <li
                            key={i.id}
                            className="rounded-lg border border-border bg-background p-3 text-sm"
                          >
                            {editingInterviewId === i.id ? (
                              <div className="space-y-2">
                                <div>
                                  <Label className="text-xs">Round name</Label>
                                  <Input
                                    value={editInterviewRoundLabel}
                                    onChange={(e) =>
                                      setEditInterviewRoundLabel(e.target.value)
                                    }
                                    placeholder={`e.g. Round ${i.round_number}, Phone screen`}
                                    className="h-8"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <Label className="text-xs">Date</Label>
                                    <DatePicker
                                      value={editInterviewDate}
                                      onChange={setEditInterviewDate}
                                      placeholder="Date"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Time</Label>
                                    <TimeInput
                                      value={editInterviewTime}
                                      onChange={setEditInterviewTime}
                                    />
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-xs">Type</Label>
                                  <Select
                                    value={editInterviewType || undefined}
                                    onValueChange={(v) =>
                                      setEditInterviewType(v as InterviewTypeDb)
                                    }
                                  >
                                    <SelectTrigger className="h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {INTERVIEW_TYPES_DB.map((t) => (
                                        <SelectItem key={t} value={t}>
                                          {t}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label className="text-xs">Status</Label>
                                  <Select
                                    value={editInterviewStatus || undefined}
                                    onValueChange={(v) =>
                                      setEditInterviewStatus(v as InterviewStatus)
                                    }
                                  >
                                    <SelectTrigger className="h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {INTERVIEW_STATUSES.map((s) => (
                                        <SelectItem key={s} value={s}>
                                          {s}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                {editInterviewType === "Video" && (
                                  <div>
                                    <Label className="text-xs">Meeting link</Label>
                                    <Input
                                      value={editInterviewMeetingLink}
                                      onChange={(e) =>
                                        setEditInterviewMeetingLink(e.target.value)
                                      }
                                      placeholder="https://..."
                                      className="h-8"
                                    />
                                  </div>
                                )}
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => handleUpdateInterview(i.id)}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingInterviewId(null)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <span className="font-medium">
                                      {i.round_label?.trim() || `Round ${i.round_number}`}
                                    </span>
                                    <p className="text-muted-foreground">
                                      {formatInterviewDateTime(i.date, i.time)}
                                      {i.interview_type && ` · ${i.interview_type}`}
                                      {i.status && ` · ${i.status}`}
                                    </p>
                                    {i.meeting_link?.trim() && (
                                      <div className="mt-1 flex items-center gap-1">
                                        <a
                                          href={i.meeting_link}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                        >
                                          <Video className="h-3 w-3" />
                                          Join meeting
                                        </a>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6"
                                          onClick={() => copyMeetingLink.copy(i.meeting_link!)}
                                          aria-label="Copy link"
                                        >
                                          {copyMeetingLink.copied ? (
                                            <Check className="h-3 w-3" />
                                          ) : (
                                            <Copy className="h-3 w-3" />
                                          )}
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex gap-1 shrink-0">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => startEditInterview(i)}
                                      aria-label="Edit"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-destructive"
                                      onClick={() => handleDeleteInterview(i.id)}
                                      aria-label="Delete"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                      {addingInterview ? (
                        <div className="rounded-lg border border-dashed border-border p-3 space-y-2">
                          <Label className="text-xs">New interview</Label>
                          <div>
                            <Label className="text-xs">Round name</Label>
                            <Input
                              value={newInterviewRoundLabel}
                              onChange={(e) =>
                                setNewInterviewRoundLabel(e.target.value)
                              }
                              placeholder="e.g. Phone screen, Technical"
                              className="h-8"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs">Date</Label>
                              <DatePicker
                                value={newInterviewDate}
                                onChange={setNewInterviewDate}
                                placeholder="Date"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Time</Label>
                              <TimeInput
                                value={newInterviewTime}
                                onChange={setNewInterviewTime}
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs">Type</Label>
                            <Select
                              value={newInterviewType || undefined}
                              onValueChange={(v) =>
                                setNewInterviewType(v as InterviewTypeDb)
                              }
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Type" />
                              </SelectTrigger>
                              <SelectContent>
                                {INTERVIEW_TYPES_DB.map((t) => (
                                  <SelectItem key={t} value={t}>
                                    {t}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Status</Label>
                            <Select
                              value={newInterviewStatus || undefined}
                              onValueChange={(v) =>
                                setNewInterviewStatus(v as InterviewStatus)
                              }
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {INTERVIEW_STATUSES.map((s) => (
                                  <SelectItem key={s} value={s}>
                                    {s}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {newInterviewType === "Video" && (
                            <div>
                              <Label className="text-xs">Meeting link</Label>
                              <Input
                                value={newInterviewMeetingLink}
                                onChange={(e) =>
                                  setNewInterviewMeetingLink(e.target.value)
                                }
                                placeholder="https://..."
                                className="h-8"
                              />
                            </div>
                          )}
                          <div>
                            <Label className="text-xs">Notes</Label>
                            <Input
                              value={newInterviewNotes}
                              onChange={(e) => setNewInterviewNotes(e.target.value)}
                              placeholder="Optional"
                              className="h-8"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button type="button" size="sm" onClick={handleAddInterview}>
                              Add
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setAddingInterview(false)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => setAddingInterview(true)}
                        >
                          <Plus className="h-4 w-4" />
                          Add interview
                        </Button>
                      )}
                    </>
                  )}
                </div>
              )}

              {values.currentStatus === "Offer" && (
                <div className="rounded-lg border border-success/20 bg-success/5 p-4 space-y-4 min-w-0 flex-1 xl:max-w-md">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <Banknote className="h-4 w-4" />
                    Offer details
                  </div>
                  {offerLoading ? (
                    <p className="text-sm text-muted-foreground">Loading…</p>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="grid gap-1.5">
                          <Label htmlFor="edit-expected-salary">Expected salary</Label>
                          <Input
                            id="edit-expected-salary"
                            value={offerExpectedSalary}
                            onChange={(e) => setOfferExpectedSalary(e.target.value)}
                            placeholder="e.g. 95,000"
                          />
                        </div>
                        <div className="grid gap-1.5">
                          <Label htmlFor="edit-salary-offer">Salary offer</Label>
                          <Input
                            id="edit-salary-offer"
                            value={offerSalaryOffer}
                            onChange={(e) => setOfferSalaryOffer(e.target.value)}
                            placeholder="e.g. 95,000"
                          />
                        </div>
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor="edit-offer-start-date">Start date</Label>
                        <DatePicker
                          id="edit-offer-start-date"
                          value={offerStartDate}
                          onChange={setOfferStartDate}
                          placeholder="Pick start date"
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="grid gap-1.5">
                          <Label htmlFor="edit-offer-work-days">Work days / week</Label>
                          <Select
                            value={offerWorkDays || undefined}
                            onValueChange={setOfferWorkDays}
                          >
                            <SelectTrigger id="edit-offer-work-days">
                              <SelectValue placeholder="Days" />
                            </SelectTrigger>
                            <SelectContent>
                              {["1", "2", "3", "4", "5", "6", "7"].map((d) => (
                                <SelectItem key={d} value={d}>
                                  {d}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-1.5">
                          <Label htmlFor="edit-offer-time-start">Work time start</Label>
                          <TimeInput
                            id="edit-offer-time-start"
                            value={offerWorkTimeStart}
                            onChange={setOfferWorkTimeStart}
                          />
                        </div>
                        <div className="grid gap-1.5">
                          <Label htmlFor="edit-offer-time-end">Work time end</Label>
                          <TimeInput
                            id="edit-offer-time-end"
                            value={offerWorkTimeEnd}
                            onChange={setOfferWorkTimeEnd}
                          />
                        </div>
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor="edit-offer-benefits">Benefits</Label>
                        <RichTextEditor
                          value={offerBenefits}
                          onChange={(html) => setOfferBenefits(html)}
                          placeholder="Health insurance, PTO, etc."
                          minHeight="4rem"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          onClick={handleSaveOffer}
                          disabled={offerSaving}
                        >
                          {offerSaving ? "Saving…" : "Save offer"}
                        </Button>
                        {!jobOffer?.accepted_at && (
                          <Button
                            type="button"
                            variant="default"
                            onClick={handleAcceptOffer}
                          >
                            Accept offer
                          </Button>
                        )}
                      </div>
                      {jobOffer?.accepted_at && (
                        <p className="text-sm text-success">
                          Offer accepted on{" "}
                          {new Date(jobOffer.accepted_at).toLocaleDateString(undefined, {
                            dateStyle: "medium",
                          })}
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="shrink-0 border-t border-border bg-background p-4 max-md:p-2">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
