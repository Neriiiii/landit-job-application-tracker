"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUserInAction } from "@/lib/supabase/auth";
import { toSafeMessage } from "@/lib/safe-errors";
import type {
  ChecklistItem,
  ChecklistItemInsert,
  ChecklistItemUpdate,
} from "@/features/checklist/types";
import { checklistService } from "@/features/checklist/services/checklistService";
import {
  checklistItemInsertSchema,
  checklistItemUpdateSchema,
} from "@/lib/validations/checklist";

export async function getChecklistItems(userId: string): Promise<ChecklistItem[]> {
  const user = await requireUserInAction();
  try {
    const supabase = await createClient();
    return await checklistService.getChecklistItems(supabase, user.id);
  } catch (e) {
    throw new Error(toSafeMessage(e, "getChecklistItems"));
  }
}

export async function deleteAllFakeChecklistItems(userId: string): Promise<number> {
  const user = await requireUserInAction();
  try {
    const supabase = await createClient();
    return await checklistService.deleteAllFakeChecklistItems(supabase, user.id);
  } catch (e) {
    throw new Error(toSafeMessage(e, "deleteAllFakeChecklistItems"));
  }
}

export async function createChecklistItem(
  userId: string,
  input: Omit<ChecklistItemInsert, "user_id" | "sort_order">
): Promise<ChecklistItem> {
  const user = await requireUserInAction();
  const parsed = checklistItemInsertSchema.safeParse(input);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((e) => e.message).join("; ") || "Invalid input.";
    throw new Error(msg);
  }
  try {
    const supabase = await createClient();
    return await checklistService.createChecklistItem(supabase, user.id, parsed.data as Omit<ChecklistItemInsert, "user_id" | "sort_order">);
  } catch (e) {
    throw new Error(toSafeMessage(e, "createChecklistItem"));
  }
}

export async function updateChecklistItem(
  id: string,
  userId: string,
  updates: ChecklistItemUpdate
): Promise<void> {
  const user = await requireUserInAction();
  const parsed = checklistItemUpdateSchema.safeParse(updates);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((e) => e.message).join("; ") || "Invalid input.";
    throw new Error(msg);
  }
  try {
    const supabase = await createClient();
    return await checklistService.updateChecklistItem(supabase, id, user.id, parsed.data as ChecklistItemUpdate);
  } catch (e) {
    throw new Error(toSafeMessage(e, "updateChecklistItem"));
  }
}

export async function reorderChecklistItems(
  userId: string,
  itemIds: string[]
): Promise<void> {
  const user = await requireUserInAction();
  try {
    const supabase = await createClient();
    return await checklistService.reorderChecklistItems(supabase, user.id, itemIds);
  } catch (e) {
    throw new Error(toSafeMessage(e, "reorderChecklistItems"));
  }
}

export async function deleteChecklistItem(
  id: string,
  userId: string
): Promise<void> {
  const user = await requireUserInAction();
  try {
    const supabase = await createClient();
    return await checklistService.deleteChecklistItem(supabase, id, user.id);
  } catch (e) {
    throw new Error(toSafeMessage(e, "deleteChecklistItem"));
  }
}
