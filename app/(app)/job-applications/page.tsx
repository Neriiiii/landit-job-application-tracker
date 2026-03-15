/** Job applications page: fetches applications and interviews, renders Kanban client. */
import { requireUser } from "@/lib/supabase/auth";
import {
  getJobApplications,
  getInterviewsForApplications,
  type Interview,
} from "@/features/job-applications";
import { JobApplicationsClient } from "./JobApplicationsClient";

export default async function JobApplicationsPage() {
  const user = await requireUser();
  const applications = await getJobApplications(user.id);
  const interviewAppIds = applications
    .filter((a) => a.current_status === "Interview")
    .map((a) => a.id);
  const allInterviews =
    interviewAppIds.length === 0
      ? []
      : await getInterviewsForApplications(interviewAppIds, user.id);

  const interviewsByApplicationId: Record<string, Interview[]> = {};
  for (const i of allInterviews) {
    if (!interviewsByApplicationId[i.application_id])
      interviewsByApplicationId[i.application_id] = [];
    interviewsByApplicationId[i.application_id].push(i);
  }

  return (
    <JobApplicationsClient
      userId={user.id}
      applications={applications}
      interviewsByApplicationId={interviewsByApplicationId}
    />
  );
}
