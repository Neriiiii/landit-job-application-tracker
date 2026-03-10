"use client";

import { useState, useEffect } from "react";
import { listCoverLetterFiles } from "@/app/actions/cover-letter-files";

export type CoverLetterFileOption = { id: string; name: string; url: string };

export function useCoverLetterFiles(
  userId: string,
  enabled: boolean
): { coverLetterFiles: CoverLetterFileOption[]; loading: boolean } {
  const [coverLetterFiles, setCoverLetterFiles] = useState<CoverLetterFileOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !userId) {
      setCoverLetterFiles([]);
      return;
    }
    setLoading(true);
    listCoverLetterFiles(userId)
      .then((list) =>
        setCoverLetterFiles(list.map((f) => ({ id: f.id, name: f.name, url: f.url })))
      )
      .catch(() => setCoverLetterFiles([]))
      .finally(() => setLoading(false));
  }, [userId, enabled]);

  return { coverLetterFiles, loading };
}
