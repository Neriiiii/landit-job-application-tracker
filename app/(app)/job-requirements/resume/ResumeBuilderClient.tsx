"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { AppPageHeader } from "@/components/layout/PageHeader";
import { AppPageTitleBlock } from "@/components/layout/AppPageTitleBlock";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  FileText,
  Mail,
  Plus,
  Trash2,
  User,
  Briefcase,
  GraduationCap,
  Sparkles,
  UserCheck,
  Award,
  Download,
  Save,
  ArrowLeft,
  Eye,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { ResumePreview } from "./ResumePreview";
import { CoverLetterPreview } from "../cover-letter/CoverLetterPreview";
import {
  exportElementToPdf,
  exportElementToPdfAsBlob,
  exportElementToPdfAsBlobCompressed,
} from "../ExportPdf";
import type { ResumeData, CoverLetterData } from "@/lib/resume-cover-letter";
import { useResumeStorage } from "@/lib/hooks/useResumeStorage";
import { useCoverLetterStorage } from "@/lib/hooks/useCoverLetterStorage";

export type { ResumeData, CoverLetterData } from "@/lib/resume-cover-letter";

type TabId = "resume" | "cover";

type Props = {
  userId: string;
  mode?: "resume" | "cover" | "both";
  onDone?: () => void;
  onSaveResumePdf?: (blob: Blob, suggestedName: string) => void | Promise<void>;
  onSaveCoverLetterPdf?: (blob: Blob, suggestedName: string) => void | Promise<void>;
};

