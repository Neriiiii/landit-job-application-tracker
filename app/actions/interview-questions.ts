"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUserInAction } from "@/lib/supabase/auth";
import { toSafeMessage } from "@/lib/safe-errors";
import { INTERVIEW_QUESTION_CATEGORIES } from "@/lib/interview-questions";
import { saveInterviewDataSchema } from "@/lib/validations/interview-questions";
import { interviewNoteSchema } from "@/lib/validations/interview-questions";
import type {
  InterviewQuestionCategory,
  InterviewQuestion,
} from "@/lib/types/interview-questions";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUuid(id: string): boolean {
  return UUID_REGEX.test(id);
}

export type InterviewData = {
  categories: InterviewQuestionCategory[];
  questions: InterviewQuestion[];
  notes: Record<string, string>;
};

async function seedDefaultInterviewData(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<{ categories: InterviewQuestionCategory[]; questions: InterviewQuestion[] }> {
  const categoryRows = INTERVIEW_QUESTION_CATEGORIES.map((cat, index) => ({
    user_id: userId,
    title: cat.title,
    description: cat.description,
    sort_order: index,
  }));

  const { data: insertedCategories, error: catError } = await supabase
    .from("interview_question_categories")
    .insert(categoryRows)
    .select("id, title, description, sort_order");

  if (catError) throw new Error(toSafeMessage(catError, "seedDefaultInterviewData categories"));
  const categories = (insertedCategories ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    sortOrder: row.sort_order,
  }));

  const categoryIdByIndex = new Map(categories.map((c, i) => [i, c.id]));
  const questionRows: { user_id: string; category_id: string; question: string; sort_order: number }[] = [];
  let sortOrder = 0;
  for (let i = 0; i < INTERVIEW_QUESTION_CATEGORIES.length; i++) {
    const categoryId = categoryIdByIndex.get(i)!;
    for (const q of INTERVIEW_QUESTION_CATEGORIES[i].questions) {
      questionRows.push({
        user_id: userId,
        category_id: categoryId,
        question: q.question,
        sort_order: sortOrder++,
      });
    }
  }

  const { data: insertedQuestions, error: qError } = await supabase
    .from("interview_questions")
    .insert(questionRows)
    .select("id, category_id, question, sort_order");

  if (qError) throw new Error(toSafeMessage(qError, "seedDefaultInterviewData questions"));
  const questions = (insertedQuestions ?? []).map((row) => ({
    id: row.id,
    categoryId: row.category_id,
    question: row.question,
    sortOrder: row.sort_order,
  }));

  return { categories, questions };
}

export async function getInterviewData(userId: string): Promise<InterviewData> {
  const user = await requireUserInAction();
  const supabase = await createClient();

  const { data: categoryRows, error: catError } = await supabase
    .from("interview_question_categories")
    .select("id, title, description, sort_order")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: true });

  if (catError) throw new Error(toSafeMessage(catError, "getInterviewData categories"));

  if (!categoryRows?.length) {
    const seeded = await seedDefaultInterviewData(supabase, user.id);
    return {
      categories: seeded.categories,
      questions: seeded.questions,
      notes: {},
    };
  }

  const { data: questionRows, error: qError } = await supabase
    .from("interview_questions")
    .select("id, category_id, question, sort_order")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: true });

  if (qError) throw new Error(toSafeMessage(qError, "getInterviewData questions"));

  const { data: noteRows, error: nError } = await supabase
    .from("interview_question_notes")
    .select("question_id, notes")
    .eq("user_id", user.id);

  if (nError) throw new Error(toSafeMessage(nError, "getInterviewData notes"));

  const categories: InterviewQuestionCategory[] = (categoryRows ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    sortOrder: row.sort_order,
  }));

  const questions: InterviewQuestion[] = (questionRows ?? []).map((row) => ({
    id: row.id,
    categoryId: row.category_id,
    question: row.question,
    sortOrder: row.sort_order,
  }));

  const notes: Record<string, string> = {};
  for (const row of noteRows ?? []) {
    notes[row.question_id] = row.notes ?? "";
  }

  return { categories, questions, notes };
}

