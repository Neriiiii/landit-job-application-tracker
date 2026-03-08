"use client";

import { useState, useEffect } from "react";
import {
  getCoverLetterStorageKey,
  defaultCoverLetter,
  parseCoverLetterFromStorage,
  type CoverLetterData,
} from "@/lib/resume-cover-letter";

export function useCoverLetterStorage(
  userId: string
): [CoverLetterData, React.Dispatch<React.SetStateAction<CoverLetterData>>] {
  const key = getCoverLetterStorageKey(userId);
  const [coverLetter, setCoverLetter] = useState<CoverLetterData>(defaultCoverLetter);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const parsed = parseCoverLetterFromStorage(raw);
    if (parsed) setCoverLetter(parsed);
  }, [key]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(coverLetter));
  }, [key, coverLetter]);

  return [coverLetter, setCoverLetter];
}
