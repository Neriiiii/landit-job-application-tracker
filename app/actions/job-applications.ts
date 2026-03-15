/** Server actions for job application CRUD, status updates, and interviews. */
"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUserInAction } from "@/lib/supabase/auth";
import { toSafeMessage } from "@/lib/safe-errors";
import type {
  JobApplication,
  JobApplicationInsert,
  JobApplicationUpdate,
  JobStatus,
  Interview,
  JobOffer,
  UpcomingInterviewRow,
} from "@/features/job-applications/types";
import { jobApplicationService } from "@/features/job-applications/services/jobApplicationService";
import { interviewService } from "@/features/job-applications/services/interviewService";
import { jobOfferService } from "@/features/job-applications/services/jobOfferService";
import {
  jobApplicationInsertSchema,
  jobApplicationUpdateSchema,
  jobStatusSchemaSingle,
} from "@/lib/validations/job-application";

const RESUME_BUCKET = "resumes";
const COVER_LETTER_BUCKET = "cover-letters";

export async function getJobApplications(userId: string): Promise<JobApplication[]> {
  const user = await requireUserInAction();
  const uid = user.id;
  try {
    const supabase = await createClient();
    const applications = await jobApplicationService.getJobApplications(supabase, uid);

  const resumeIds = [...new Set(applications.map((a) => a.resume_file_id).filter(Boolean))] as string[];
  const coverLetterIds = [...new Set(applications.map((a) => a.cover_letter_file_id).filter(Boolean))] as string[];

  const resumeUrlMap = new Map<string, string>();
  const coverLetterUrlMap = new Map<string, string>();

  if (resumeIds.length > 0) {
    const { data: resumeRows } = await supabase
      .from("resume_files")
      .select("id, file_path")
      .eq("user_id", uid)
      .in("id", resumeIds);
    for (const row of resumeRows ?? []) {
      const { data: urlData } = supabase.storage.from(RESUME_BUCKET).getPublicUrl(row.file_path);
      resumeUrlMap.set(row.id, urlData.publicUrl);
    }
  }
  if (coverLetterIds.length > 0) {
    const { data: coverRows } = await supabase
      .from("cover_letter_files")
      .select("id, file_path")
      .eq("user_id", uid)
      .in("id", coverLetterIds);
    for (const row of coverRows ?? []) {
      const { data: urlData } = supabase.storage.from(COVER_LETTER_BUCKET).getPublicUrl(row.file_path);
      coverLetterUrlMap.set(row.id, urlData.publicUrl);
    }
  }

  return applications.map((app) => ({
    ...app,
    resume_url: app.resume_file_id ? resumeUrlMap.get(app.resume_file_id) ?? null : null,
    cover_letter_url: app.cover_letter_file_id ? coverLetterUrlMap.get(app.cover_letter_file_id) ?? null : null,
  }));
  } catch (e) {
    throw new Error(toSafeMessage(e, "getJobApplications"));
  }
}

export async function deleteAllFakeJobApplications(userId: string): Promise<number> {
  const user = await requireUserInAction();
  try {
    const supabase = await createClient();
    return await jobApplicationService.deleteAllFakeJobApplications(supabase, user.id);
  } catch (e) {
    throw new Error(toSafeMessage(e, "deleteAllFakeJobApplications"));
  }
}

export async function createJobApplication(
  userId: string,
  input: Omit<JobApplicationInsert, "id" | "created_at" | "updated_at" | "resume_url" | "cover_letter_url">
): Promise<JobApplication> {
  const user = await requireUserInAction();
  const parsed = jobApplicationInsertSchema.safeParse(input);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((e) => e.message).join("; ") || "Invalid input.";
    throw new Error(msg);
  }
  try {
    const supabase = await createClient();
    return await jobApplicationService.createJobApplication(supabase, user.id, parsed.data as Omit<JobApplicationInsert, "id" | "created_at" | "updated_at" | "resume_url" | "cover_letter_url">);
  } catch (e) {
    throw new Error(toSafeMessage(e, "createJobApplication"));
  }
}

export async function updateJobApplicationStatus(
  applicationId: string,
  userId: string,
  newStatus: JobStatus
): Promise<void> {
  const user = await requireUserInAction();
  const parsed = jobStatusSchemaSingle.safeParse(newStatus);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((e) => e.message).join("; ") || "Invalid status.");
  }
  try {
    const supabase = await createClient();
    return await jobApplicationService.updateJobApplicationStatus(
      supabase,
      applicationId,
      user.id,
      parsed.data as JobStatus
    );
  } catch (e) {
    throw new Error(toSafeMessage(e, "updateJobApplicationStatus"));
  }
}