export async function saveInterviewData(
  userId: string,
  payload: { categories: InterviewQuestionCategory[]; questions: InterviewQuestion[] }
): Promise<{ categories: InterviewQuestionCategory[]; questions: InterviewQuestion[] }> {
  const user = await requireUserInAction();
  const parsed = saveInterviewDataSchema.safeParse(payload);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((e) => e.message).join("; ") || "Invalid input.";
    throw new Error(msg);
  }
  const uid = user.id;
  const supabase = await createClient();
  const { categories: payloadCategories, questions: payloadQuestions } = parsed.data;

  const { data: existingCats } = await supabase
    .from("interview_question_categories")
    .select("id")
    .eq("user_id", uid);
  const { data: existingQs } = await supabase
    .from("interview_questions")
    .select("id")
    .eq("user_id", uid);

  const existingCatIds = new Set((existingCats ?? []).map((r) => r.id));
  const existingQIds = new Set((existingQs ?? []).map((r) => r.id));
  const payloadCatIds = new Set(payloadCategories.map((c) => c.id));
  const payloadQIds = new Set(payloadQuestions.map((q) => q.id));

  const categoryIdMap: Record<string, string> = {};

  for (const cat of payloadCategories) {
    if (cat.id != null && isValidUuid(cat.id) && existingCatIds.has(cat.id)) {
      await supabase
        .from("interview_question_categories")
        .update({
          title: cat.title,
          description: cat.description,
          sort_order: cat.sortOrder,
        })
        .eq("id", cat.id)
        .eq("user_id", uid);
      categoryIdMap[cat.id] = cat.id;
    } else {
      const { data: inserted, error } = await supabase
        .from("interview_question_categories")
        .insert({
          user_id: uid,
          title: cat.title,
          description: cat.description,
          sort_order: cat.sortOrder,
        })
        .select("id")
        .single();
      if (error) throw new Error(toSafeMessage(error, "upsertInterviewData insert category"));
      const key = cat.id ?? inserted!.id;
      categoryIdMap[key] = inserted!.id;
    }
  }

  for (const q of payloadQuestions) {
    const categoryId = categoryIdMap[q.categoryId] ?? q.categoryId;
    if (q.id != null && isValidUuid(q.id) && existingQIds.has(q.id)) {
      await supabase
        .from("interview_questions")
        .update({
          category_id: categoryId,
          question: q.question,
          sort_order: q.sortOrder,
        })
        .eq("id", q.id)
        .eq("user_id", uid);
    } else {
      await supabase.from("interview_questions").insert({
        user_id: uid,
        category_id: categoryId,
        question: q.question,
        sort_order: q.sortOrder,
      });
    }
  }

  const idsToDeleteQs = [...existingQIds].filter((id) => !payloadQIds.has(id));
  const idsToDeleteCats = [...existingCatIds].filter((id) => !payloadCatIds.has(id));

  if (idsToDeleteQs.length > 0) {
    await supabase
      .from("interview_question_notes")
      .delete()
      .eq("user_id", uid)
      .in("question_id", idsToDeleteQs);
    await supabase
      .from("interview_questions")
      .delete()
      .eq("user_id", uid)
      .in("id", idsToDeleteQs);
  }
  if (idsToDeleteCats.length > 0) {
    await supabase
      .from("interview_question_categories")
      .delete()
      .eq("user_id", uid)
      .in("id", idsToDeleteCats);
  }

  const { data: finalCats, error: eCat } = await supabase
    .from("interview_question_categories")
    .select("id, title, description, sort_order")
    .eq("user_id", uid)
    .order("sort_order", { ascending: true });
  if (eCat) throw new Error(toSafeMessage(eCat, "upsertInterviewData finalCats"));

  const { data: finalQs, error: eQ } = await supabase
    .from("interview_questions")
    .select("id, category_id, question, sort_order")
    .eq("user_id", uid)
    .order("sort_order", { ascending: true });
  if (eQ) throw new Error(toSafeMessage(eQ, "upsertInterviewData finalQs"));

  return {
    categories: (finalCats ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description ?? "",
      sortOrder: row.sort_order,
    })),
    questions: (finalQs ?? []).map((row) => ({
      id: row.id,
      categoryId: row.category_id,
      question: row.question,
      sortOrder: row.sort_order,
    })),
  };
}

export async function saveNote(
  userId: string,
  questionId: string,
  notes: string
): Promise<void> {
  const user = await requireUserInAction();
  const parsed = interviewNoteSchema.safeParse({ notes });
  if (!parsed.success) {
    const msg = parsed.error.issues.map((e) => e.message).join("; ") || "Invalid input.";
    throw new Error(msg);
  }
  const supabase = await createClient();

  const { data: question } = await supabase
    .from("interview_questions")
    .select("id")
    .eq("id", questionId)
    .eq("user_id", user.id)
    .single();

  if (!question) throw new Error("Question not found");

  const { error } = await supabase.from("interview_question_notes").upsert(
    {
      user_id: user.id,
      question_id: questionId,
      notes: parsed.data.notes ?? "",
    },
    { onConflict: "user_id,question_id" }
  );

  if (error) throw new Error(toSafeMessage(error, "saveNote"));
}

export async function resetInterviewDataToDefaults(userId: string): Promise<{
  categories: InterviewQuestionCategory[];
  questions: InterviewQuestion[];
}> {
  const user = await requireUserInAction();
  const supabase = await createClient();

  const { data: questionRows } = await supabase
    .from("interview_questions")
    .select("id")
    .eq("user_id", user.id);
  const questionIds = (questionRows ?? []).map((r) => r.id);

  if (questionIds.length > 0) {
    await supabase
      .from("interview_question_notes")
      .delete()
      .eq("user_id", user.id)
      .in("question_id", questionIds);
  }
  await supabase.from("interview_questions").delete().eq("user_id", user.id);
  await supabase.from("interview_question_categories").delete().eq("user_id", user.id);

  return seedDefaultInterviewData(supabase, user.id);
}
