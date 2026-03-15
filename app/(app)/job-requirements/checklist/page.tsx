/** Checklist page: user checklist items with sort and progress. */
import { requireUser } from "@/lib/supabase/auth";
import { getChecklistItems } from "@/app/actions/checklist";
import { AppPageTitleBlock } from "@/components/layout/AppPageTitleBlock";
import { ChecklistClient } from "./ChecklistClient";

export default async function ChecklistPage() {
  const user = await requireUser();
  const items = await getChecklistItems(user.id);

  return (
    <div className="flex min-h-0 flex-1 flex-col max-sm:gap-3 gap-4">
      <AppPageTitleBlock
        title="Checklist"
        description="Track job requirements and application materials for each role."
      />
      <ChecklistClient userId={user.id} initialItems={items} />
    </div>
  );
}
