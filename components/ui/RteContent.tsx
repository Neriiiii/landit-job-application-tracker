"use client";

import * as React from "react";
import { sanitizeRteHtml, isRteHtml } from "@/lib/sanitize-html";
import { cn } from "@/lib/utils";

type Props = {
  content: string;
  className?: string;
  as?: "p" | "div" | "span";
};

export function RteContent({
  content,
  className,
  as: Tag = "div",
}: Props) {
  const trimmed = content.trim();
  if (!trimmed) return null;

  const isHtml = isRteHtml(trimmed);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!isHtml) {
    return (
      <Tag
        className={cn("wrap-break-word whitespace-pre-wrap", className)}
        dangerouslySetInnerHTML={undefined}
      >
        {trimmed}
      </Tag>
    );
  }

  if (!mounted) {
    return (
      <Tag className={cn("wrap-break-word whitespace-pre-wrap", className)}>
        {trimmed.replace(/<[^>]+>/g, " ").trim()}
      </Tag>
    );
  }

  const safe = sanitizeRteHtml(trimmed);
  return (
    <Tag
      className={cn("rte-content wrap-break-word", className)}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
