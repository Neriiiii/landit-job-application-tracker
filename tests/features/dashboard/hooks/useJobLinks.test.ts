import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useJobLinks } from "@/features/dashboard/hooks/useJobLinks";
import type { JobLinkRow } from "@/features/dashboard/types";
import * as jobLinksActions from "@/app/actions/job-links";

vi.mock("@/app/actions/job-links", () => ({
  createJobLink: vi.fn(),
  deleteJobLink: vi.fn(),
  getJobLinks: vi.fn(),
}));

function makeRow(overrides: Partial<JobLinkRow> = {}): JobLinkRow {
  return {
    id: "id-1",
    user_id: "user-1",
    name: "Indeed",
    url: "https://indeed.com",
    sort_order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

describe("useJobLinks", () => {
  beforeEach(() => {
    vi.mocked(jobLinksActions.createJobLink).mockResolvedValue(makeRow());
    vi.mocked(jobLinksActions.deleteJobLink).mockResolvedValue(undefined);
  });

  it("initializes with empty array when initialJobLinks is empty", () => {
    const { result } = renderHook(() =>
      useJobLinks("user-1", []),
    );

    expect(result.current.links).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it("initializes with parsed links when initialJobLinks has data", () => {
    const initial: JobLinkRow[] = [
      makeRow({ id: "a", name: "Indeed", url: "https://indeed.com" }),
    ];

    const { result } = renderHook(() =>
      useJobLinks("user-1", initial),
    );

    expect(result.current.links).toHaveLength(1);
    expect(result.current.links[0].label).toBe("Indeed");
    expect(result.current.links[0].url).toBe("https://indeed.com");
  });

  it("addLink appends and saves via createJobLink", async () => {
    const newRow = makeRow({ id: "new", name: "LinkedIn", url: "https://linkedin.com/jobs" });
    vi.mocked(jobLinksActions.createJobLink).mockResolvedValue(newRow);

    const { result } = renderHook(() =>
      useJobLinks("user-1", []),
    );

    await act(async () => {
      await result.current.addLink("LinkedIn", "https://linkedin.com/jobs");
    });

    expect(jobLinksActions.createJobLink).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({
        name: "LinkedIn",
        url: "https://linkedin.com/jobs",
        sort_order: 0,
      }),
    );
    expect(result.current.links).toHaveLength(1);
    expect(result.current.links[0].label).toBe("LinkedIn");
  });

  it("addLink passes color when provided", async () => {
    const newRow = makeRow({
      id: "new",
      name: "LinkedIn",
      url: "https://linkedin.com/jobs",
      color: "#0A66C2",
    });
    vi.mocked(jobLinksActions.createJobLink).mockResolvedValue(newRow);

    const { result } = renderHook(() => useJobLinks("user-1", []));

    await act(async () => {
      await result.current.addLink("LinkedIn", "https://linkedin.com/jobs", "#0A66C2");
    });

    expect(jobLinksActions.createJobLink).toHaveBeenCalledWith("user-1", {
      name: "LinkedIn",
      url: "https://linkedin.com/jobs",
      sort_order: 0,
      color: "#0A66C2",
    });
    expect(result.current.links[0].color).toBe("#0A66C2");
  });
});
