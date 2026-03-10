"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import { FileText, ExternalLink } from "lucide-react";
import { useResumeFiles } from "@/features/resume";

const NONE_VALUE = "__none__";

type Props = {
  userId: string;
  dialogOpen: boolean;
  value: string | null; // resume_file_id
  onChange: (fileId: string | null) => void;
  id?: string;
  showOpenLink?: boolean;
};

export function ResumeSelect({
  userId,
  dialogOpen,
  value,
  onChange,
  id = "resume",
  showOpenLink = false,
}: Props) {
  const { resumeFiles } = useResumeFiles(userId, dialogOpen);

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>Resume</Label>
      <Select
        value={value ?? NONE_VALUE}
        onValueChange={(v) => onChange(v === NONE_VALUE ? null : v)}
      >
        <SelectTrigger id={id}>
          <SelectValue placeholder="Select a resume" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Resumes</SelectLabel>
            <SelectItem value={NONE_VALUE}>None</SelectItem>
            {resumeFiles.map((f) => (
              <SelectItem key={f.id} value={f.id}>
                <span className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5" />
                  {f.name}
                  {showOpenLink && (
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 text-muted-foreground hover:text-foreground"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </span>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
