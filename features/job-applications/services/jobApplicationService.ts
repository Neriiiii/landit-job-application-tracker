import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  JobApplication,
  JobApplicationInsert,
  JobApplicationUpdate,
  JobStatus,
} from "../types";

function mapRow(row: Record<string, unknown>): JobApplication {
  return {
    ...row,
    job_link: row.job_link ?? null,
    job_description: row.job_description ?? null,
    resume_file_id: row.resume_file_id ?? null,
    cover_letter_file_id: row.cover_letter_file_id ?? null,
    notes: row.notes ?? null,
    is_fake: row.is_fake ?? false,
  } as JobApplication;
}

export const jobApplicationService = {
  async getJobApplications(
    supabase: SupabaseClient,
    userId: string
  ): Promise<JobApplication[]> {
    const { data, error } = await supabase
      .from("job_applications")
      .select("*")
      .eq("user_id", userId)
      .eq("archived", false)
      .order("updated_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
  },

  async deleteAllFakeJobApplications(
    supabase: SupabaseClient,
    userId: string
  ): Promise<number> {
    const { data, error } = await supabase
      .from("job_applications")
      .delete()
      .eq("user_id", userId)
      .eq("is_fake", true)
      .select("id");

    if (error) throw new Error(error.message);
    return data?.length ?? 0;
  },

  async createJobApplication(
    supabase: SupabaseClient,
    userId: string,
    input: Omit<
      JobApplicationInsert,
      "id" | "created_at" | "updated_at" | "resume_url" | "cover_letter_url"
    >
  ): Promise<JobApplication> {
    const status = (input.current_status ?? "Applied") as JobStatus;

    const { data, error } = await supabase
      .from("job_applications")
      .insert({
        user_id: userId,
        company_name: input.company_name,
        role_title: input.role_title,
        job_link: input.job_link ?? null,
        job_description: input.job_description ?? null,
        current_status: status,
        notes: input.notes ?? null,
        archived: input.archived ?? false,
        resume_file_id: input.resume_file_id ?? null,
        cover_letter_file_id: input.cover_letter_file_id ?? null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    const app = mapRow(data as Record<string, unknown>);

    await supabase.from("application_status_history").insert({
      application_id: app.id,
      user_id: userId,
      old_status: null,
      new_status: status,
      changed_at: new Date().toISOString(),
    });

    return app;
  },

  async updateJobApplicationStatus(
    supabase: SupabaseClient,
    applicationId: string,
    userId: string,
    newStatus: JobStatus
  ): Promise<void> {
    const { data: existing } = await supabase
      .from("job_applications")
      .select("current_status")
      .eq("id", applicationId)
      .eq("user_id", userId)
      .single();

    if (!existing) throw new Error("Application not found");

    const oldStatus = (existing.current_status ?? null) as string | null;

    const { error: updateError } = await supabase
      .from("job_applications")
      .update({ current_status: newStatus })
      .eq("id", applicationId)
      .eq("user_id", userId);

    if (updateError) throw new Error(updateError.message);

    await supabase.from("application_status_history").insert({
      application_id: applicationId,
      user_id: userId,
      old_status: oldStatus,
      new_status: newStatus,
      changed_at: new Date().toISOString(),
    });
  },

  async updateJobApplication(
    supabase: SupabaseClient,
    applicationId: string,
    userId: string,
    updates: JobApplicationUpdate
  ): Promise<void> {
    const newStatus = updates.current_status;
    let oldStatus: string | null = null;

    if (newStatus !== undefined) {
      const { data: row } = await supabase
        .from("job_applications")
        .select("current_status")
        .eq("id", applicationId)
        .eq("user_id", userId)
        .single();
      oldStatus = (row?.current_status ?? null) as string | null;
    }

    const { error } = await supabase
      .from("job_applications")
      .update(updates)
      .eq("id", applicationId)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);

    if (newStatus !== undefined) {
      await supabase.from("application_status_history").insert({
        application_id: applicationId,
        user_id: userId,
        old_status: oldStatus,
        new_status: newStatus,
        changed_at: new Date().toISOString(),
      });
    }
  },

  async deleteJobApplication(
    supabase: SupabaseClient,
    applicationId: string,
    userId: string
  ): Promise<void> {
    const { error } = await supabase
      .from("job_applications")
      .delete()
      .eq("id", applicationId)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
  },
};
