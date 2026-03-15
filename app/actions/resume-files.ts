"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUserInAction } from "@/lib/supabase/auth";
import { toSafeMessage } from "@/lib/safe-errors";
import { assertPdfContent } from "@/lib/file-validation";

const RESUME_BUCKET = "resumes";
const RESUME_FILES_FOLDER = "resume-files";
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME = "application/pdf";

export type ResumeFileRecord = {
  id: string;
  user_id: string;
  name: string;
  file_path: string;
  created_at: string;
  file_size?: number | null;
  role: string | null;
  uploaded_at: string;
};

export type ResumeFileWithUrl = ResumeFileRecord & {
  url: string;
  size?: number;
};

export async function listResumeFiles(userId: string): Promise<ResumeFileWithUrl[]> {
  const user = await requireUserInAction();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resume_files")
    .select("id, user_id, name, file_path, created_at, file_size, role, uploaded_at")
    .eq("user_id", user.id)
    .order("uploaded_at", { ascending: false });

  if (error) throw new Error(toSafeMessage(error, "listResumeFiles"));

  const rows = (data ?? []) as (ResumeFileRecord & { uploaded_at?: string | null })[];
  return rows.map((row) => {
    const { data: urlData } = supabase.storage.from(RESUME_BUCKET).getPublicUrl(row.file_path);
    return {
      ...row,
      role: row.role ?? null,
      uploaded_at: row.uploaded_at ?? row.created_at,
      url: urlData.publicUrl,
      size: row.file_size ?? undefined,
    };
  });
}

export async function uploadResumeFile(
  userId: string,
  formData: FormData
): Promise<ResumeFileRecord> {
  const user = await requireUserInAction();
  const file = formData.get("file") as File | null;
  const name = (formData.get("name") as string)?.trim() || "Resume";
  const role = (formData.get("role") as string)?.trim() || null;
  const uploadedAtRaw = (formData.get("uploaded_at") as string)?.trim();
  const uploadedAt = uploadedAtRaw ? `${uploadedAtRaw}T00:00:00.000Z` : null;

  if (!file || file.size === 0) throw new Error("No file provided.");
  if (file.type !== ALLOWED_MIME)
    throw new Error("Only PDF files are allowed.");
  if (file.size > MAX_FILE_SIZE_BYTES)
    throw new Error("File is too large. Maximum size is 5MB.");
  await assertPdfContent(file);

  const supabase = await createClient();
  const id = crypto.randomUUID();
  const filePath = `${user.id}/${RESUME_FILES_FOLDER}/${id}.pdf`;

  const { error: insertError } = await supabase.from("resume_files").insert({
    id,
    user_id: user.id,
    name: name.replace(/\.pdf$/i, "") || "Resume",
    file_path: filePath,
    file_size: file.size,
    role: role || null,
    uploaded_at: uploadedAt ?? new Date().toISOString(),
  });

  if (insertError) throw new Error(toSafeMessage(insertError, "uploadResumeFile insert"));

  const { error: uploadError } = await supabase.storage
    .from(RESUME_BUCKET)
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    await supabase.from("resume_files").delete().eq("id", id).eq("user_id", user.id);
    throw new Error(toSafeMessage(uploadError, "uploadResumeFile storage"));
  }

  const { data: row } = await supabase
    .from("resume_files")
    .select("id, user_id, name, file_path, created_at, file_size, role, uploaded_at")
    .eq("id", id)
    .single();

  if (!row) throw new Error("Failed to read created resume file.");
  return {
    ...row,
    role: row.role ?? null,
    uploaded_at: row.uploaded_at ?? row.created_at,
  } as ResumeFileRecord;
}

export async function updateResumeFile(
  userId: string,
  fileId: string,
  updates: { name?: string; role?: string | null; uploaded_at?: string }
): Promise<void> {
  const user = await requireUserInAction();
  const supabase = await createClient();
  const payload: { name?: string; role?: string | null; uploaded_at?: string } = {};
  if (updates.name !== undefined) payload.name = updates.name.trim() || "Resume";
  if (updates.role !== undefined) payload.role = updates.role?.trim() || null;
  if (updates.uploaded_at !== undefined) {
    payload.uploaded_at = updates.uploaded_at.includes("T")
      ? updates.uploaded_at
      : `${updates.uploaded_at}T00:00:00.000Z`;
  }
  if (Object.keys(payload).length === 0) return;

  const { error } = await supabase
    .from("resume_files")
    .update(payload)
    .eq("id", fileId)
    .eq("user_id", user.id);

  if (error) throw new Error(toSafeMessage(error, "updateResumeFile"));
}

export async function deleteResumeFile(
  userId: string,
  fileId: string
): Promise<void> {
  const user = await requireUserInAction();
  const supabase = await createClient();
  const { data: row, error: fetchError } = await supabase
    .from("resume_files")
    .select("file_path")
    .eq("id", fileId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !row) throw new Error("Resume file not found.");

  await supabase.storage.from(RESUME_BUCKET).remove([row.file_path]);
  const { error: deleteError } = await supabase
    .from("resume_files")
    .delete()
    .eq("id", fileId)
    .eq("user_id", user.id);

  if (deleteError) throw new Error(toSafeMessage(deleteError, "deleteResumeFile"));
}
