"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Label } from "@/components/ui/Label";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { RteContent } from "@/components/ui/RteContent";
import { AppPageHeader } from "@/components/layout/PageHeader";
import { AppPageTitleBlock } from "@/components/layout/AppPageTitleBlock";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  HelpCircle,
  Plus,
  Pencil,
  Trash2,
  Lightbulb,
  MoreVertical,
  RotateCcw,
  Loader2,
} from "lucide-react";
import type { InterviewQuestionCategory, InterviewQuestion } from "@/lib/types/interview-questions";
import { generateId } from "@/lib/interview-questions-storage";
import {
  getInterviewData,
  saveInterviewData as saveInterviewDataAction,
  saveNote as saveNoteAction,
  resetInterviewDataToDefaults as resetInterviewDataToDefaultsAction,
} from "@/app/actions/interview-questions";
import { INTERVIEW_ANSWER_TIPS } from "@/lib/interview-tips";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { InterviewCategoryDialog } from "./InterviewCategoryDialog";
import { InterviewQuestionDialog } from "./InterviewQuestionDialog";

const TIP_ROTATION_MS = 10000;
const NOTE_SAVE_DEBOUNCE_MS = 400;

type Props = { userId: string };

export function InterviewQuestionsClient({ userId }: Props) {
  const [categories, setCategories] = useState<InterviewQuestionCategory[]>([]);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<InterviewQuestionCategory | null>(null);
  const [editQuestion, setEditQuestion] = useState<InterviewQuestion | null>(null);
  const [addQuestionCategoryId, setAddQuestionCategoryId] = useState<string | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<InterviewQuestionCategory | null>(null);
  const [deleteQuestion, setDeleteQuestion] = useState<InterviewQuestion | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tipIndex, setTipIndex] = useState(0);
  const noteDebounceRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    const id = setInterval(
      () => setTipIndex((i) => (i + 1) % INTERVIEW_ANSWER_TIPS.length),
      TIP_ROTATION_MS,
    );
    return () => clearInterval(id);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await getInterviewData(userId);
    setCategories(data.categories);
    setQuestions(data.questions);
    setNotes(data.notes ?? {});
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const persistData = useCallback(
    async (newCategories: InterviewQuestionCategory[], newQuestions: InterviewQuestion[]) => {
      const result = await saveInterviewDataAction(userId, {
        categories: newCategories,
        questions: newQuestions,
      });
      setCategories(result.categories);
      setQuestions(result.questions);
    },
    [userId],
  );

  const setNote = useCallback(
    (questionId: string, value: string) => {
      setNotes((prev) => ({ ...prev, [questionId]: value }));
      const existing = noteDebounceRef.current[questionId];
      if (existing) clearTimeout(existing);
      noteDebounceRef.current[questionId] = setTimeout(() => {
        delete noteDebounceRef.current[questionId];
        saveNoteAction(userId, questionId, value);
      }, NOTE_SAVE_DEBOUNCE_MS);
    },
    [userId],
  );

  function handleAddCategory() {
    setEditCategory(null);
    setCategoryDialogOpen(true);
  }

  function handleEditCategory(cat: InterviewQuestionCategory) {
    setEditCategory(cat);
    setCategoryDialogOpen(true);
  }

  async function handleSaveCategory(payload: { title: string; description: string }) {
    if (editCategory) {
      const next = categories.map((c) =>
        c.id === editCategory.id
          ? { ...c, title: payload.title, description: payload.description }
          : c,
      );
      await persistData(next, questions);
    } else {
      const nextCat: InterviewQuestionCategory = {
        id: generateId(),
        title: payload.title,
        description: payload.description,
        sortOrder: categories.length,
      };
      await persistData([...categories, nextCat], questions);
    }
    setCategoryDialogOpen(false);
  }

  function handleAddQuestion(categoryId?: string) {
    setEditQuestion(null);
    setAddQuestionCategoryId(categoryId ?? null);
    setQuestionDialogOpen(true);
  }

  function handleEditQuestion(q: InterviewQuestion) {
    setEditQuestion(q);
    setQuestionDialogOpen(true);
  }

  async function handleSaveQuestion(payload: { categoryId: string; question: string }) {
    const maxOrder = Math.max(0, ...questions.map((q) => q.sortOrder));

    if (editQuestion) {
      const next = questions.map((q) =>
        q.id === editQuestion.id
          ? { ...q, categoryId: payload.categoryId, question: payload.question }
          : q,
      );
      await persistData(categories, next);
    } else {
      const newQ: InterviewQuestion = {
        id: generateId(),
        categoryId: payload.categoryId,
        question: payload.question,
        sortOrder: maxOrder + 1,
      };
      await persistData(categories, [...questions, newQ]);
    }
    setQuestionDialogOpen(false);
    setAddQuestionCategoryId(null);
  }

  async function handleConfirmDeleteCategory() {
    if (!deleteCategory) return;
    setDeleting(true);
    try {
      const nextCats = categories.filter((c) => c.id !== deleteCategory.id);
      const nextQuestions = questions.filter((q) => q.categoryId !== deleteCategory.id);
      await persistData(nextCats, nextQuestions);
      setDeleteCategory(null);
    } finally {
      setDeleting(false);
    }
  }

  async function handleConfirmDeleteQuestion() {
    if (!deleteQuestion) return;
    setDeleting(true);
    try {
      const next = questions.filter((q) => q.id !== deleteQuestion.id);
      await persistData(categories, next);
      setDeleteQuestion(null);
    } finally {
      setDeleting(false);
    }
  }

  async function handleConfirmReset() {
    setResetting(true);
    try {
      const result = await resetInterviewDataToDefaultsAction(userId);
      setCategories(result.categories);
      setQuestions(result.questions);
      setNotes({});
      setSearchQuery("");
      setSelectedCategoryId(null);
      setShowResetConfirm(false);
    } finally {
      setResetting(false);
    }
  }

  const questionsByCategory = categories.map((cat) => ({
    category: cat,
    questions: questions
      .filter((q) => q.categoryId === cat.id)
      .sort((a, b) => a.sortOrder - b.sortOrder),
  }));

  const query = searchQuery.trim().toLowerCase();
  const filteredQuestionsByCategory = questionsByCategory
    .filter(({ category }) => selectedCategoryId === null || category.id === selectedCategoryId)
    .map(({ category, questions: qs }) => ({
      category,
      questions: query
        ? qs.filter(
            (q) =>
              q.question.toLowerCase().includes(query) ||
              category.title.toLowerCase().includes(query),
          )
        : qs,
    }))
    .filter(({ questions: qs }) => qs.length > 0 || !query);

  return (
    <div className="flex flex-col h-screen max-h-screen sm:overflow-hidden">
      <AppPageHeader title="Interview questions" />
      <div className="flex-1 min-h-0 flex flex-col max-sm:gap-3 gap-4 max-sm:p-4 p-8 overflow-y-auto">
        <AppPageTitleBlock
          title="Prepare your answers"
          description="Add, edit, and organize questions by category. Your notes are saved to your account."
        />
        <div className="grid min-h-0 flex-1 grid-cols-1 items-stretch max-sm:gap-3 gap-4 lg:grid-cols-3">
          <div className="flex flex-col gap-4 lg:col-span-2 order-2 lg:order-none min-w-0 max-md:p-4 pb-8 ">
            {questionsByCategory.length > 0 ? (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 w-full">
                <Input
                  type="search"
                  placeholder="Search questions or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 min-w-0"
                />
                <div className="w-[200px] max-sm:w-full">
                  <Select
                    value={selectedCategoryId ?? "all"}
                    onValueChange={(v) => setSelectedCategoryId(v === "all" ? null : v)}
                  >
                    <SelectTrigger className="w-full h-full">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : null}
            <div className="flex flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddCategory}
                  className="gap-2 flex-1 sm:w-auto"
                >
                  <Plus className="h-4 w-4" />
                  Add category
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddQuestion()}
                  className="gap-2 flex-1 sm:w-auto"
                >
                  <Plus className="h-4 w-4" />
                  Add question
                </Button>
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setShowResetConfirm(true)}
                className="gap-2 max-sm:!text-destructive sm:w-auto hover:!bg-destructive hover:!text-destructive-foreground hover:border-destructive"
                aria-label="Reset to default questions"
              >
                <RotateCcw className="h-4 w-4 shrink-0" />
                <span className="">Reset</span>
              </Button>
            </div>

            {loading ? (
              <Card className="flex flex-1 flex-col">
                <CardContent className="flex flex-1 p-6">
                  <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
                  </div>
                </CardContent>
              </Card>
            ) : questionsByCategory.length === 0 ? (
              <Card>
                <CardContent className="flex min-h-48 flex-col items-center justify-center py-12 text-center">
                  <HelpCircle className="h-12 w-12 shrink-0 text-muted-foreground/60" />
                  <p className="mt-3 text-sm font-medium text-foreground">No categories yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add a category (e.g. About you, Behavioral) then add questions.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    className="mt-4 gap-2"
                    onClick={handleAddCategory}
                  >
                    <Plus className="h-4 w-4" />
                    Add category
                  </Button>
                </CardContent>
              </Card>
            ) : filteredQuestionsByCategory.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  No questions or categories match your search. Try a different query or category.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {filteredQuestionsByCategory.map(({ category, questions: qs }) => (
                  <Card key={category.id}>
                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                      <div className="min-w-0">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <HelpCircle className="h-5 w-5 shrink-0 text-muted-foreground" />
                          {category.title}
                        </CardTitle>
                        {category.description ? (
                          <div className="text-muted-foreground text-xs sm:text-sm">
                            <RteContent content={category.description} as="div" />
                          </div>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <div className="lg:hidden">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                aria-label="Category actions"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                                <Pencil className="h-4 w-4" />
                                Edit category
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAddQuestion(category.id)}>
                                <Plus className="h-4 w-4" />
                                Add question
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteCategory(category)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete category
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="hidden lg:flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditCategory(category)}
                            aria-label="Edit category"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteCategory(category)}
                            aria-label="Delete category"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={() => handleAddQuestion(category.id)}
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add question
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {qs.length === 0 ? (
                        <p className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
                          No questions in this category. Add one above.
                        </p>
                      ) : (
                        qs.map((q) => (
                          <div
                            key={q.id}
                            className="group flex flex-col gap-2 rounded-lg border border-border bg-muted/10 p-4"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-medium text-foreground min-w-0 flex-1">
                                {q.question}
                              </p>
                              <div className="flex shrink-0 gap-1 lg:opacity-0 lg:transition-opacity lg:group-hover:opacity-100">
                                <div className="lg:hidden">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        aria-label="Question actions"
                                      >
                                        <MoreVertical className="h-3.5 w-3.5" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleEditQuestion(q)}>
                                        <Pencil className="h-4 w-4" />
                                        Edit question
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-destructive focus:text-destructive"
                                        onClick={() => setDeleteQuestion(q)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        Delete question
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                                <div className="hidden lg:flex gap-1">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handleEditQuestion(q)}
                                    aria-label="Edit question"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                    onClick={() => setDeleteQuestion(q)}
                                    aria-label="Delete question"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div className="grid gap-2">
                              <Label
                                htmlFor={`notes-${q.id}`}
                                className="text-xs text-muted-foreground"
                              >
                                Your notes / answer outline
                              </Label>
                              <RichTextEditor
                                value={notes[q.id] ?? ""}
                                onChange={(html) => setNote(q.id, html)}
                                placeholder="Jot down key points, STAR outline, or a full answer..."
                                minHeight="6rem"
                                className="resize-none"
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-6 lg:col-span-1 order-1 lg:order-none w-full min-w-0 lg:pt-0">
            <Card className="sticky top-4 lg:-top-5 self-start border-peach/30 bg-peach/10 w-full min-w-0">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lightbulb className="h-4 w-4 shrink-0 text-amber-500" />
                  Tips for answering interviews
                </CardTitle>
                <CardDescription>Use these when preparing and during interviews.</CardDescription>
              </CardHeader>
              <CardContent className="w-full min-w-0">
                {/* Mobile tips */}
                <div
                  className=" lg:hidden min-h-14 w-full min-w-0"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <div
                    key={tipIndex}
                    className="flex gap-2 text-sm text-muted-foreground animate-in fade-in duration-2000"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    <span className="leading-relaxed">{INTERVIEW_ANSWER_TIPS[tipIndex]}</span>
                  </div>
                </div>
                {/* Desktop tips */}

                <div className="max-lg:hidden flex flex-col gap-2 text-sm text-muted-foreground">
                  {[0, 1, 2].map((offset) => {
                    const index = (tipIndex + offset) % INTERVIEW_ANSWER_TIPS.length;

                    return (
                      <div key={index} className="flex gap-2 animate-in fade-in duration-2000">
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                        <span className="leading-relaxed">{INTERVIEW_ANSWER_TIPS[index]}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <InterviewCategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        category={editCategory}
        onSave={handleSaveCategory}
      />
      <InterviewQuestionDialog
        open={questionDialogOpen}
        onOpenChange={setQuestionDialogOpen}
        question={editQuestion}
        categories={categories}
        initialCategoryId={addQuestionCategoryId}
        onSave={handleSaveQuestion}
      />
      <ConfirmDialog
        open={!!deleteCategory}
        onOpenChange={(open) => !open && setDeleteCategory(null)}
        title="Delete category"
        description={
          deleteCategory
            ? `Delete "${deleteCategory.title}" and all ${questions.filter((q) => q.categoryId === deleteCategory.id).length} question(s) inside? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDeleteCategory}
        loading={deleting}
        variant="destructive"
      />
      <ConfirmDialog
        open={!!deleteQuestion}
        onOpenChange={(open) => !open && setDeleteQuestion(null)}
        title="Delete question"
        description={
          deleteQuestion
            ? "Are you sure you want to remove this question? Your notes for it will also be removed."
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDeleteQuestion}
        loading={deleting}
        variant="destructive"
      />
      <ConfirmDialog
        open={showResetConfirm}
        onOpenChange={setShowResetConfirm}
        title="Reset to default questions"
        description="Replace all your categories and questions with the default set? Your notes will also be cleared."
        confirmLabel="Reset"
        cancelLabel="Cancel"
        onConfirm={handleConfirmReset}
        loading={resetting}
        variant="destructive"
      />
    </div>
  );
}
