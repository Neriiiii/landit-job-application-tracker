import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Calendar, Video, ExternalLink, Clock, Lightbulb, ArrowRight } from "lucide-react";
import type { JobApplication, UpcomingInterviewRow } from "@/features/job-applications/types";

function formatInterviewDateTime(isoDate: string, timeStr?: string | null) {
  const d = new Date(isoDate + "T12:00:00");
  const dateStr = d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  if (timeStr?.trim()) {
    const [hours, minutes] = timeStr.trim().split(":");
    const hour = parseInt(hours ?? "0", 10);
    const min = minutes ? parseInt(minutes, 10) : 0;
    const t = new Date(2000, 0, 1, hour, min);
    const timeFormatted = t.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${dateStr} at ${timeFormatted}`;
  }
  return dateStr;
}

interface DashboardAsideProps {
  upcomingInterviews: UpcomingInterviewRow[];
  jobTip: string;
  recentApplications: JobApplication[];
  totalApplications: number;
}

const MAX_VISIBLE = 3;

export function DashboardAside({
  upcomingInterviews,
  jobTip,
  recentApplications,
  totalApplications,
}: DashboardAsideProps) {
  const displayedInterviews = upcomingInterviews.slice(0, MAX_VISIBLE);
  const hasMoreInterviews = upcomingInterviews.length > MAX_VISIBLE;

  return (
    <aside className="flex xl:min-h-0 xl:flex-1 flex-col gap-4">
      <Card className="flex xl:min-h-0 xl:flex-[2] flex-1 flex-col rounded-2xl border-border/80 bg-card shadow-sm ">
        <CardHeader className="flex shrink-0 flex-row items-start justify-between gap-2">
          <div className="min-w-0 space-y-2">
            <CardTitle className="flex items-center gap-2 font-semibold">
              <Calendar className="h-5 w-5 shrink-0 text-muted-foreground" />
              Upcoming interviews
            </CardTitle>
            <CardDescription>Next scheduled</CardDescription>
          </div>
          {hasMoreInterviews && (
            <Button asChild variant="ghost" size="xs" className="h-6 shrink-0 px-2 text-xs">
              <Link href="/job-applications">View all</Link>
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="flex min-h-0 flex-1 flex-col overflow-auto">
            {displayedInterviews.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {displayedInterviews.map((row) => (
                  <li
                    key={row.id}
                    className="flex flex-col gap-1 rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {row.company_name} – {row.role_title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {row.date &&
                          formatInterviewDateTime(
                            row.date,
                            row.time != null ? String(row.time) : null,
                          )}
                        {row.interview_type && <span className="ml-1">· {row.interview_type}</span>}
                      </p>
                    </div>
                    {row.interview_type === "Video" && row.meeting_link?.trim() ? (
                      <a
                        href={row.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                      >
                        <Video className="h-3.5 w-3.5" />
                        Join
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 px-4 py-6">
                <p className="text-center text-sm text-muted-foreground">
                  No interviews scheduled. Add an interview from an application to see it here.
                </p>
              </div>
            )}
          </div>
          <div className="shrink-0 border-t border-border/60 pt-4">
            <p className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <span>{jobTip}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="flex xl:min-h-0 xl:flex-[1] min-h-0 flex-1 flex-col rounded-2xl border-border/80 bg-card shadow-sm">
        <CardHeader className="flex shrink-0 flex-row items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 font-semibold">
            <Clock className="h-5 w-5 shrink-0 text-muted-foreground" />
            Recently updated
          </CardTitle>
          {totalApplications > MAX_VISIBLE && (
            <Button asChild variant="ghost" size="xs" className="h-6 px-2 text-xs">
              <Link href="/job-applications">View all</Link>
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col">
          {recentApplications.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {recentApplications.map((app) => (
                <Link key={app.id} href="/job-applications">
                  <li className="flex items-center justify-between gap-2 rounded-lg border border-transparent px-2 py-1.5 text-left transition-colors hover:border-border/60 hover:bg-muted/30">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {app.company_name} · {app.role_title}
                      </p>
                      <p className="text-xs text-muted-foreground">{app.current_status}</p>
                    </div>
                    <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                  </li>
                </Link>
              ))}
            </ul>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 px-4 py-6">
                <p className="text-center text-sm text-muted-foreground">
                  No applications yet. Add one to see it here.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </aside>
  );
}
