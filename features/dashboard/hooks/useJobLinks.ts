"use client";

import { useState, useCallback } from "react";
import {
  getJobLinks,
  createJobLink,
  deleteJobLink,
} from "@/app/actions/job-links";
import { DEFAULT_LINK_COLOR } from "../services/jobLinksService";
import type { JobLink, JobLinkRow } from "../types";

export type DisplayJobLink = JobLink & { id?: string };

function rowToDisplay(row: JobLinkRow): DisplayJobLink {
  return {
    id: row.id,
    label: row.name,
    url: row.url,
    color: row.color && /^#[0-9A-Fa-f]{3,6}$/.test(row.color) ? row.color : DEFAULT_LINK_COLOR,
  };
}

export function useJobLinks(
  userId: string,
  initialJobLinks: JobLinkRow[]
): {
  links: DisplayJobLink[];
  addLink: (name: string, url: string, color?: string) => Promise<void>;
  removeLink: (id: string) => Promise<void>;
  isLoading: boolean;
} {
  const [dbLinks, setDbLinks] = useState<JobLinkRow[]>(initialJobLinks);
  const [isLoading, setIsLoading] = useState(false);

  const addLink = useCallback(
    async (name: string, url: string, color?: string) => {
      const trimmedName = name.trim();
      const trimmedUrl = url.trim().startsWith("http")
        ? url.trim()
        : `https://${url.trim()}`;
      if (!trimmedName || !trimmedUrl) return;
      setIsLoading(true);
      try {
        const newRow = await createJobLink(userId, {
          name: trimmedName,
          url: trimmedUrl,
          sort_order: dbLinks.length,
          color: color && /^#[0-9A-Fa-f]{3,6}$/.test(color) ? color : undefined,
        });
        setDbLinks((prev) => [...prev, newRow]);
      } finally {
        setIsLoading(false);
      }
    },
    [userId, dbLinks.length],
  );

  const removeLink = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      await deleteJobLink(id, userId);
      setDbLinks((prev) => prev.filter((l) => l.id !== id));
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const links = dbLinks.map(rowToDisplay);
  return { links, addLink, removeLink, isLoading };
}
