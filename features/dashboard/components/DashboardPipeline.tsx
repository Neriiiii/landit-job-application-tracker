import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { JOB_STATUSES, type JobStatus } from "@/features/job-applications/types";
import { BarChart3 } from "lucide-react";

interface DashboardPipelineProps {
  byStatus: Record<JobStatus, number>;
  total: number;
  maxInStatus: number;
  userId: string;
}

const STATUS_STYLES: Record<JobStatus, { barBg: string; tagline: string; numberColor: string }> = {
  Wishlist: {
    barBg: "bg-slate-500",
    tagline: "Ready to send",
    numberColor: "text-slate-600 dark:text-slate-400",
  },
  Applied: { barBg: "bg-primary", tagline: "Waiting to hear back", numberColor: "text-primary" },
  Interview: { barBg: "bg-terracotta", tagline: "In the running", numberColor: "text-terracotta" },
  Offer: { barBg: "bg-success", tagline: "You got an offer", numberColor: "text-success" },
  Rejected: { barBg: "bg-destructive", tagline: "Not this time", numberColor: "text-destructive" },
  Ghosted: {
    barBg: "bg-zinc-600",
    tagline: "No response",
    numberColor: "text-zinc-600 dark:text-zinc-400",
  },
};

export function DashboardPipeline({
  byStatus,
  total,
  maxInStatus,
  userId,
}: DashboardPipelineProps) {
  return (
    <Card className="flex h-full min-h-0 flex-col rounded-2xl border-border/80 bg-card shadow-sm lg:gap-2 xl:gap-4">
      <CardHeader className="shrink-0  ">
        <div className="min-w-0 space-y-1.5 sm:space-y-2">
          <CardTitle className="flex items-center gap-2 text-base max-md:text-lg font-semibold leading-tight">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-muted-foreground" />
            Where your applications stand
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm leading-relaxed">
            See how many are in each stage — from first apply to offer
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden px-2 max-sm:px-0">
        <div className="grid h-full min-h-0 grid-cols-1 grid-rows-6 gap-2.5 sm:grid-cols-2 sm:grid-rows-3 sm:gap-3 lg:grid-cols-3 lg:grid-rows-2 lg:gap-4">
          {JOB_STATUSES.map((status) => {
            const count = byStatus[status];
            const pct = total > 0 ? (count / total) * 100 : 0;
            const barPct = maxInStatus > 0 ? (count / maxInStatus) * 100 : 0;
            const { barBg, tagline, numberColor } = STATUS_STYLES[status];
            return (
              <div
                key={status}
                className="group flex min-h-0 flex-col justify-between gap-1.5 rounded-xl border border-transparent bg-muted/30 px-2.5 py-2 transition-all duration-200 hover:border-border/60 hover:bg-muted/50 sm:gap-2 sm:px-3 sm:py-2.5 lg:py-3"
              >
                <div className="min-w-0 shrink-0 space-y-0.5 sm:space-y-1">
                  <div className="flex items-baseline justify-between gap-1.5 sm:gap-2">
                    <span className="truncate text-xs font-semibold text-foreground sm:text-sm">
                      {status}
                    </span>
                    <span
                      className={`shrink-0 text-sm sm:text-base tabular-nums font-semibold ${numberColor}`}
                    >
                      {count}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                    <span className="truncate text-xs text-muted-foreground">{tagline}</span>
                    <span className={`shrink-0 text-xs tabular-nums font-semibold ${numberColor}`}>
                      {total > 0 ? `${pct.toFixed(0)}%` : "—"}
                    </span>
                  </div>
                </div>
                <div className="mt-auto h-1.5 w-full overflow-hidden rounded-full bg-progress-track sm:h-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${barBg}`}
                    style={{ width: `${Math.max(barPct, count > 0 ? 4 : 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
