"use client";

import { useState, useEffect } from "react";
import { listResumeFiles } from "@/app/actions/resume-files";

export type ResumeFileOption = { id: string; name: string; url: string };

export function useResumeFiles(
  userId: string,
  enabled: boolean
): { resumeFiles: ResumeFileOption[]; loading: boolean } {
  const [resumeFiles, setResumeFiles] = useState<ResumeFileOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !userId) {
      setResumeFiles([]);
      return;
    }
    setLoading(true);
    listResumeFiles(userId)
      .then((list) => setResumeFiles(list.map((f) => ({ id: f.id, name: f.name, url: f.url }))))
      .catch(() => setResumeFiles([]))
      .finally(() => setLoading(false));
  }, [userId, enabled]);

  return { resumeFiles, loading };
}
