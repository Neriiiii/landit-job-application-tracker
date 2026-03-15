"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { FormMessage } from "@/components/ui/FormMessage";
import type { InterviewQuestion, InterviewQuestionCategory } from "@/lib/types/interview-questions";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: InterviewQuestion | null;
  categories: InterviewQuestionCategory[];
  initialCategoryId?: string | null;
  onSave: (question: { categoryId: string; question: string }) => void;
};

export function InterviewQuestionDialog({
  open,
  onOpenChange,
  question,
  categories,
  initialCategoryId,
  onSave,
}: Props) {
  const [categoryId, setCategoryId] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      const defaultCat =
        question?.categoryId ??
        initialCategoryId ??
        categories[0]?.id ??
        "";
      setCategoryId(defaultCat);
      setQuestionText(question?.question ?? "");
      setError(null);
    }
  }, [open, question, categories, initialCategoryId]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const q = questionText.trim();
    if (!q) {
      setError("Question is required.");
      return;
    }
    if (!categoryId) {
      setError("Please select a category.");
      return;
    }
    onSave({ categoryId, question: q });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-h-0 flex flex-col sm:max-w-[500px]">
        <DialogHeader className="shrink-0 bg-background">
          <DialogTitle>{question ? "Edit question" : "Add question"}</DialogTitle>
          <DialogDescription>
            Add a question and choose which category it belongs to.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4">
            {error && <FormMessage variant="error">{error}</FormMessage>}
            <div className="grid gap-2">
              <Label htmlFor="q-category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="q-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="q-text">Question</Label>
              <RichTextEditor
                value={questionText}
                onChange={(html) => setQuestionText(html)}
                placeholder="e.g. Tell me about yourself."
                minHeight="5rem"
                className="resize-none"
              />
            </div>
          </div>
          <div className="shrink-0 border-t border-border bg-background p-4">
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">{question ? "Save" : "Add"}</Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
