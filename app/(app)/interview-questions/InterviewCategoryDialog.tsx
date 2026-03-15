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
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { FormMessage } from "@/components/ui/FormMessage";
import type { InterviewQuestionCategory } from "@/lib/types/interview-questions";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: InterviewQuestionCategory | null;
  onSave: (category: { title: string; description: string }) => void;
};

export function InterviewCategoryDialog({
  open,
  onOpenChange,
  category,
  onSave,
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle(category?.title ?? "");
      setDescription(category?.description ?? "");
      setError(null);
    }
  }, [open, category]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const t = title.trim();
    if (!t) {
      setError("Title is required.");
      return;
    }
    onSave({ title: t, description: description.trim() });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-h-0 flex flex-col sm:max-w-[425px]">
        <DialogHeader className="shrink-0 bg-background">
          <DialogTitle>{category ? "Edit category" : "Add category"}</DialogTitle>
          <DialogDescription>
            Group your interview questions (e.g. About you, Behavioral, Technical).
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4">
            {error && <FormMessage variant="error">{error}</FormMessage>}
            <div className="grid gap-2">
              <Label htmlFor="cat-title">Title</Label>
              <Input
                id="cat-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. About you"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cat-desc">Description (optional)</Label>
              <RichTextEditor
                value={description}
                onChange={(html) => setDescription(html)}
                placeholder="e.g. Tell me about yourself, strengths, fit..."
                minHeight="4rem"
                className="resize-none"
              />
            </div>
          </div>
          <div className="shrink-0 border-t border-border bg-background p-4">
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">{category ? "Save" : "Add"}</Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
