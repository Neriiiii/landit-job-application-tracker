import { describe, it, expect, vi, beforeEach } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { jobApplicationService } from "@/features/job-applications/services/jobApplicationService";

function createMockSupabaseGetJobApplications(result: {
  data: unknown;
  error: { message: string } | null;
}) {
  const orderMock = vi.fn().mockResolvedValue(result);
  const eq2Mock = vi.fn().mockReturnValue({ order: orderMock });
  const eq1Mock = vi.fn().mockReturnValue({ eq: eq2Mock });
  const selectMock = vi.fn().mockReturnValue({ eq: eq1Mock });
  const fromMock = vi.fn().mockReturnValue({ select: selectMock });
  return fromMock;
}

describe("jobApplicationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getJobApplications", () => {
    it("returns empty array when no data", async () => {
      const fromMock = createMockSupabaseGetJobApplications({ data: [], error: null });
      const supabase = { from: fromMock } as unknown as SupabaseClient;

      const result = await jobApplicationService.getJobApplications(
        supabase,
        "user-1"
      );

      expect(result).toEqual([]);
      expect(fromMock).toHaveBeenCalledWith("job_applications");
    });

    it("throws when Supabase returns an error", async () => {
      const fromMock = createMockSupabaseGetJobApplications({
        data: null,
        error: { message: "DB error" },
      });
      const supabase = { from: fromMock } as unknown as SupabaseClient;

      await expect(
        jobApplicationService.getJobApplications(supabase, "user-1")
      ).rejects.toThrow("DB error");
    });

    it("maps rows to JobApplication shape with nulls normalized", async () => {
      const row = {
        id: "app-1",
        user_id: "user-1",
        company_name: "Acme",
        role_title: "Dev",
        job_link: null,
        job_description: null,
        current_status: "Applied",
        notes: null,
        archived: false,
        resume_file_id: null,
        cover_letter_file_id: null,
        is_fake: false,
        created_at: "",
        updated_at: "",
      };
      const fromMock = createMockSupabaseGetJobApplications({ data: [row], error: null });
      const supabase = { from: fromMock } as unknown as SupabaseClient;

      const result = await jobApplicationService.getJobApplications(
        supabase,
        "user-1"
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: "app-1",
        company_name: "Acme",
        role_title: "Dev",
        current_status: "Applied",
      });
      expect(result[0].resume_file_id).toBeNull();
      expect(result[0].cover_letter_file_id).toBeNull();
    });
  });

  describe("deleteJobApplication", () => {
    it("calls delete with applicationId and userId", async () => {
      const eq2Mock = vi.fn().mockResolvedValue({ error: null });
      const eq1Mock = vi.fn().mockReturnValue({ eq: eq2Mock });
      const deleteMock = vi.fn().mockReturnValue({ eq: eq1Mock });
      const fromMock = vi.fn().mockReturnValue({ delete: deleteMock });
      const supabase = { from: fromMock } as unknown as SupabaseClient;

      await jobApplicationService.deleteJobApplication(
        supabase,
        "app-1",
        "user-1"
      );

      expect(fromMock).toHaveBeenCalledWith("job_applications");
      expect(deleteMock).toHaveBeenCalled();
      expect(eq1Mock).toHaveBeenCalledWith("id", "app-1");
      expect(eq2Mock).toHaveBeenCalledWith("user_id", "user-1");
    });
  });
});
