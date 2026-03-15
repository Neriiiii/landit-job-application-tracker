"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/Button";
import { GripVertical, Pencil, Trash2, ExternalLink } from "lucide-react";
import type { ChecklistItem } from "@/lib/types/checklist";
import { CHECKLIST_STATUS_COLORS } from "@/lib/types/checklist";
import { cn } from "@/lib/utils";
import { RteContent } from "@/components/ui/RteContent";

type Props = {
  item: ChecklistItem;
  onEdit: (item: ChecklistItem) => void;
  onDelete: (item: ChecklistItem) => void;
};

export function ChecklistSortableRow({ item, onEdit, onDelete }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border bg-card p-3",
        isDragging && "z-50 opacity-90 shadow-lg"
      )}
    >
      <button
        type="button"
        className="touch-none cursor-grab shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="font-medium truncate">{item.name}</p>
        {item.description && (
          <RteContent
            content={item.description}
            className="text-sm text-muted-foreground line-clamp-2 mt-0.5"
            as="div"
          />
        )}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span
            className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium text-white"
            style={{ backgroundColor: CHECKLIST_STATUS_COLORS[item.status] }}
          >
            {item.status}
          </span>
          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Link
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onEdit(item)}
          aria-label="Edit"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={() => onDelete(item)}
          aria-label="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </li>
  );
}
