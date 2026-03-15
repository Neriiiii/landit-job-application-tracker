"use client";

import { forwardRef } from "react";
import type { ResumeData } from "@/lib/resume-cover-letter";
import { RteContent } from "@/components/ui/RteContent";

type Props = { data: ResumeData };

export const ResumePreview = forwardRef<HTMLElement, Props>(function ResumePreview({ data }, ref) {
  const hasContact = !!data.email || !!data.phone || !!data.location || !!data.website?.trim();
  const hasContent =
    data.name ||
    hasContact ||
    data.summary ||
    data.experience.some((e) => e.company || e.role || e.start || e.end || e.description) ||
    data.education.some((e) => e.school || e.degree || e.year || e.achievement) ||
    data.skills.trim() ||
    data.references?.some((r) => r.name || r.titleOrRelationship || r.email || r.phone) ||
    data.certifications?.some((c) => c.name || c.issuer || c.date);

  if (!hasContent) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
        <p>Your resume preview will appear here.</p>
        <p className="mt-1">Fill in the form to see it update live.</p>
      </div>
    );
  }

  return (
    <article
      ref={ref}
      className="resume-preview-doc overflow-hidden rounded-lg border border-border bg-white shadow-sm print:shadow-none"
      style={{
        minHeight: "840px",
        maxHeight: "59.4cm",
        maxWidth: "21cm",
        margin: "0 auto",
      }}
    >
      <div className="min-w-0 overflow-hidden px-10 py-8 text-neutral-800">
        {/* Name */}
        {data.name && (
          <h1 className="break-words text-2xl font-semibold tracking-tight text-neutral-900">
            {data.name}
          </h1>
        )}

        {/* Contact – 1 row */}
        {hasContact && (
          <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0 break-words text-sm text-neutral-600">
            {data.email && <span className="break-all">{data.email}</span>}
            {data.email && data.phone && <span aria-hidden>|</span>}
            {data.phone && <span className="break-all">{data.phone}</span>}
            {(data.email || data.phone) && data.location && <span aria-hidden>|</span>}
            {data.location && <span className="break-words">{data.location}</span>}
            {(data.email || data.phone || data.location) && data.website?.trim() && (
              <span aria-hidden>|</span>
            )}
            {data.website?.trim() && (
              <a
                href={data.website.startsWith("http") ? data.website : `https://${data.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-700 underline hover:text-neutral-900"
              >
                {data.website.replace(/^https?:\/\//i, "")}
              </a>
            )}
          </div>
        )}

        {/* Professional Summary */}
        {data.summary.trim() && (
          <section className="mt-5 min-w-0 overflow-hidden">
            <h2 className="border-b border-neutral-300 pb-0.5 text-xs font-semibold uppercase tracking-wider text-neutral-700">
              Professional Summary
            </h2>
            <RteContent content={data.summary} className="mt-2 text-sm leading-relaxed text-neutral-800" as="div" />
          </section>
        )}

        {/* Experience */}
        {data.experience.some((e) => e.company || e.role || e.start || e.end || e.description) && (
          <section className="mt-5 min-w-0 overflow-hidden">
            <h2 className="border-b border-neutral-300 pb-0.5 text-xs font-semibold uppercase tracking-wider text-neutral-700">
              Work Experience
            </h2>
            <div className="mt-2 space-y-4">
              {data.experience.map(
                (exp, i) =>
                  (exp.company || exp.role || exp.start || exp.end || exp.description) && (
                    <div key={i} className="min-w-0 overflow-hidden">
                      <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-2">
                        <span className="break-words font-medium text-neutral-900">
                          {exp.role || "(Job title)"}
                        </span>
                        {(exp.start || exp.end) && (
                          <span className="shrink-0 text-xs text-neutral-600">
                            {[exp.start, exp.end].filter(Boolean).join(" – ")}
                          </span>
                        )}
                      </div>
                      {exp.company && (
                        <p className="break-words text-sm text-neutral-600">{exp.company}</p>
                      )}
                      {exp.description.trim() && (
                        <RteContent content={exp.description} className="mt-1 text-sm leading-relaxed text-neutral-800" as="div" />
                      )}
                    </div>
                  ),
              )}
            </div>
          </section>
        )}

        {/* Education */}
        {data.education.some((e) => e.school || e.degree || e.year || e.achievement) && (
          <section className="mt-5 min-w-0 overflow-hidden">
            <h2 className="border-b border-neutral-300 pb-0.5 text-xs font-semibold uppercase tracking-wider text-neutral-700">
              Education
            </h2>
            <div className="mt-2 space-y-3">
              {data.education.map(
                (edu, i) =>
                  (edu.school || edu.degree || edu.year || edu.achievement) && (
                    <div key={i} className="min-w-0 overflow-hidden">
                      <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-2">
                        <span className="break-words font-medium text-neutral-900">
                          {edu.degree || "(Degree)"}
                        </span>
                        {edu.year && (
                          <span className="shrink-0 text-xs text-neutral-600">{edu.year}</span>
                        )}
                      </div>
                      {edu.school && (
                        <p className="break-words text-sm text-neutral-600">{edu.school}</p>
                      )}
                      {edu.achievement?.trim() && (
                        <RteContent content={edu.achievement} className="mt-1 text-sm leading-relaxed text-neutral-800" as="div" />
                      )}
                    </div>
                  ),
              )}
            </div>
          </section>
        )}

        {/* Certifications (under Education) */}
        {data.certifications?.some((c) => c.name || c.issuer || c.date) && (
          <section className="mt-5 min-w-0 overflow-hidden">
            <h2 className="border-b border-neutral-300 pb-0.5 text-xs font-semibold uppercase tracking-wider text-neutral-700">
              Certifications
            </h2>
            <div className="mt-2 space-y-3">
              {data.certifications.map(
                (cert, i) =>
                  (cert.name || cert.issuer || cert.date) && (
                    <div key={i} className="min-w-0 overflow-hidden">
                      <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-2">
                        <span className="break-words font-medium text-neutral-900">
                          {cert.name || "(Certification)"}
                        </span>
                        {cert.date && (
                          <span className="shrink-0 text-xs text-neutral-600">{cert.date}</span>
                        )}
                      </div>
                      {cert.issuer && (
                        <p className="break-words text-sm text-neutral-600">{cert.issuer}</p>
                      )}
                    </div>
                  ),
              )}
            </div>
          </section>
        )}

        {/* Skills */}
        {data.skills.trim() && (
          <section className="mt-5 min-w-0 overflow-hidden">
            <h2 className="border-b border-neutral-300 pb-0.5 text-xs font-semibold uppercase tracking-wider text-neutral-700">
              Skills
            </h2>
            <RteContent content={data.skills} className="mt-2 text-sm leading-relaxed text-neutral-800" as="div" />
          </section>
        )}

        {/* References - two columns */}
        {data.references?.some((r) => r.name || r.titleOrRelationship || r.email || r.phone) && (
          <section className="mt-5 min-w-0 overflow-hidden">
            <h2 className="border-b border-neutral-300 pb-0.5 text-xs font-semibold uppercase tracking-wider text-neutral-700">
              References
            </h2>
            <div className="mt-2 grid grid-cols-2 gap-4">
              {data.references.map(
                (ref, i) =>
                  (ref.name || ref.titleOrRelationship || ref.email || ref.phone) && (
                    <div key={i} className="min-w-0 overflow-hidden">
                      <p className="break-words font-medium text-neutral-900">
                        {ref.name || "(Name)"}
                      </p>
                      {ref.titleOrRelationship && (
                        <p className="break-words text-sm text-neutral-600">
                          {ref.titleOrRelationship}
                        </p>
                      )}
                      {(ref.email || ref.phone) && (
                        <p className="break-words text-sm text-neutral-600">
                          {[ref.email, ref.phone].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                  ),
              )}
            </div>
          </section>
        )}
      </div>
    </article>
  );
});
