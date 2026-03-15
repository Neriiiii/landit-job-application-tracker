import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LandingPageContent } from "@/app/page";

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

describe("Landing page", () => {
  it("shows Get started and auth CTAs when user is not logged in", () => {
    render(<LandingPageContent user={null} requireInviteCode={false} />);

    expect(screen.getAllByRole("button", { name: /get started/i }).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /start tracking free/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /get started — it's free/i })).toBeInTheDocument();
  });

  it("shows Dashboard and Go to Dashboard when user is logged in", () => {
    const user = { id: "user-1", email: "u@test.com" } as unknown as import("@supabase/supabase-js").User;
    render(<LandingPageContent user={user} requireInviteCode={false} />);

    expect(screen.getAllByRole("link", { name: /dashboard/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/go to dashboard/i).length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: /start tracking free/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /get started — it's free/i })).not.toBeInTheDocument();
  });

  it("renders main sections and content", () => {
    render(<LandingPageContent user={null} requireInviteCode={false} />);

    expect(screen.getAllByRole("link", { name: /features/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /how it works/i }).length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: /built for how you job hunt/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /ready to land it\?/i })).toBeInTheDocument();
  });
});
