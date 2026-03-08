import { z } from "zod";
import { JOB_STATUSES } from "@/features/job-applications/types";

const MAX_COMPANY_NAME = 500;
const MAX_ROLE_TITLE = 300;
const MAX_JOB_LINK = 2048;
const MAX_JOB_DESCRIPTION = 10_000;
const MAX_NOTES = 15_000;

const jobStatusSchema = z.enum(JOB_STATUSES as unknown as [string, ...string[]]);

export const jobApplicationInsertSchema = z.object({
  company_name: z.string().min(1, "Company name is required").max(MAX_COMPANY_NAME),
  role_title: z.string().min(1, "Role title is required").max(MAX_ROLE_TITLE),
  job_link: z
    .union([z.string().url().max(MAX_JOB_LINK), z.literal("")])
    .nullable()
    .optional(),
  job_description: z.string().max(MAX_JOB_DESCRIPTION).nullable().optional(),
  current_status: jobStatusSchema.optional(),
  notes: z.string().max(MAX_NOTES).nullable().optional(),
  archived: z.boolean().optional(),
  resume_file_id: z.string().uuid().nullable().optional(),
  cover_letter_file_id: z.string().uuid().nullable().optional(),
}).transform((data) => ({
  ...data,
  job_link: data.job_link === "" || data.job_link === undefined ? null : data.job_link,
}));

export const jobApplicationUpdateSchema = z.object({
  company_name: z.string().min(1).max(MAX_COMPANY_NAME).optional(),
  role_title: z.string().min(1).max(MAX_ROLE_TITLE).optional(),
  job_link: z.string().url().max(MAX_JOB_LINK).nullable().optional(),
  job_description: z.string().max(MAX_JOB_DESCRIPTION).nullable().optional(),
  current_status: jobStatusSchema.optional(),
  notes: z.string().max(MAX_NOTES).nullable().optional(),
  archived: z.boolean().optional(),
  resume_file_id: z.string().uuid().nullable().optional(),
  cover_letter_file_id: z.string().uuid().nullable().optional(),
}).strict();

export const jobStatusSchemaSingle = jobStatusSchema;

export type JobApplicationInsertInput = z.infer<typeof jobApplicationInsertSchema>;
export type JobApplicationUpdateInput = z.infer<typeof jobApplicationUpdateSchema>;
