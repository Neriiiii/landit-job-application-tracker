import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardStats } from "@/features/dashboard";
import { AppPageHeader } from "@/components/layout/PageHeader";
import { AppProviders } from "@/testing/app-providers";

describe("Dashboard page content", () => {
  it("renders dashboard header and stats with mock data", () => {
    render(
      <AppProviders>
        <AppPageHeader title="Dashboard" />
      </AppProviders>,
    );
    expect(screen.getByRole("heading", { name: /dashboard/i })).toBeInTheDocument();
  });

  it("renders dashboard stats cards for total, in progress, offers, closed", () => {
    const stats = {
      total: 10,
      activeCount: 5,
      offerCount: 1,
      closedCount: 4,
    };
    render(<DashboardStats stats={stats} />);
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText(/total/i)).toBeInTheDocument();
    expect(screen.getByText(/in progress/i)).toBeInTheDocument();
    expect(screen.getByText(/offers/i)).toBeInTheDocument();
    expect(screen.getByText(/closed/i)).toBeInTheDocument();
  });
});
