export { DashboardTitleBlock } from "./components/DashboardTitleBlock";
export { DashboardStats } from "./components/DashboardStats";
export { DashboardHealthGoalRow, DashboardJobSearchHealth } from "./components/DashboardHealthGoalRow";
export { DashboardWeeklyGoal } from "./components/DashboardWeeklyGoal";
export { DashboardPipeline } from "./components/DashboardPipeline";
export { DashboardAside } from "./components/DashboardAside";
export { DashboardQuickLinks } from "./components/DashboardQuickLinks";

export { getJobSearchHealth } from "./services/dashboardHealthService";
export { useJobLinks } from "./hooks/useJobLinks";
export {
  loadJobLinks,
  saveJobLinks,
  getJobLinksStorageKey,
  DEFAULT_ENTRY,
  DEFAULT_LINK_COLOR,
} from "./services/jobLinksService";

export type { JobLink, HealthStatus, DashboardStatsData } from "./types";
