import { z } from "zod";

const MAX_NAME = 200;
const MAX_URL = 2048;
const HEX_COLOR = z.string().regex(/^#[0-9A-Fa-f]{3,6}$/, "Use a hex color (e.g. #006778)").optional();

export const jobLinkCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(MAX_NAME),
  url: z.string().min(1, "URL is required").url("Enter a valid URL").max(MAX_URL),
  sort_order: z.number().int().min(0).optional(),
  color: HEX_COLOR,
});

export const jobLinkUpdateSchema = z.object({
  name: z.string().min(1).max(MAX_NAME).optional(),
  url: z.string().url().max(MAX_URL).optional(),
  sort_order: z.number().int().min(0).optional(),
  color: HEX_COLOR,
}).strict();

export type JobLinkCreateInput = z.infer<typeof jobLinkCreateSchema>;
export type JobLinkUpdateInput = z.infer<typeof jobLinkUpdateSchema>;
