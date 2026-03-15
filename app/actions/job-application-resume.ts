"use server";

import { createClient } from "@/lib/supabase/server";
import { updateJobApplication } from "@/app/actions/job-applications";
import { requireUserInAction } from "@/lib/supabase/auth";
import { toSafeMessage } from "@/lib/safe-errors";
import { assertPdfOrWordContent } from "@/lib/file-validation";

const RESUME_BUCKET = "resumes";
const ALLOWED_RESUME_TYPES = [
  "application/pdf",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
];

export async function uploadJobApplicationResume(
  applicationId: string,
  userId: string,
  formData: FormData
): Promise<void> {
  const user = await requireUserInAction();
  const file = formData.get("resume") as File | null;
  if (!file || file.size === 0) return;

  const type = file.type?.toLowerCase();
  if (!type || !ALLOWED_RESUME_TYPES.includes(type)) {
    throw new Error("Resume must be a PDF or Word document (.pdf, .doc, .docx).");
  }
  await assertPdfOrWordContent(file);

  const supabase = await createClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
  const safeName = `${Date.now()}-resume.${ext}`;
  const path = `${user.id}/${applicationId}/${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(RESUME_BUCKET)
    .upload(path, file, { upsert: true });

  if (uploadError) {
    throw new Error(toSafeMessage(uploadError, "uploadJobApplicationResume storage"));
  }

  const name = file.name.replace(/\.[^.]+$/i, "") || "Resume";
  const { data: resumeRow, error: insertError } = await supabase
    .from("resume_files")
    .insert({
      user_id: user.id,
      name,
      file_path: path,
      file_size: file.size,
      role: null,
      uploaded_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (insertError) throw new Error(toSafeMessage(insertError, "uploadJobApplicationResume insert"));
  if (!resumeRow?.id) throw new Error("Failed to create resume file record.");

  await updateJobApplication(applicationId, user.id, {
    resume_file_id: resumeRow.id,
  });
}
