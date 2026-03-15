"use client";

import { forwardRef } from "react";
import type { CoverLetterData } from "@/lib/resume-cover-letter";
import { RteContent } from "@/components/ui/RteContent";

type Props = { data: CoverLetterData };

export const CoverLetterPreview = forwardRef<HTMLElement, Props>(function CoverLetterPreview(
  { data },
  ref,
) {
  const hasContent =
    data.companyName ||
    data.roleTitle ||
    data.hiringManager ||
    data.opening?.trim() ||
    data.bodyParagraph1?.trim() ||
    data.bodyParagraph2?.trim() ||
    data.bodyParagraph3?.trim() ||
    data.closing?.trim();

  if (!hasContent) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
        <p>Your cover letter preview will appear here.</p>
        <p className="mt-1">Fill in the form to see it update live.</p>
      </div>
    );
  }

  const bodyParagraphs = [
    data.bodyParagraph1?.trim(),
    data.bodyParagraph2?.trim(),
    data.bodyParagraph3?.trim(),
  ].filter(Boolean);

  return (
    <article
      ref={ref}
      className="cover-letter-preview-doc overflow-hidden rounded-lg border border-border bg-white shadow-sm print:shadow-none"
      style={{
        minHeight: "840px",
        maxHeight: "59.4cm",
        maxWidth: "21cm",
        margin: "0 auto",
      }}
    >
      <div className="min-w-0 overflow-hidden px-10 py-8 text-neutral-800">
        {/* Salutation */}
        {data.hiringManager?.trim() && (
          <p className="wrap-break-word text-sm leading-relaxed text-neutral-800">
            {data.hiringManager.trim()}
          </p>
        )}

        {/* Opening */}
        {data.opening?.trim() && (
          <RteContent content={data.opening} className="mt-4 text-sm leading-relaxed text-neutral-800" as="div" />
        )}

        {/* Body paragraphs */}
        {bodyParagraphs.map((para, i) => (
          <RteContent key={i} content={para} className="mt-3 text-sm leading-relaxed text-neutral-800" as="div" />
        ))}

        {/* Closing */}
        {data.closing?.trim() && (
          <RteContent content={data.closing} className="mt-4 text-sm leading-relaxed text-neutral-800" as="div" />
        )}

        {/* Optional: show role/company as context at top or bottom - keeping it minimal like a letter */}
        {(data.companyName || data.roleTitle) && (
          <p className="mt-6 wrap-break-word text-xs text-neutral-500">
            {[data.roleTitle, data.companyName].filter(Boolean).join(" at ")}
          </p>
        )}
      </div>
    </article>
  );
});
