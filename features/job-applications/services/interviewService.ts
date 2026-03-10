import type { SupabaseClient } from "@supabase/supabase-js";
import type { Interview, UpcomingInterviewRow } from "../types";

function mapInterviewRow(row: Record<string, unknown>): Interview {
  return {
    id: row.id as string,
    application_id: row.application_id as string,
    user_id: row.user_id as string,
    round_number: (row.round_number as number) ?? 1,
    round_label: (row.round_label as string) ?? null,
    date: (row.date as string) ?? null,
    time: row.time != null ? String(row.time) : null,
    interview_type: (row.interview_type as Interview["interview_type"]) ?? null,
    meeting_link: (row.meeting_link as string) ?? null,
    status: (row.status as Interview["status"]) ?? null,
    notes: (row.notes as string) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export const interviewService = {
  async getInterviewsByApplication(
    supabase: SupabaseClient,
    applicationId: string,
    userId: string
  ): Promise<Interview[]> {
    const { data, error } = await supabase
      .from("interviews")
      .select("*")
      .eq("application_id", applicationId)
      .eq("user_id", userId)
      .order("round_number", { ascending: true })
      .order("date", { ascending: true, nullsFirst: false })
      .order("time", { ascending: true, nullsFirst: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => mapInterviewRow(row as Record<string, unknown>));
  },

  async getInterviewsForApplications(
    supabase: SupabaseClient,
    applicationIds: string[],
    userId: string
  ): Promise<Interview[]> {
    if (applicationIds.length === 0) return [];
    const { data, error } = await supabase
      .from("interviews")
      .select("*")
      .in("application_id", applicationIds)
      .eq("user_id", userId)
      .order("round_number", { ascending: true })
      .order("date", { ascending: true, nullsFirst: false })
      .order("time", { ascending: true, nullsFirst: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => mapInterviewRow(row as Record<string, unknown>));
  },

  async createInterview(
    supabase: SupabaseClient,
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
    const { data, error } = await supabase
      .from("interviews")
      .insert({
        application_id: input.application_id,
        user_id: userId,
        round_number: input.round_number ?? 1,
        round_label: input.round_label ?? null,
        date: input.date ?? null,
        time: input.time ?? null,
        interview_type: input.interview_type ?? null,
        meeting_link: input.meeting_link ?? null,
        status: input.status ?? "Scheduled",
        notes: input.notes ?? null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapInterviewRow(data as Record<string, unknown>);
  },

  async updateInterview(
    supabase: SupabaseClient,
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
    const { error } = await supabase
      .from("interviews")
      .update(updates)
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
  },

  async deleteInterview(
    supabase: SupabaseClient,
    id: string,
    userId: string
  ): Promise<void> {
    const { error } = await supabase
      .from("interviews")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
  },

  async getUpcomingInterviews(
    supabase: SupabaseClient,
    userId: string
  ): Promise<UpcomingInterviewRow[]> {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const { data, error } = await supabase
      .from("interviews")
      .select(
        `
        id,
        application_id,
        date,
        time,
        meeting_link,
        interview_type,
        job_applications!inner (
          company_name,
          role_title
        )
      `
      )
      .eq("user_id", userId)
      .gte("date", today)
      .order("date", { ascending: true })
      .order("time", { ascending: true, nullsFirst: false });

    if (error) throw new Error(error.message);

    return (data ?? []).map((row: Record<string, unknown>) => {
      const app = row.job_applications as Record<string, unknown>;
      return {
        id: row.id,
        application_id: row.application_id,
        date: row.date ?? null,
        time: row.time ?? null,
        meeting_link: row.meeting_link ?? null,
        interview_type: row.interview_type ?? null,
        company_name: (app?.company_name as string) ?? "",
        role_title: (app?.role_title as string) ?? "",
      } as UpcomingInterviewRow;
    });
  },
};
