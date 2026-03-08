"use client";

import { useState, useEffect } from "react";
import {
  getResumeStorageKey,
  defaultResume,
  parseResumeFromStorage,
  type ResumeData,
} from "@/lib/resume-cover-letter";

export function useResumeStorage(userId: string): [ResumeData, React.Dispatch<React.SetStateAction<ResumeData>>] {
  const key = getResumeStorageKey(userId);
  const [resume, setResume] = useState<ResumeData>(defaultResume);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const parsed = parseResumeFromStorage(raw);
    if (parsed) setResume(parsed);
  }, [key]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(resume));
  }, [key, resume]);

  return [resume, setResume];
}
