import { z } from "zod";

const MAX_CATEGORY_TITLE = 200;
const MAX_CATEGORY_DESCRIPTION = 1_000;
const MAX_QUESTION = 2_000;
const MAX_NOTE = 10_000;

export const interviewCategorySchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "Category title is required").max(MAX_CATEGORY_TITLE),
  description: z.string().max(MAX_CATEGORY_DESCRIPTION).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const interviewQuestionSchema = z.object({
  id: z.string().uuid().optional(),
  categoryId: z.string().uuid(),
  question: z.string().min(1, "Question is required").max(MAX_QUESTION),
  sortOrder: z.number().int().min(0).optional(),
});

export const interviewNoteSchema = z.object({
  notes: z.string().max(MAX_NOTE).optional(),
});

export const saveInterviewDataSchema = z.object({
  categories: z.array(interviewCategorySchema),
  questions: z.array(interviewQuestionSchema),
});

export type SaveInterviewDataInput = z.infer<typeof saveInterviewDataSchema>;
