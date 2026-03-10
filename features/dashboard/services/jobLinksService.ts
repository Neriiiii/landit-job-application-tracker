import type { JobLink } from "../types";

const STORAGE_KEY_PREFIX = "trackr_job_links";
export const DEFAULT_LINK_COLOR = "#006778";

export const DEFAULT_ENTRY: JobLink = {
  label: "LinkedIn",
  url: "https://www.linkedin.com/jobs/",
  color: "#006778",
};

export function getJobLinksStorageKey(userId: string): string {
  return `${STORAGE_KEY_PREFIX}_${userId}`;
}

function parseLinksFromStorage(raw: string | null): JobLink[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed
          .filter(
            (item): item is Record<string, unknown> =>
              item &&
              typeof item === "object" &&
              typeof (item as JobLink).label === "string" &&
              typeof (item as JobLink).url === "string",
          )
          .map((item) => ({
            label: (item as JobLink).label,
            url: (item as JobLink).url,
            color:
              typeof (item as JobLink).color === "string"
                ? (item as JobLink).color
                : DEFAULT_LINK_COLOR,
          }))
      : [];
  } catch {
    return [];
  }
}

export function loadJobLinks(userId: string): JobLink[] {
  if (typeof window === "undefined") return [];
  const key = getJobLinksStorageKey(userId);
  const raw = localStorage.getItem(key);
  return parseLinksFromStorage(raw);
}

export function saveJobLinks(userId: string, links: JobLink[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(getJobLinksStorageKey(userId), JSON.stringify(links));
}