export function ResumeBuilderClient({
  userId,
  mode = "both",
  onDone,
  onSaveResumePdf,
  onSaveCoverLetterPdf,
}: Props) {
  const [tab, setTab] = useState<TabId>("resume");
  const [resume, setResume] = useResumeStorage(userId);
  const [coverLetter, setCoverLetter] = useCoverLetterStorage(userId);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [saveResumeModalOpen, setSaveResumeModalOpen] = useState(false);
  const [saveCoverModalOpen, setSaveCoverModalOpen] = useState(false);
  const [saveResumeFileName, setSaveResumeFileName] = useState("Resume");
  const [saveCoverFileName, setSaveCoverFileName] = useState("Cover letter");
  const resumePreviewRef = useRef<HTMLElement>(null);
  const resumePreviewRefModal = useRef<HTMLElement>(null);
  const coverLetterPreviewRef = useRef<HTMLElement>(null);
  const coverLetterPreviewRefModal = useRef<HTMLElement>(null);

  const effectiveTab: TabId = mode === "resume" ? "resume" : mode === "cover" ? "cover" : tab;
  const isEmbedded = mode !== "both";

  const hasResumeContent =
    !!resume.name ||
    !!resume.email ||
    !!resume.phone ||
    !!resume.location ||
    !!resume.website?.trim() ||
    !!resume.summary.trim() ||
    resume.experience.some((e) => e.company || e.role || e.start || e.end || e.description) ||
    resume.education.some((e) => e.school || e.degree || e.year || e.achievement) ||
    !!resume.skills.trim() ||
    resume.references?.some((r) => r.name || r.titleOrRelationship || r.email || r.phone) ||
    resume.certifications?.some((c) => c.name || c.issuer || c.date);

  const hasCoverContent =
    !!coverLetter.companyName ||
    !!coverLetter.roleTitle ||
    !!coverLetter.hiringManager ||
    !!coverLetter.opening?.trim() ||
    !!coverLetter.bodyParagraph1?.trim() ||
    !!coverLetter.bodyParagraph2?.trim() ||
    !!coverLetter.bodyParagraph3?.trim() ||
    !!coverLetter.closing?.trim();

  async function handleExportResumePdf() {
    const el = showPreviewModal ? resumePreviewRefModal.current : resumePreviewRef.current;
    if (!el || !hasResumeContent) return;
    setIsExportingPdf(true);
    try {
      await exportElementToPdf(el, "resume.pdf");
    } finally {
      setIsExportingPdf(false);
    }
  }

  function openSaveResumeModal() {
    setSaveResumeFileName("Resume");
    setSaveResumeModalOpen(true);
  }

  async function handleConfirmSaveResume() {
    const el = showPreviewModal ? resumePreviewRefModal.current : resumePreviewRef.current;
    if (!el || !hasResumeContent || !onSaveResumePdf) return;
    const name =
      saveResumeFileName
        .trim()
        .replace(/[/\\:*?"<>|]/g, " ")
        .trim() || "Resume";
    setSaveResumeModalOpen(false);
    setIsExportingPdf(true);
    try {
      const blob = await exportElementToPdfAsBlobCompressed(el);
      await onSaveResumePdf(blob, name);
    } finally {
      setIsExportingPdf(false);
    }
  }

  function openSaveCoverModal() {
    setSaveCoverFileName("Cover letter");
    setSaveCoverModalOpen(true);
  }

  async function handleConfirmSaveCover() {
    const el = showPreviewModal
      ? coverLetterPreviewRefModal.current
      : coverLetterPreviewRef.current;
    if (!el || !hasCoverContent || !onSaveCoverLetterPdf) return;
    const name =
      saveCoverFileName
        .trim()
        .replace(/[/\\:*?"<>|]/g, " ")
        .trim() || "Cover letter";
    setSaveCoverModalOpen(false);
    setIsExportingPdf(true);
    try {
      const blob = await exportElementToPdfAsBlobCompressed(el);
      await onSaveCoverLetterPdf(blob, name);
    } finally {
      setIsExportingPdf(false);
    }
  }

  async function handleExportCoverLetterPdf() {
    const el = showPreviewModal
      ? coverLetterPreviewRefModal.current
      : coverLetterPreviewRef.current;
    if (!el || !hasCoverContent) return;
    setIsExportingPdf(true);
    try {
      await exportElementToPdf(el, "cover-letter.pdf");
    } finally {
      setIsExportingPdf(false);
    }
  }

  function updateResume(updates: Partial<ResumeData>) {
    setResume((prev) => ({ ...prev, ...updates }));
  }

  function updateResumeArrayItem(
    key: "experience" | "education" | "references" | "certifications",
    index: number,
    field: string,
    value: string,
  ) {
    setResume((prev) => {
      const arr = [...prev[key]];
      (arr[index] as Record<string, string>)[field] = value;
      return { ...prev, [key]: arr };
    });
  }

  function updateExperience(index: number, field: string, value: string) {
    updateResumeArrayItem("experience", index, field, value);
  }

  function addExperience() {
    setResume((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { company: "", role: "", start: "", end: "", description: "" },
      ],
    }));
  }

  function removeExperience(index: number) {
    setResume((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  }

  function updateEducation(index: number, field: string, value: string) {
    updateResumeArrayItem("education", index, field, value);
  }

  function addEducation() {
    setResume((prev) => ({
      ...prev,
      education: [...prev.education, { degree: "", school: "", year: "", achievement: "" }],
    }));
  }

  function removeEducation(index: number) {
    setResume((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  }

  function updateReference(index: number, field: string, value: string) {
    updateResumeArrayItem("references", index, field, value);
  }

  function updateCertification(index: number, field: string, value: string) {
    updateResumeArrayItem("certifications", index, field, value);
  }

  function addCertification() {
    setResume((prev) => ({
      ...prev,
      certifications: [...prev.certifications, { name: "", issuer: "", date: "" }],
    }));
  }

  function removeCertification(index: number) {
    setResume((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }));
  }

  function updateCoverLetter(updates: Partial<CoverLetterData>) {
    setCoverLetter((prev) => ({ ...prev, ...updates }));
  }

  return (
    <div
      className={
        isEmbedded
          ? "flex min-h-0 flex-1 flex-col  "
          : "-mx-4 -mt-4 flex min-h-0 flex-1 flex-col sm:-mx-6 sm:-mt-6 lg:-mx-8 lg:-mt-8 "
      }
    >
      {!isEmbedded && <AppPageHeader title="Resume & Cover letter builder" />}
      <div
        className={
          isEmbedded
            ? "flex min-h-0 flex-1 flex-col gap-6"
            : "flex min-h-0 flex-1 flex-col gap-6 px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8"
        }
      >
        {/* Save to my resumes: name modal */}
        <Dialog open={saveResumeModalOpen} onOpenChange={setSaveResumeModalOpen}>
          <DialogContent size="sm" showCloseButton={!isExportingPdf}>
            <DialogHeader>
              <DialogTitle>Save to my resumes</DialogTitle>
              <DialogDescription>
                Choose a name for this file. It will appear in your list.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="save-resume-name">File name</Label>
                <Input
                  id="save-resume-name"
                  value={saveResumeFileName}
                  onChange={(e) => setSaveResumeFileName(e.target.value)}
                  placeholder="e.g. My Resume 2025"
                  disabled={isExportingPdf}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSaveResumeModalOpen(false)}
                disabled={isExportingPdf}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmSaveResume}
                disabled={!hasResumeContent || isExportingPdf}
              >
                {isExportingPdf ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Save to my cover letters: name modal */}
        <Dialog open={saveCoverModalOpen} onOpenChange={setSaveCoverModalOpen}>
          <DialogContent size="sm" showCloseButton={!isExportingPdf}>
            <DialogHeader>
              <DialogTitle>Save to my cover letters</DialogTitle>
              <DialogDescription>
                Choose a name for this file. It will appear in your list.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="save-cover-name">File name</Label>
                <Input
                  id="save-cover-name"
                  value={saveCoverFileName}
                  onChange={(e) => setSaveCoverFileName(e.target.value)}
                  placeholder="e.g. Cover letter – Acme Corp"
                  disabled={isExportingPdf}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSaveCoverModalOpen(false)}
                disabled={isExportingPdf}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmSaveCover}
                disabled={!hasCoverContent || isExportingPdf}
              >
                {isExportingPdf ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {!isEmbedded && (
          <AppPageTitleBlock
            title="Build your resume and cover letter"
            description="Content is saved automatically."
          />
        )}
        {isEmbedded && (
          <AppPageTitleBlock
            title={mode === "cover" ? "Cover letter" : "Resume"}
            description={
              mode === "cover"
                ? "Write and customize your cover letter for each job. "
                : "Build and organize your resume sections to showcase your experience. "
            }
            action={
              onDone ? (
                <Button type="button" variant="outline" onClick={onDone} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              ) : undefined
            }
          />
        )}
        {!isEmbedded && (
          <div className="flex shrink-0 gap-2 border-b border-border pb-2">
            <Button
              variant={tab === "resume" ? "secondary" : "ghost"}
              size="default"
              className="h-11 gap-2"
              onClick={() => setTab("resume")}
            >
              <FileText className="h-4 w-4" />
              Resume
            </Button>
            <Button
              variant={tab === "cover" ? "secondary" : "ghost"}
              size="default"
              className="h-11 gap-2"
              onClick={() => setTab("cover")}
            >
              <Mail className="h-4 w-4" />
              Cover letter
            </Button>
          </div>
        )}

        {effectiveTab === "resume" && (
          <div className="grid min-w-0 flex-1 grid-cols-1 gap-6 items-start lg:grid-cols-2">
            {/* Left: Form. Live preview button only on mobile */}
            <div className="flex min-w-0 flex-col">
              <div className="mb-2 flex h-5 items-end justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Builder
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2 lg:hidden"
                  onClick={() => setShowPreviewModal(true)}
                >
                  <Eye className="h-4 w-4" />
                  Live preview
                </Button>
              </div>
              <div className="space-y-6 pr-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <User className="h-4 w-4" />
                      Contact
                    </CardTitle>
                    <CardDescription>Your contact information</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3 sm:grid-cols-2">
                    <div className="grid gap-2 sm:col-span-2">
                      <Label htmlFor="resume-name">Full name</Label>
                      <Input
                        id="resume-name"
                        value={resume.name}
                        onChange={(e) => updateResume({ name: e.target.value })}
                        placeholder="Jane Doe"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="resume-email">Email</Label>
                      <Input
                        id="resume-email"
                        type="email"
                        value={resume.email}
                        onChange={(e) => updateResume({ email: e.target.value })}
                        placeholder="jane@example.com"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="resume-phone">Phone</Label>
                      <Input
                        id="resume-phone"
                        value={resume.phone}
                        onChange={(e) => updateResume({ phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="resume-location">Location</Label>
                      <Input
                        id="resume-location"
                        value={resume.location}
                        onChange={(e) => updateResume({ location: e.target.value })}
                        placeholder="City, Country"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="resume-website">Website</Label>
                      <Input
                        id="resume-website"
                        type="url"
                        value={resume.website}
                        onChange={(e) => updateResume({ website: e.target.value })}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Sparkles className="h-4 w-4" />
                      Professional summary
                    </CardTitle>
                    <CardDescription>A short overview of your experience and goals</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RichTextEditor
                      value={resume.summary}
                      onChange={(html) => updateResume({ summary: html })}
                      placeholder="Experienced software engineer with 5+ years..."
                      minHeight="6rem"
                      className="resize-none"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Briefcase className="h-4 w-4" />
                      Work experience
                    </CardTitle>
                    <CardDescription>Your job history</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {resume.experience.map((exp, i) => (
                      <div key={i} className="flex gap-2 rounded-lg border border-border p-3">
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              placeholder="Company"
                              value={exp.company}
                              onChange={(e) => updateExperience(i, "company", e.target.value)}
                            />
                            <Input
                              placeholder="Job title"
                              value={exp.role}
                              onChange={(e) => updateExperience(i, "role", e.target.value)}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              placeholder="Start (e.g. Jan 2020)"
                              value={exp.start}
                              onChange={(e) => updateExperience(i, "start", e.target.value)}
                            />
                            <Input
                              placeholder="End (e.g. Present)"
                              value={exp.end}
                              onChange={(e) => updateExperience(i, "end", e.target.value)}
                            />
                          </div>
                          <RichTextEditor
                            placeholder="Key responsibilities and achievements..."
                            value={exp.description}
                            onChange={(html) => updateExperience(i, "description", html)}
                            minHeight="5rem"
                            className="resize-none"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeExperience(i)}
                          disabled={resume.experience.length <= 1}
                          aria-label="Remove experience"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                      onClick={addExperience}
                    >
                      <Plus className="h-4 w-4" />
                      Add experience
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <GraduationCap className="h-4 w-4" />
                      Education
                    </CardTitle>
                    <CardDescription>Degree, school, year, and achievements</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {resume.education.map((edu, i) => (
                      <div key={i} className="flex gap-2 rounded-lg border border-border p-3">
                        <div className="min-w-0 flex-1 grid gap-2">
                          <Input
                            placeholder="Degree"
                            value={edu.degree}
                            onChange={(e) => updateEducation(i, "degree", e.target.value)}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              placeholder="School / University"
                              value={edu.school}
                              onChange={(e) => updateEducation(i, "school", e.target.value)}
                            />
                            <Input
                              placeholder="Year"
                              value={edu.year}
                              onChange={(e) => updateEducation(i, "year", e.target.value)}
                            />
                          </div>
                          <RichTextEditor
                            placeholder="Achievements (honors, activities, relevant coursework)"
                            value={edu.achievement}
                            onChange={(html) => updateEducation(i, "achievement", html)}
                            minHeight="4rem"
                            className="resize-none"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeEducation(i)}
                          disabled={resume.education.length <= 1}
                          aria-label="Remove education"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                      onClick={addEducation}
                    >
                      <Plus className="h-4 w-4" />
                      Add education
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Award className="h-4 w-4" />
                      Certifications
                    </CardTitle>
                    <CardDescription>Licenses and certifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {resume.certifications.map((cert, i) => (
                      <div key={i} className="flex gap-2 rounded-lg border border-border p-3">
                        <div className="min-w-0 flex-1 grid gap-2">
                          <Input
                            placeholder="Certification name"
                            value={cert.name}
                            onChange={(e) => updateCertification(i, "name", e.target.value)}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              placeholder="Issuing organization"
                              value={cert.issuer}
                              onChange={(e) => updateCertification(i, "issuer", e.target.value)}
                            />
                            <Input
                              placeholder="Date (e.g. 2023)"
                              value={cert.date}
                              onChange={(e) => updateCertification(i, "date", e.target.value)}
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeCertification(i)}
                          disabled={resume.certifications.length <= 1}
                          aria-label="Remove certification"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                      onClick={addCertification}
                    >
                      <Plus className="h-4 w-4" />
                      Add certification
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Skills</CardTitle>
                    <CardDescription>Comma-separated or one per line</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RichTextEditor
                      value={resume.skills}
                      onChange={(html) => updateResume({ skills: html })}
                      placeholder="JavaScript, React, TypeScript, Node.js..."
                      minHeight="5rem"
                      className="resize-none"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <UserCheck className="h-4 w-4" />
                      References
                    </CardTitle>
                    <CardDescription>Two professional references</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {resume.references.map((ref, i) => (
                        <div key={i} className="rounded-lg border border-border p-3 space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">
                            Reference {i + 1}
                          </p>
                          <div className="grid gap-2">
                            <Input
                              placeholder="Full name"
                              value={ref.name}
                              onChange={(e) => updateReference(i, "name", e.target.value)}
                            />
                            <Input
                              placeholder="Title or relationship"
                              value={ref.titleOrRelationship}
                              onChange={(e) =>
                                updateReference(i, "titleOrRelationship", e.target.value)
                              }
                            />
                            <Input
                              type="email"
                              placeholder="Email"
                              value={ref.email}
                              onChange={(e) => updateReference(i, "email", e.target.value)}
                            />
                            <Input
                              placeholder="Phone"
                              value={ref.phone}
                              onChange={(e) => updateReference(i, "phone", e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right: Live preview – desktop only, sticky */}
            <div className="hidden min-w-0 flex-col self-start sticky top-6 z-10 lg:flex">
              <div className="mb-2 flex h-5 items-end justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Live preview · ATS format
                </p>
                <div className="flex gap-2">
                  {onSaveResumePdf && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={openSaveResumeModal}
                      disabled={!hasResumeContent || isExportingPdf}
                    >
                      <Save className="h-4 w-4" />
                      {isExportingPdf ? "Saving…" : "Save to my resumes"}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    className="gap-2"
                    onClick={handleExportResumePdf}
                    disabled={!hasResumeContent || isExportingPdf}
                  >
                    <Download className="h-4 w-4" />
                    {isExportingPdf ? "Exporting…" : "Export PDF"}
                  </Button>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-4 shadow-sm">
                <ResumePreview ref={resumePreviewRef} data={resume} />
              </div>
            </div>

            {/* Mobile: Live preview modal */}
            <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
              <DialogContent size="xl" className="flex max-h-[90vh] flex-col">
                <DialogHeader>
                  <DialogTitle>Live preview · ATS format</DialogTitle>
                </DialogHeader>
                <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-border bg-muted/20 p-4">
                  <ResumePreview ref={resumePreviewRefModal} data={resume} />
                </div>
                <DialogFooter className="shrink-0 gap-2">
                  {onSaveResumePdf && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={openSaveResumeModal}
                      disabled={!hasResumeContent || isExportingPdf}
                    >
                      <Save className="h-4 w-4" />
                      {isExportingPdf ? "Saving…" : "Save to my resumes"}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    className="gap-2"
                    onClick={handleExportResumePdf}
                    disabled={!hasResumeContent || isExportingPdf}
                  >
                    <Download className="h-4 w-4" />
                    {isExportingPdf ? "Exporting…" : "Export PDF"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {effectiveTab === "cover" && (
          <div className="grid min-w-0 flex-1 grid-cols-1 gap-6 items-start lg:grid-cols-2">
            {/* Left: Form. Live preview button only on mobile */}
            <div className="flex min-w-0 flex-col">
              <div className="mb-2 flex h-5 items-end justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Builder
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2 lg:hidden"
                  onClick={() => setShowPreviewModal(true)}
                >
                  <Eye className="h-4 w-4" />
                  Live preview
                </Button>
              </div>
              <div className="space-y-6 pr-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Mail className="h-4 w-4" />
                      Recipient
                    </CardTitle>
                    <CardDescription>Company and role you&apos;re applying to</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="cover-company">Company name</Label>
                      <Input
                        id="cover-company"
                        value={coverLetter.companyName}
                        onChange={(e) => updateCoverLetter({ companyName: e.target.value })}
                        placeholder="Acme Inc."
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cover-role">Role / position</Label>
                      <Input
                        id="cover-role"
                        value={coverLetter.roleTitle}
                        onChange={(e) => updateCoverLetter({ roleTitle: e.target.value })}
                        placeholder="Senior Software Engineer"
                      />
                    </div>
                    <div className="grid gap-2 sm:col-span-2">
                      <Label htmlFor="cover-manager">Hiring manager (optional)</Label>
                      <Input
                        id="cover-manager"
                        value={coverLetter.hiringManager}
                        onChange={(e) => updateCoverLetter({ hiringManager: e.target.value })}
                        placeholder="Dear [Hiring Manager],"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Sparkles className="h-4 w-4" />
                      Opening
                    </CardTitle>
                    <CardDescription>
                      First paragraph – state the role and your interest
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RichTextEditor
                      value={coverLetter.opening}
                      onChange={(html) => updateCoverLetter({ opening: html })}
                      placeholder="I am writing to express my interest in the [Role] position at [Company]. With my experience in..."
                      minHeight="5rem"
                      className="resize-none"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Briefcase className="h-4 w-4" />
                      Body
                    </CardTitle>
                    <CardDescription>
                      2–3 paragraphs: relevance, experience, and fit
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid gap-2">
                      <Label htmlFor="cover-body-1" className="text-muted-foreground">
                        Paragraph 1
                      </Label>
                      <RichTextEditor
                        value={coverLetter.bodyParagraph1}
                        onChange={(html) => updateCoverLetter({ bodyParagraph1: html })}
                        placeholder="In my current role at..."
                        minHeight="5rem"
                        className="resize-none"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cover-body-2" className="text-muted-foreground">
                        Paragraph 2
                      </Label>
                      <RichTextEditor
                        value={coverLetter.bodyParagraph2}
                        onChange={(html) => updateCoverLetter({ bodyParagraph2: html })}
                        placeholder="I am particularly drawn to [Company] because..."
                        minHeight="5rem"
                        className="resize-none"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cover-body-3" className="text-muted-foreground">
                        Paragraph 3 (optional)
                      </Label>
                      <RichTextEditor
                        value={coverLetter.bodyParagraph3}
                        onChange={(html) => updateCoverLetter({ bodyParagraph3: html })}
                        placeholder="I would welcome the opportunity to discuss..."
                        minHeight="5rem"
                        className="resize-none"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <UserCheck className="h-4 w-4" />
                      Closing
                    </CardTitle>
                    <CardDescription>Thank them and sign off</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RichTextEditor
                      value={coverLetter.closing}
                      onChange={(html) => updateCoverLetter({ closing: html })}
                      placeholder="Thank you for considering my application. I look forward to hearing from you. Sincerely, [Your name]"
                      minHeight="5rem"
                      className="resize-none"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right: Live preview – desktop only, sticky */}
            <div className="hidden min-w-0 flex-col self-start sticky top-6 z-10 lg:flex">
              <div className="mb-2 flex h-5 items-end justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Live preview · ATS format
                </p>
                <div className="flex gap-2">
                  {onSaveCoverLetterPdf && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={openSaveCoverModal}
                      disabled={!hasCoverContent || isExportingPdf}
                    >
                      <Save className="h-4 w-4" />
                      {isExportingPdf ? "Saving…" : "Save to my cover letters"}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    className="gap-2"
                    onClick={handleExportCoverLetterPdf}
                    disabled={!hasCoverContent || isExportingPdf}
                  >
                    <Download className="h-4 w-4" />
                    {isExportingPdf ? "Exporting…" : "Export PDF"}
                  </Button>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-4 shadow-sm">
                <CoverLetterPreview ref={coverLetterPreviewRef} data={coverLetter} />
              </div>
            </div>

            {/* Mobile: Live preview modal */}
            <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
              <DialogContent size="xl" className="flex max-h-[90vh] flex-col">
                <DialogHeader>
                  <DialogTitle>Live preview · ATS format</DialogTitle>
                </DialogHeader>
                <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-border bg-muted/20 p-4">
                  <CoverLetterPreview ref={coverLetterPreviewRefModal} data={coverLetter} />
                </div>
                <DialogFooter className="shrink-0 gap-2">
                  {onSaveCoverLetterPdf && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={openSaveCoverModal}
                      disabled={!hasCoverContent || isExportingPdf}
                    >
                      <Save className="h-4 w-4" />
                      {isExportingPdf ? "Saving…" : "Save to my cover letters"}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    className="gap-2"
                    onClick={handleExportCoverLetterPdf}
                    disabled={!hasCoverContent || isExportingPdf}
                  >
                    <Download className="h-4 w-4" />
                    {isExportingPdf ? "Exporting…" : "Export PDF"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
}
