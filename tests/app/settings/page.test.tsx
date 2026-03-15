import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SettingsForm } from "@/app/(app)/settings/SettingsForm";
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

function renderSettingsForm(props: Parameters<typeof SettingsForm>[0]) {
  return render(
    <AppProviders>
      <SettingsForm {...props} />
    </AppProviders>,
  );
}

describe("Settings page content", () => {
  it("renders Settings header and profile section", () => {
    renderSettingsForm({
      user: {
        id: "user-1",
        email: "user@example.com",
        user_metadata: { full_name: "Test User" },
      },
      isDemoAccount: false,
    });
    expect(screen.getByRole("heading", { name: /settings/i })).toBeInTheDocument();
    expect(screen.getByText(/user@example.com/)).toBeInTheDocument();
  });

  it("renders demo data card when user is demo account", () => {
    renderSettingsForm({
      user: { id: "demo-1", email: "demo@test.com" },
      isDemoAccount: true,
    });
    expect(screen.getByRole("heading", { name: /settings/i })).toBeInTheDocument();
    expect(screen.getAllByText(/demo@test.com/).length).toBeGreaterThan(0);
  });
});