export async function updateJobApplication(
  applicationId: string,
  userId: string,
  updates: JobApplicationUpdate
): Promise<void> {
  const user = await requireUserInAction();
  const parsed = jobApplicationUpdateSchema.safeParse(updates);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((e) => e.message).join("; ") || "Invalid input.";
    throw new Error(msg);
  }
  try {
    const supabase = await createClient();
    return await jobApplicationService.updateJobApplication(
      supabase,
      applicationId,
      user.id,
      parsed.data as JobApplicationUpdate
    );
  } catch (e) {
    throw new Error(toSafeMessage(e, "updateJobApplication"));
  }
}

export async function deleteJobApplication(
  applicationId: string,
  userId: string
): Promise<void> {
  const user = await requireUserInAction();
  try {
    const supabase = await createClient();
    return await jobApplicationService.deleteJobApplication(supabase, applicationId, user.id);
  } catch (e) {
    throw new Error(toSafeMessage(e, "deleteJobApplication"));
  }
}

export async function getUpcomingInterviews(
  userId: string
): Promise<UpcomingInterviewRow[]> {
  const user = await requireUserInAction();
  try {
    const supabase = await createClient();
    return await interviewService.getUpcomingInterviews(supabase, user.id);
  } catch (e) {
    throw new Error(toSafeMessage(e, "getUpcomingInterviews"));
  }
}

export async function getInterviewsByApplication(
  applicationId: string,
  userId: string
): Promise<Interview[]> {
  const user = await requireUserInAction();
  try {
    const supabase = await createClient();
    return await interviewService.getInterviewsByApplication(
      supabase,
      applicationId,
      user.id,
    );
  } catch (e) {
    throw new Error(toSafeMessage(e, "getInterviewsByApplication"));
  }
}

export async function getInterviewsForApplications(
  applicationIds: string[],
  userId: string
): Promise<Interview[]> {
  const user = await requireUserInAction();
  try {
    const supabase = await createClient();
    return await interviewService.getInterviewsForApplications(
      supabase,
      applicationIds,
      user.id,
    );
  } catch (e) {
    throw new Error(toSafeMessage(e, "getInterviewsForApplications"));
  }
}

export async function createInterview(
  userId: string,
  input: {
    application_id: string;
    round_number?: number;
    round_label?: string | null;
    date?: string | null;
    time?: string | null;
    interview_type?: string | null;
    meeting_link?: string | null;
    status?: string | null;
    notes?: string | null;
  }
): Promise<Interview> {
  const user = await requireUserInAction();
  try {
    const supabase = await createClient();
    return await interviewService.createInterview(supabase, user.id, input);
  } catch (e) {
    throw new Error(toSafeMessage(e, "createInterview"));
  }
}

export async function updateInterview(
  id: string,
  userId: string,
  updates: {
    date?: string | null;
    time?: string | null;
    interview_type?: string | null;
    meeting_link?: string | null;
    status?: string | null;
    notes?: string | null;
    round_number?: number;
    round_label?: string | null;
  }
): Promise<void> {
  const user = await requireUserInAction();
  try {
    const supabase = await createClient();
    return await interviewService.updateInterview(supabase, id, user.id, updates);
  } catch (e) {
    throw new Error(toSafeMessage(e, "updateInterview"));
  }
}

export async function deleteInterview(
  id: string,
  userId: string
): Promise<void> {
  const user = await requireUserInAction();
  try {
    const supabase = await createClient();
    return await interviewService.deleteInterview(supabase, id, user.id);
  } catch (e) {
    throw new Error(toSafeMessage(e, "deleteInterview"));
  }
}

export async function getJobOfferByApplication(
  applicationId: string
): Promise<JobOffer | null> {
  await requireUserInAction();
  try {
    const supabase = await createClient();
    return await jobOfferService.getJobOfferByApplication(supabase, applicationId);
  } catch (e) {
    throw new Error(toSafeMessage(e, "getJobOfferByApplication"));
  }
}

export async function upsertJobOffer(
  applicationId: string,
  input: {
    expected_salary?: string | null;
    salary_offer?: string | null;
    benefits?: string | null;
    start_date?: string | null;
    work_days?: string | null;
    work_time_start?: string | null;
    work_time_end?: string | null;
  }
): Promise<JobOffer> {
  await requireUserInAction();
  try {
    const supabase = await createClient();
    return await jobOfferService.upsertJobOffer(supabase, applicationId, input);
  } catch (e) {
    throw new Error(toSafeMessage(e, "upsertJobOffer"));
  }
}

export async function acceptJobOffer(applicationId: string): Promise<void> {
  await requireUserInAction();
  try {
    const supabase = await createClient();
    return await jobOfferService.acceptJobOffer(supabase, applicationId);
  } catch (e) {
    throw new Error(toSafeMessage(e, "acceptJobOffer"));
  }
}
