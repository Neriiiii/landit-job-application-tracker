"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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
import {
  CHECKLIST_STATUSES,
  type ChecklistItem,
  type ChecklistStatus,
} from "@/lib/types/checklist";
import { createChecklistItem, updateChecklistItem } from "@/app/actions/checklist";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  editItem: ChecklistItem | null;
  onSuccess: () => void;
};

const emptyForm = {
  name: "",
  description: "",
  link: "",
  status: "Not started" as ChecklistStatus,
};

export function ChecklistItemDialog({ open, onOpenChange, userId, editItem, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(emptyForm.name);
  const [description, setDescription] = useState(emptyForm.description);
  const [link, setLink] = useState(emptyForm.link);
  const [status, setStatus] = useState<ChecklistStatus>(emptyForm.status);

  useEffect(() => {
    if (open) {
      if (editItem) {
        setName(editItem.name);
        setDescription(editItem.description ?? "");
        setLink(editItem.link ?? "");
        setStatus(editItem.status);
      } else {
        setName(emptyForm.name);
        setDescription(emptyForm.description);
        setLink(emptyForm.link);
        setStatus(emptyForm.status);
      }
      setError(null);
    }
  }, [open, editItem]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Name is required.");
      setLoading(false);
      return;
    }
    try {
      if (editItem) {
        await updateChecklistItem(editItem.id, userId, {
          name: trimmedName,
          description: description.trim() || null,
          link: link.trim() || null,
          status,
        });
      } else {
        await createChecklistItem(userId, {
          name: trimmedName,
          description: description.trim() || null,
          link: link.trim() || null,
          status,
        });
      }
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" className="min-h-0 flex flex-col">
        <DialogHeader className="shrink-0 bg-background">
          <DialogTitle>{editItem ? "Edit item" : "Add checklist item"}</DialogTitle>
          <DialogDescription>
            {editItem
              ? "Update the requirement details below."
              : "Add a requirement to track (e.g. Resume, Cover letter, Portfolio)."}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 max-md:p-2 space-y-4">
            {error && <FormMessage variant="error">{error}</FormMessage>}
            <div className="grid gap-2">
              <Label htmlFor="checklist-name">Name *</Label>
              <Input
                id="checklist-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Resume, Cover letter"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="checklist-description">Description</Label>
              <RichTextEditor
                value={description}
                onChange={(html) => setDescription(html)}
                placeholder="Optional notes..."
                minHeight="4rem"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="checklist-link">Link</Label>
              <Input
                id="checklist-link"
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ChecklistStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {CHECKLIST_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="shrink-0 border-t border-border bg-background p-4 max-md:p-2">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving…" : editItem ? "Save changes" : "Add item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
