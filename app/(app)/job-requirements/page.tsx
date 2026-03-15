/** Job requirements root: redirects to checklist sub-route. */
import { redirect } from "next/navigation";

export default function JobRequirementsPage() {
  redirect("/job-requirements/checklist");
}
