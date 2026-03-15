"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { CheckSquare, CirclePlus, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import type { ChecklistItem } from "@/lib/types/checklist";
import { getRandomTip } from "@/lib/checklist-tips";
import { deleteChecklistItem, reorderChecklistItems } from "@/app/actions/checklist";
import { ChecklistItemDialog } from "./ChecklistItemDialog";
import { ChecklistProgressCard } from "./ChecklistProgressCard";
import { ChecklistSortableRow } from "./ChecklistSortableRow";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

type Props = {
  userId: string;
  initialItems: ChecklistItem[];
};

export function ChecklistClient({ userId, initialItems }: Props) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [tip, setTip] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<ChecklistItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<ChecklistItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [checklistExpanded, setChecklistExpanded] = useState(true);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  useEffect(() => {
    setTip(getRandomTip());
  }, []);

  function handleSuccess() {
    router.refresh();
  }

  function handleAdd() {
    setEditItem(null);
    setDialogOpen(true);
  }

  function handleEdit(item: ChecklistItem) {
    setEditItem(item);
    setDialogOpen(true);
  }

  async function handleConfirmDelete() {
    if (!deleteItem) return;
    setDeleting(true);
    try {
      await deleteChecklistItem(deleteItem.id, userId);
      setDeleteItem(null);
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const reordered = arrayMove(items, oldIndex, newIndex);
      setItems(reordered);
      try {
        await reorderChecklistItems(
          userId,
          reordered.map((i) => i.id),
        );
      } catch {
        router.refresh();
      }
    },
    [items, userId, router],
  );

  const checklistContent = (
    <>
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 py-10 text-center">
          <CheckSquare className="h-12 w-12 shrink-0 text-muted-foreground/60" />
          <p className="mt-3 text-sm font-medium text-foreground">No items yet</p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Add your first requirement—resume, cover letter, portfolio, and more.
          </p>
          <Button onClick={handleAdd} size="sm" className="mt-4 gap-2">
            <CirclePlus className="h-4 w-4" />
            Add item
          </Button>
        </div>
      ) : (
        <DndContext id="checklist-dnd-mobile" sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <ul className="flex flex-col gap-2">
              {items.map((item) => (
                <ChecklistSortableRow
                  key={item.id}
                  item={item}
                  onEdit={handleEdit}
                  onDelete={setDeleteItem}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 lg:grid lg:grid-cols-3 lg:items-stretch lg:gap-6">
      {/* Mobile: Tip → Progress → Expandable checklist */}
      <div className="flex flex-col gap-4 lg:hidden max-sm:gap-3 max-md:py-4 md:py-8">
        {tip && (
          <Card className="border-peach/30 bg-peach/10 shrink-0">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Lightbulb className="h-4 w-4 shrink-0 text-amber-500" />
                Tip
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{tip}</p>
            </CardContent>
          </Card>
        )}
        <div className="shrink-0">
          <ChecklistProgressCard items={items} />
        </div>
        <Card className="flex min-h-0 flex-1 flex-col border border-border/50">
          <button
            type="button"
            onClick={() => setChecklistExpanded((p) => !p)}
            className="flex w-full items-center justify-between gap-2 rounded-t-lg p-4 text-left hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-expanded={checklistExpanded}
          >
            <div className="min-w-0">
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckSquare className="h-5 w-5 shrink-0" />
                Your checklist
              </CardTitle>
              <CardDescription className="mt-0.5">
                {items.length} {items.length === 1 ? "item" : "items"}
              </CardDescription>
            </div>
            {checklistExpanded ? (
              <ChevronUp className="h-5 w-5 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
            )}
          </button>
          {checklistExpanded && (
            <CardContent className="border-t border-border pt-4">{checklistContent}</CardContent>
          )}
        </Card>
      </div>

      {/* Desktop: Checklist (left) | Progress + Tip (right) */}
      <div className="hidden min-h-0 flex-1 flex-col lg:col-span-2 lg:flex">
        <Card className="flex min-h-0 flex-1 flex-col border border-border/50">
          <CardHeader className="flex flex-row items-start justify-between gap-4 shrink-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                Your checklist
              </CardTitle>
              <CardDescription>
                Track requirements like resume, cover letter, and portfolio. Reorder by dragging.
              </CardDescription>
            </div>
            {items.length !== 0 && (
              <Button
                onClick={handleAdd}
                size="sm"
                className="gap-2 shrink-0 rounded-lg px-6 text-base"
              >
                <CirclePlus className="h-4 w-4" />
                Add item
              </Button>
            )}
          </CardHeader>
          <CardContent className="min-h-0 flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 py-10 text-center">
                <CheckSquare className="h-12 w-12 shrink-0 text-muted-foreground/60" />
                <p className="mt-3 text-sm font-medium text-foreground">No items yet</p>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  Add your first requirement—resume, cover letter, portfolio, and more.
                </p>
                <Button onClick={handleAdd} size="sm" className="mt-4 gap-2">
                  <CirclePlus className="h-4 w-4" />
                  Add item
                </Button>
              </div>
            ) : (
              <DndContext id="checklist-dnd-desktop" sensors={sensors} onDragEnd={handleDragEnd}>
                <SortableContext
                  items={items.map((i) => i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <ul className="flex flex-col gap-2">
                    {items.map((item) => (
                      <ChecklistSortableRow
                        key={item.id}
                        item={item}
                        onEdit={handleEdit}
                        onDelete={setDeleteItem}
                      />
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="hidden flex-col gap-6 lg:col-span-1 lg:flex">
        {tip && (
          <Card className="border-peach/30 bg-peach/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Lightbulb className="h-4 w-4 shrink-0 text-amber-500" />
                Tip
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{tip}</p>
            </CardContent>
          </Card>
        )}
        <ChecklistProgressCard items={items} />
      </div>

      <ChecklistItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        userId={userId}
        editItem={editItem}
        onSuccess={handleSuccess}
      />

      <ConfirmDialog
        open={!!deleteItem}
        onOpenChange={(open) => !open && setDeleteItem(null)}
        title="Delete checklist item"
        description={
          deleteItem
            ? `Are you sure you want to remove "${deleteItem.name}"? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        loading={deleting}
        variant="destructive"
      />
    </div>
  );
}
