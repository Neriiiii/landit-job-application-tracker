"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUserInAction } from "@/lib/supabase/auth";
import { toSafeMessage } from "@/lib/safe-errors";
import { assertPdfContent } from "@/lib/file-validation";

const COVER_LETTER_BUCKET = "cover-letters";
const COVER_LETTER_FILES_FOLDER = "cover-letter-files";
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME = "application/pdf";

export type CoverLetterFileRecord = {
  id: string;
  user_id: string;
  name: string;
  file_path: string;
  created_at: string;
  file_size?: number | null;
};

export type CoverLetterFileWithUrl = CoverLetterFileRecord & {
  url: string;
  size?: number;
};

export async function listCoverLetterFiles(
  userId: string
): Promise<CoverLetterFileWithUrl[]> {
  const user = await requireUserInAction();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cover_letter_files")
    .select("id, user_id, name, file_path, created_at, file_size")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(toSafeMessage(error, "listCoverLetterFiles"));

  const rows = (data ?? []) as CoverLetterFileRecord[];
  return rows.map((row) => {
    const { data: urlData } = supabase.storage
      .from(COVER_LETTER_BUCKET)
      .getPublicUrl(row.file_path);
    return {
      ...row,
      url: urlData.publicUrl,
      size: row.file_size ?? undefined,
    };
  });
}

export async function uploadCoverLetterFile(
  userId: string,
  formData: FormData
): Promise<CoverLetterFileRecord> {
  const user = await requireUserInAction();
  const file = formData.get("file") as File | null;
  const name = (formData.get("name") as string)?.trim() || "Cover letter";

  if (!file || file.size === 0) throw new Error("No file provided.");
  if (file.type !== ALLOWED_MIME)
    throw new Error("Only PDF files are allowed.");
  if (file.size > MAX_FILE_SIZE_BYTES)
    throw new Error("File is too large. Maximum size is 5MB.");
  await assertPdfContent(file);

  const supabase = await createClient();
  const id = crypto.randomUUID();
  const filePath = `${user.id}/${COVER_LETTER_FILES_FOLDER}/${id}.pdf`;

  const { error: insertError } = await supabase.from("cover_letter_files").insert({
    id,
    user_id: user.id,
    name: name.replace(/\.pdf$/i, "") || "Cover letter",
    file_path: filePath,
    file_size: file.size,
  });

  if (insertError) throw new Error(toSafeMessage(insertError, "uploadCoverLetterFile insert"));

  const { error: uploadError } = await supabase.storage
    .from(COVER_LETTER_BUCKET)
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    await supabase
      .from("cover_letter_files")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    throw new Error(toSafeMessage(uploadError, "uploadCoverLetterFile storage"));
  }

  const { data: row } = await supabase
    .from("cover_letter_files")
    .select("id, user_id, name, file_path, created_at")
    .eq("id", id)
    .single();

  if (!row) throw new Error("Failed to read created cover letter file.");
  return row as CoverLetterFileRecord;
}

export async function updateCoverLetterFile(
  userId: string,
  fileId: string,
  updates: { name?: string }
): Promise<void> {
  const user = await requireUserInAction();
  const supabase = await createClient();
  const payload: { name?: string } = {};
  if (updates.name !== undefined) payload.name = updates.name.trim() || "Cover letter";
  if (Object.keys(payload).length === 0) return;

  const { error } = await supabase
    .from("cover_letter_files")
    .update(payload)
    .eq("id", fileId)
    .eq("user_id", user.id);

  if (error) throw new Error(toSafeMessage(error, "updateCoverLetterFile"));
}

export async function deleteCoverLetterFile(
  userId: string,
  fileId: string
): Promise<void> {
  const user = await requireUserInAction();
  const supabase = await createClient();
  const { data: row, error: fetchError } = await supabase
    .from("cover_letter_files")
    .select("file_path")
    .eq("id", fileId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !row) throw new Error("Cover letter file not found.");

  await supabase.storage.from(COVER_LETTER_BUCKET).remove([row.file_path]);
  const { error: deleteError } = await supabase
    .from("cover_letter_files")
    .delete()
    .eq("id", fileId)
    .eq("user_id", user.id);

  if (deleteError) throw new Error(toSafeMessage(deleteError, "deleteCoverLetterFile"));
}
