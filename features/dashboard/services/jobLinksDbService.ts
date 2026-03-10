import type { SupabaseClient } from "@supabase/supabase-js";
import type { JobLinkRow } from "../types";

function mapRow(row: Record<string, unknown>): JobLinkRow {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    name: row.name as string,
    url: row.url as string,
    sort_order: (row.sort_order as number) ?? 0,
    color: row.color as string | undefined,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export const jobLinksDbService = {
  async getJobLinks(
    supabase: SupabaseClient,
    userId: string
  ): Promise<JobLinkRow[]> {
    const { data, error } = await supabase
      .from("job_links")
      .select("*")
      .eq("user_id", userId)
      .order("sort_order", { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
  },

  async createJobLink(
    supabase: SupabaseClient,
    userId: string,
    input: { name: string; url: string; sort_order?: number; color?: string }
  ): Promise<JobLinkRow> {
    const payload: Record<string, unknown> = {
      user_id: userId,
      name: input.name.trim(),
      url: input.url.trim(),
      sort_order: input.sort_order ?? 0,
    };
    if (input.color !== undefined) payload.color = input.color;
    const { data, error } = await supabase
      .from("job_links")
      .insert(payload)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapRow(data as Record<string, unknown>);
  },

  async updateJobLink(
    supabase: SupabaseClient,
    id: string,
    userId: string,
    updates: { name?: string; url?: string; sort_order?: number; color?: string }
  ): Promise<void> {
    const payload: Record<string, unknown> = {};
    if (updates.name !== undefined) payload.name = updates.name.trim();
    if (updates.url !== undefined) payload.url = updates.url.trim();
    if (updates.sort_order !== undefined) payload.sort_order = updates.sort_order;
    if (updates.color !== undefined) payload.color = updates.color;
    if (Object.keys(payload).length === 0) return;

    const { error } = await supabase
      .from("job_links")
      .update(payload)
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
  },

  async deleteJobLink(
    supabase: SupabaseClient,
    id: string,
    userId: string
  ): Promise<void> {
    const { error } = await supabase
      .from("job_links")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
  },
};
