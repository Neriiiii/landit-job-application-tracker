"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUserInAction } from "@/lib/supabase/auth";
import { toSafeMessage } from "@/lib/safe-errors";
import { jobLinksDbService } from "@/features/dashboard/services/jobLinksDbService";
import type { JobLinkRow } from "@/features/dashboard/types";
import { jobLinkCreateSchema, jobLinkUpdateSchema } from "@/lib/validations/job-link";

export async function getJobLinks(userId: string): Promise<JobLinkRow[]> {
  const user = await requireUserInAction();
  try {
    const supabase = await createClient();
    return await jobLinksDbService.getJobLinks(supabase, user.id);
  } catch (e) {
    throw new Error(toSafeMessage(e, "getJobLinks"));
  }
}

export async function createJobLink(
  userId: string,
  input: { name: string; url: string; sort_order?: number; color?: string }
): Promise<JobLinkRow> {
  const user = await requireUserInAction();
  const parsed = jobLinkCreateSchema.safeParse(input);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((e) => e.message).join("; ") || "Invalid input.";
    throw new Error(msg);
  }
  try {
    const supabase = await createClient();
    return await jobLinksDbService.createJobLink(supabase, user.id, parsed.data);
  } catch (e) {
    throw new Error(toSafeMessage(e, "createJobLink"));
  }
}

export async function updateJobLink(
  id: string,
  userId: string,
  updates: { name?: string; url?: string; sort_order?: number; color?: string }
): Promise<void> {
  const user = await requireUserInAction();
  const parsed = jobLinkUpdateSchema.safeParse(updates);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((e) => e.message).join("; ") || "Invalid input.";
    throw new Error(msg);
  }
  try {
    const supabase = await createClient();
    return await jobLinksDbService.updateJobLink(supabase, id, user.id, parsed.data);
  } catch (e) {
    throw new Error(toSafeMessage(e, "updateJobLink"));
  }
}

export async function deleteJobLink(id: string, userId: string): Promise<void> {
  const user = await requireUserInAction();
  try {
    const supabase = await createClient();
    return await jobLinksDbService.deleteJobLink(supabase, id, user.id);
  } catch (e) {
    throw new Error(toSafeMessage(e, "deleteJobLink"));
  }
}
