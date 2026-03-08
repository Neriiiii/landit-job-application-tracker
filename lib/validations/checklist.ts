import { z } from "zod";
import { CHECKLIST_STATUSES } from "@/features/checklist/types";

const MAX_NAME = 500;
const MAX_DESCRIPTION = 2_000;
const MAX_LINK = 2048;

const checklistStatusSchema = z.enum(CHECKLIST_STATUSES as unknown as [string, ...string[]]);

export const checklistItemInsertSchema = z.object({
  name: z.string().min(1, "Name is required").max(MAX_NAME),
  description: z.string().max(MAX_DESCRIPTION).nullable().optional(),
  link: z.union([z.string().url().max(MAX_LINK), z.literal("")]).nullable().optional(),
  status: checklistStatusSchema.default("Not started"),
}).transform((data) => ({
  ...data,
  link: data.link === "" || data.link === undefined ? null : data.link,
  description: data.description ?? null,
}));

export const checklistItemUpdateSchema = z.object({
  name: z.string().min(1).max(MAX_NAME).optional(),
  description: z.string().max(MAX_DESCRIPTION).nullable().optional(),
  link: z.string().url().max(MAX_LINK).nullable().optional(),
  status: checklistStatusSchema.optional(),
}).strict();

export type ChecklistItemInsertInput = z.infer<typeof checklistItemInsertSchema>;
export type ChecklistItemUpdateInput = z.infer<typeof checklistItemUpdateSchema>;
