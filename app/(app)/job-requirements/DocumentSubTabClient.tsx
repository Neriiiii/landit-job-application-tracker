"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { AppPageTitleBlock } from "@/components/layout/AppPageTitleBlock";
import { ResumePreview } from "./resume/ResumePreview";
import { CoverLetterPreview } from "./cover-letter/CoverLetterPreview";
import { ResumeBuilderClient } from "./resume/ResumeBuilderClient";
import {
  ResumeFilesSection,
  type AddResumeFileFromBlobFn,
  type ResumeFilesSectionRef,
} from "./resume/ResumeFilesSection";
import {
  CoverLetterFilesSection,
  type AddCoverLetterFileFromBlobFn,
  type CoverLetterFilesSectionRef,
} from "./cover-letter/CoverLetterFilesSection";
import {
  getResumeStorageKey,
  getCoverLetterStorageKey,
  defaultResume,
  defaultCoverLetter,
  type ResumeData,
  type CoverLetterData,
} from "@/lib/resume-cover-letter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { File, Loader2, Mail, Pencil, Upload } from "lucide-react";

type Props = {
  userId: string;
  type: "resume" | "cover";
};

const COVER_LETTER_LOADING_MS = 5000;

export function DocumentSubTabClient({ userId, type }: Props) {
  const [showBuilder, setShowBuilder] = useState(false);
  const [resume, setResume] = useState<ResumeData>(defaultResume);
  const [coverLetter, setCoverLetter] = useState<CoverLetterData>(defaultCoverLetter);
  const [coverLetterLoading, setCoverLetterLoading] = useState(type === "cover");

  const storageKey =
    type === "resume" ? getResumeStorageKey(userId) : getCoverLetterStorageKey(userId);

  useEffect(() => {
    if (type !== "cover") return;
    setCoverLetterLoading(true);
    const t = setTimeout(() => setCoverLetterLoading(false), COVER_LETTER_LOADING_MS);
    return () => clearTimeout(t);
  }, [type]);

  useEffect(() => {
    if (showBuilder) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      if (type === "resume") {
        const parsed = JSON.parse(raw) as Partial<ResumeData>;
        if (parsed && typeof parsed === "object" && Array.isArray(parsed.experience)) {
          setResume({
            ...defaultResume,
            ...parsed,
            experience: parsed.experience ?? defaultResume.experience,
            education: parsed.education ?? defaultResume.education,
            references: parsed.references ?? defaultResume.references,
            certifications: parsed.certifications ?? defaultResume.certifications,
          });
        }
      } else {
        const parsed = JSON.parse(raw) as CoverLetterData;
        if (parsed && typeof parsed === "object") {
          setCoverLetter({ ...defaultCoverLetter, ...parsed });
        }
      }
    } catch {
    }
  }, [storageKey, type, showBuilder]);

  const addResumeFileFromBlobRef = useRef<AddResumeFileFromBlobFn | null>(null);
  const resumeFilesSectionRef = useRef<ResumeFilesSectionRef | null>(null);
  const addCoverLetterFileFromBlobRef = useRef<AddCoverLetterFileFromBlobFn | null>(null);
  const coverLetterFilesSectionRef = useRef<CoverLetterFilesSectionRef | null>(null);

  if (showBuilder) {
    return (
      <>
        {type === "resume" && (
          <div className="hidden" aria-hidden>
            <ResumeFilesSection userId={userId} addFromBlobRef={addResumeFileFromBlobRef} />
          </div>
        )}
        {type === "cover" && (
          <div className="hidden" aria-hidden>
            <CoverLetterFilesSection
              userId={userId}
              addFromBlobRef={addCoverLetterFileFromBlobRef}
            />
          </div>
        )}
        <ResumeBuilderClient
          userId={userId}
          mode={type}
          onDone={() => setShowBuilder(false)}
          onSaveResumePdf={
            type === "resume"
              ? async (blob, suggestedName) => {
                  await addResumeFileFromBlobRef.current?.(blob, suggestedName);
                  setShowBuilder(false);
                }
              : undefined
          }
          onSaveCoverLetterPdf={
            type === "cover"
              ? async (blob, suggestedName) => {
                  await addCoverLetterFileFromBlobRef.current?.(blob, suggestedName);
                  setShowBuilder(false);
                }
              : undefined
          }
        />
      </>
    );
  }

  const isResume = type === "resume";
  const title = isResume ? "Resume" : "Cover letter";
  const description = isResume
    ? "Build, import, and view your resumes. Content is saved automatically."
    : "Build and view your cover letter. ";

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 ">
      <AppPageTitleBlock
        title={title}
        description={description}
        action={
          <div className="flex max-md:flex-col max-xl:flex-row items-center gap-2">
            {isResume && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => resumeFilesSectionRef.current?.triggerImport()}
                className="gap-2 rounded-lg px-6 text-base min-w-30  max-md:w-full"
              >
                <Upload className="h-4 w-4" />
                Import resume (PDF)
              </Button>
            )}
            {!isResume && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => coverLetterFilesSectionRef.current?.triggerImport()}
                className="gap-2 rounded-lg px-6 text-base min-w-30  max-md:w-full"
              >
                <Upload className="h-4 w-4" />
                Import cover letter
              </Button>
            )}
            <Button
              onClick={() => setShowBuilder(true)}
              size="lg"
              className="gap-2 rounded-lg px-6 text-base min-w-50 max-md:w-full"
            >
              <Pencil className="h-4 w-4" />
              Create {title}
            </Button>
          </div>
        }
      />

      {isResume ? (
        <ResumeFilesSection
          ref={resumeFilesSectionRef}
          userId={userId}
          addFromBlobRef={addResumeFileFromBlobRef}
          showLatestPdf
          importButtonInHeader
        />
      ) : coverLetterLoading ? (
        <Card className="flex min-h-0 flex-1 flex-col rounded-2xl border-border/80 bg-card shadow-sm">
          <CardContent className="flex min-h-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">Loading cover letter…</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <CoverLetterFilesSection
          ref={coverLetterFilesSectionRef}
          userId={userId}
          addFromBlobRef={addCoverLetterFileFromBlobRef}
          importButtonInHeader
        />
      )}
    </div>
  );
}
