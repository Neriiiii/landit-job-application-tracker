import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ChecklistItem,
  ChecklistItemInsert,
  ChecklistItemUpdate,
} from "../types";
import { CHECKLIST_STATUSES } from "../types";

function mapRow(row: Record<string, unknown>): ChecklistItem {
  return {
    ...row,
    description: row.description ?? null,
    link: row.link ?? null,
    is_fake: row.is_fake ?? false,
  } as ChecklistItem;
}

export const checklistService = {
  async getChecklistItems(
    supabase: SupabaseClient,
    userId: string
  ): Promise<ChecklistItem[]> {
    const { data, error } = await supabase
      .from("checklist_items")
      .select("*")
      .eq("user_id", userId)
      .order("sort_order", { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
  },

  async deleteAllFakeChecklistItems(
    supabase: SupabaseClient,
    userId: string
  ): Promise<number> {
    const { data, error } = await supabase
      .from("checklist_items")
      .delete()
      .eq("user_id", userId)
      .eq("is_fake", true)
      .select("id");

    if (error) throw new Error(error.message);
    return data?.length ?? 0;
  },

  async createChecklistItem(
    supabase: SupabaseClient,
    userId: string,
    input: Omit<ChecklistItemInsert, "user_id" | "sort_order">
  ): Promise<ChecklistItem> {
    const { data: existing } = await supabase
      .from("checklist_items")
      .select("sort_order")
      .eq("user_id", userId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const sortOrder = existing?.sort_order != null ? existing.sort_order + 1 : 0;

    const status =
      input.status && CHECKLIST_STATUSES.includes(input.status as (typeof CHECKLIST_STATUSES)[number])
        ? input.status
        : "Not started";

    const { data, error } = await supabase
      .from("checklist_items")
      .insert({
        user_id: userId,
        name: input.name,
        description: input.description ?? null,
        link: input.link ?? null,
        status,
        sort_order: sortOrder,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapRow(data as Record<string, unknown>);
  },

  async updateChecklistItem(
    supabase: SupabaseClient,
    id: string,
    userId: string,
    updates: ChecklistItemUpdate
  ): Promise<void> {
    const { error } = await supabase
      .from("checklist_items")
      .update(updates)
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
  },

  async reorderChecklistItems(
    supabase: SupabaseClient,
    userId: string,
    itemIds: string[]
  ): Promise<void> {
    for (let i = 0; i < itemIds.length; i++) {
      const { error } = await supabase
        .from("checklist_items")
        .update({ sort_order: i })
        .eq("id", itemIds[i])
        .eq("user_id", userId);
      if (error) throw new Error(error.message);
    }
  },

  async deleteChecklistItem(
    supabase: SupabaseClient,
    id: string,
    userId: string
  ): Promise<void> {
    const { error } = await supabase
      .from("checklist_items")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
  },
};
