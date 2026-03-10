import type { SupabaseClient } from "@supabase/supabase-js";
import type { JobOffer } from "../types";

function mapRow(row: Record<string, unknown>): JobOffer {
  return {
    id: row.id as string,
    application_id: row.application_id as string,
    expected_salary: (row.expected_salary as string) ?? null,
    salary_offer: (row.salary_offer as string) ?? null,
    benefits: (row.benefits as string) ?? null,
    start_date: (row.start_date as string) ?? null,
    work_days: (row.work_days as string) ?? null,
    work_time_start: (row.work_time_start as string) ?? null,
    work_time_end: (row.work_time_end as string) ?? null,
    accepted_at: (row.accepted_at as string) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export const jobOfferService = {
  async getJobOfferByApplication(
    supabase: SupabaseClient,
    applicationId: string
  ): Promise<JobOffer | null> {
    const { data, error } = await supabase
      .from("job_offers")
      .select("*")
      .eq("application_id", applicationId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(error.message);
    }
    if (!data) return null;
    return mapRow(data as Record<string, unknown>);
  },

  async upsertJobOffer(
    supabase: SupabaseClient,
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
    const { data: existing } = await supabase
      .from("job_offers")
      .select("id")
      .eq("application_id", applicationId)
      .maybeSingle();

    const payload = {
      expected_salary: input.expected_salary ?? null,
      salary_offer: input.salary_offer ?? null,
      benefits: input.benefits ?? null,
      start_date: input.start_date ?? null,
      work_days: input.work_days ?? null,
      work_time_start: input.work_time_start ?? null,
      work_time_end: input.work_time_end ?? null,
    };

    if (existing) {
      const { data, error } = await supabase
        .from("job_offers")
        .update(payload)
        .eq("application_id", applicationId)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return mapRow(data as Record<string, unknown>);
    }

    const { data, error } = await supabase
      .from("job_offers")
      .insert({ application_id: applicationId, ...payload })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapRow(data as Record<string, unknown>);
  },

  async acceptJobOffer(
    supabase: SupabaseClient,
    applicationId: string
  ): Promise<void> {
    const { error } = await supabase
      .from("job_offers")
      .update({ accepted_at: new Date().toISOString() })
      .eq("application_id", applicationId);

    if (error) throw new Error(error.message);
  },
};
