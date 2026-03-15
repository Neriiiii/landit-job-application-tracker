import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { JobApplicationsClient } from "@/app/(app)/job-applications/JobApplicationsClient";
import { AppProviders } from "@/testing/app-providers";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    prefetchCache: new Map(),
  }),
}));

describe("Job applications page content", () => {
  it("renders page header and title block", () => {
    render(
      <AppProviders>
        <JobApplicationsClient userId="user-1" applications={[]} />
      </AppProviders>,
    );
    expect(screen.getByRole("heading", { name: /job applications/i })).toBeInTheDocument();
    expect(screen.getByText(/track your applications/i)).toBeInTheDocument();
  });

  it("renders create application button when no applications", () => {
    render(
      <AppProviders>
        <JobApplicationsClient userId="user-1" applications={[]} />
      </AppProviders>,
    );
    expect(screen.getByRole("button", { name: /add application/i })).toBeInTheDocument();
  });
});
