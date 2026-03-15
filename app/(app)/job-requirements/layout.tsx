/** Job requirements layout: shared header and sub-nav for checklist, resume, cover letter. */
import { requireUser } from "@/lib/supabase/auth";
import { AppPageHeader } from "@/components/layout/PageHeader";

export default async function JobRequirementsLayout({ children }: { children: React.ReactNode }) {
  await requireUser();

  return (
    <div className="flex flex-col h-screen max-h-screen sm:overflow-hidden">
      <AppPageHeader title="Job requirements" />
      <div className="flex-1 min-h-0 flex flex-col max-sm:gap-3 gap-4  max-sm:p-4 p-8 overflow-hidden overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
