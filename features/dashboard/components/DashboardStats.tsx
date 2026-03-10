import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { BarChart3, Briefcase, CheckCircle2, XCircle } from "lucide-react";
import type { DashboardStatsData } from "../types";

const DASHBOARD_STATS_CONFIG: {
  title: string;
  icon: typeof Briefcase;
  subtitle: string;
  background: string;
  getValue: (d: DashboardStatsData) => number;
}[] = [
  {
    title: "Total",
    icon: Briefcase,
    subtitle: "applications",
    background: "linear-gradient(135deg, #006778 0%, #82c9b2 50%, #cb8163 100%)",
    getValue: (d) => d.total,
  },
  {
    title: "In progress",
    icon: BarChart3,
    subtitle: "Wishlist · Applied · Interview",
    background: "linear-gradient(135deg, #cb8163 0%, #b86f52 50%, #fcd7c7 100%)",
    getValue: (d) => d.activeCount,
  },
  {
    title: "Offers",
    icon: CheckCircle2,
    subtitle: "successes",
    background: "linear-gradient(135deg, #006778 0%, #82c9b2 100%)",
    getValue: (d) => d.offerCount,
  },
  {
    title: "Closed",
    icon: XCircle,
    subtitle: "Rejected · Ghosted",
    background: "linear-gradient(135deg, #004d5c 0%, #006778 100%)",
    getValue: (d) => d.closedCount,
  },
];

export function DashboardStats({ stats }: { stats: DashboardStatsData }) {
  return (
    <div className="grid auto-rows-min gap-4 max-sm:gap-2 max-md:grid-cols-2  grid-cols-4">
      {DASHBOARD_STATS_CONFIG.map((stat) => {
        const value = stat.getValue(stats);
        const Icon = stat.icon;
        return (
          <Card
            key={stat.title}
            className="flex flex-col rounded-2xl border-0 shadow-md transition-shadow hover:shadow-lg"
            style={{ background: stat.background }}
          >
            <CardHeader className="flex flex-row items-start justify-between gap-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-white sm:text-sm">
                {stat.title}
              </CardTitle>
              <Icon className="h-3.5 w-3.5 shrink-0 text-white/80" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tabular-nums text-white sm:text-3xl">{value}</p>
              <p className="mt-0.5 text-xs text-white/90 sm:text-sm max-sm:hidden">
                {stat.subtitle}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
