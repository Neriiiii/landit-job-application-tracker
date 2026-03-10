export const CHECKLIST_STATUSES = [
  "Not started",
  "In progress",
  "Done",
] as const;

export type ChecklistStatus = (typeof CHECKLIST_STATUSES)[number];

export const CHECKLIST_STATUS_COLORS: Record<ChecklistStatus, string> = {
  "Not started": "#fcd7c7",
  "In progress": "#cb8163",
  Done: "#82c9b2",
};

export interface ChecklistItem {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  link: string | null;
  status: ChecklistStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
  is_fake: boolean;
}

export type ChecklistItemInsert = Omit<
  ChecklistItem,
  "id" | "created_at" | "updated_at" | "is_fake"
> & { is_fake?: boolean };

export type ChecklistItemUpdate = Partial<
  Omit<ChecklistItem, "id" | "user_id" | "created_at">
>;
