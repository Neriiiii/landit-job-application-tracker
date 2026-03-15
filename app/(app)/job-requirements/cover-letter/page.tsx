/** Cover letter sub-tab: builder, preview, and cover letter files library. */
import { requireUser } from "@/lib/supabase/auth";
import { DocumentSubTabClient } from "../DocumentSubTabClient";

export default async function CoverLetterSubTabPage() {
  const user = await requireUser();

  return <DocumentSubTabClient userId={user.id} type="cover" />;
}
