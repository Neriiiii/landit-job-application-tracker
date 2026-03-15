/** Dashboard page: stats, weekly goal, job search health, pipeline chart, aside (interviews, tip, recent apps), quick links. */
import { requireUser } from "@/lib/supabase/auth";
import {
  getJobApplications,
  getUpcomingInterviews,
  JOB_STATUSES,
  type JobApplication,
  type JobStatus,
} from "@/features/job-applications";
import { getWeeklyApplicationGoal } from "@/app/actions/user-settings";
import { getJobLinks } from "@/app/actions/job-links";
import { AppPageHeader } from "@/components/layout/PageHeader";
import {
  DashboardTitleBlock,
  DashboardStats,
  DashboardJobSearchHealth,
  DashboardWeeklyGoal,
  DashboardPipeline,
  DashboardAside,
  DashboardQuickLinks,
  getJobSearchHealth,
} from "@/features/dashboard";

const JOB_HUNTING_TIPS = [
  "Tailor your resume and cover letter to each role. Mention the company and role by name.",
  "Apply within 24–48 hours of a job posting when you can—some teams review applications in order.",
  "Follow up once after applying if you haven't heard back in 1–2 weeks. Keep it brief and polite.",
  "Use the STAR method (Situation, Task, Action, Result) to structure your interview answers.",
  "Research the company's recent news, values, and products before every interview.",
  "Set a weekly application goal and track it. Consistency beats sporadic bursts.",
  "Reach out to people at the company on LinkedIn before or after applying—many roles are filled via referral.",
  "Keep a spreadsheet or tracker of applications so you can follow up and prepare for interviews.",
  "Practice answering common questions out loud. It builds confidence and clarity.",
  "Send a thank-you email within 24 hours of an interview. Mention something specific from the conversation.",
  "Focus on quality over quantity. A few strong, tailored applications often outperform dozens of generic ones.",
  "Update your LinkedIn and resume to match the keywords in job descriptions you're targeting.",
];

function getThisWeekStartEnd(): { start: Date; end: Date } {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const start = new Date(now);
  start.setDate(now.getDate() + mondayOffset);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export default async function DashboardPage() {
  const user = await requireUser();
  const [applications, weeklyGoal, upcomingInterviews, jobLinks] = await Promise.all([
    getJobApplications(user.id),
    getWeeklyApplicationGoal(user.id),
    getUpcomingInterviews(user.id),
    getJobLinks(user.id),
  ]);

  const { start: weekStart, end: weekEnd } = getThisWeekStartEnd();
  const applicationsThisWeek = applications.filter((a: JobApplication) => {
    const created = new Date(a.created_at).getTime();
    return created >= weekStart.getTime() && created <= weekEnd.getTime();
  }).length;

  const byStatus = JOB_STATUSES.reduce(
    (acc, status) => {
      acc[status] = applications.filter(
        (a: JobApplication) => a.current_status === status,
      ).length;
      return acc;
    },
    {} as Record<JobStatus, number>,
  );

  const activeCount = byStatus.Wishlist + byStatus.Applied + byStatus.Interview;
  const offerCount = byStatus.Offer;
  const closedCount = byStatus.Rejected + byStatus.Ghosted;
  const total = applications.length;
  const maxInStatus = Math.max(...Object.values(byStatus), 1);

  const recentApplications = applications.slice(0, 3);

  const tipIndex = (new Date().getDate() + new Date().getMonth() * 31) % JOB_HUNTING_TIPS.length;
  const jobTip = JOB_HUNTING_TIPS[tipIndex];

  const { healthStatus, healthMessages } = getJobSearchHealth(
    total,
    activeCount,
    offerCount,
    applicationsThisWeek,
    weeklyGoal,
    upcomingInterviews.length,
    { Wishlist: byStatus.Wishlist, Applied: byStatus.Applied },
  );

  return (
    <div className="flex flex-col h-screen max-h-screen sm:overflow-hidden">
      <AppPageHeader title={"Dashboard"} />
      {/* This is your scrollable content area */}
      <div className="flex-1 min-h-0 flex flex-col max-sm:gap-3 gap-4  max-sm:p-4 p-8 overflow-hidden overflow-y-auto">
        <DashboardTitleBlock userId={user.id} />
        <div className="grid grid-cols-1 gap-4  max-sm:gap-3 xl:grid-cols-12 xl:gap-4 flex-1 grid-rows-[1fr]">
          {/* left column */}
          <div className="flex flex-col gap-4 xl:col-span-8 xl:h-full max-sm:gap-3 min-h-0">
            <DashboardStats stats={{ total, activeCount, offerCount, closedCount }} />
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3 max-sm:gap-3 lg:grid-cols-2 flex-1 min-h-0">
              <div className="xl:col-span-1 lg:col-span-1 flex-1 min-h-0">
                <DashboardWeeklyGoal
                  userId={user.id}
                  applicationsThisWeek={applicationsThisWeek}
                  initialGoal={weeklyGoal ?? 0}
                />
              </div>
              <div className="xl:col-span-2  lg:col-span-1 flex-1 min-h-0">
                <DashboardJobSearchHealth
                  healthStatus={healthStatus}
                  healthMessages={healthMessages}
                />
              </div>
              <div className="xl:col-span-2 lg:col-span-2 flex-1 min-h-0">
                <DashboardPipeline
                  byStatus={byStatus}
                  total={total}
                  maxInStatus={maxInStatus}
                  userId={user.id}
                />
              </div>
              <div className="flex flex-col xl:col-span-1 lg:col-span-2 flex-1 min-h-0">
                <DashboardQuickLinks userId={user.id} initialJobLinks={jobLinks} />
              </div>
            </div>
          </div>
          {/* right column */}
          <div className="flex flex-col xl:col-span-4 xl:h-full min-h-0">
            <DashboardAside
              upcomingInterviews={upcomingInterviews}
              jobTip={jobTip}
              recentApplications={recentApplications}
              totalApplications={applications.length}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
