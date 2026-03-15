/** Resume sub-tab: builder, preview, PDF export, and resume files library. */
import { requireUser } from "@/lib/supabase/auth";
import { DocumentSubTabClient } from "../DocumentSubTabClient";

export default async function ResumeSubTabPage() {
  const user = await requireUser();

  return <DocumentSubTabClient userId={user.id} type="resume" />;
}
