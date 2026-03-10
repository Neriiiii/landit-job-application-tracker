export type JobLink = { label: string; url: string; color?: string };

export interface JobLinkRow {
  id: string;
  user_id: string;
  name: string;
  url: string;
  sort_order: number;
  color?: string;
  created_at: string;
  updated_at: string;
}

export type HealthStatus = "good" | "on-track" | "needs-attention";

export interface DashboardStatsData {
  total: number;
  activeCount: number;
  offerCount: number;
  closedCount: number;
}
