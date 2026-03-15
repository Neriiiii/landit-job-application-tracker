/** Interview questions page: categories, questions, and per-question notes. */
import { requireUser } from "@/lib/supabase/auth";
import { InterviewQuestionsClient } from "./InterviewQuestionsClient";

export default async function InterviewQuestionsPage() {
  const user = await requireUser();

  return <InterviewQuestionsClient userId={user.id} />;
}
