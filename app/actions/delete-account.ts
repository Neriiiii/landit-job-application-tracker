"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { toSafeMessage } from "@/lib/safe-errors";

const AVATAR_BUCKET = "avatars";
const RESUME_BUCKET = "resumes";
const COVER_LETTER_BUCKET = "cover-letters";

export type DeleteAccountResult = { success?: true; error?: string };

async function deleteUserStorageFiles(userId: string) {
  const supabase = await createClient();
  const buckets = [AVATAR_BUCKET, RESUME_BUCKET, COVER_LETTER_BUCKET] as const;

  for (const bucket of buckets) {
    const { data: topLevel } = await supabase.storage
      .from(bucket)
      .list(userId, { limit: 1000 });
    if (!topLevel?.length) continue;

    const pathsToRemove: string[] = [];
    for (const item of topLevel) {
      if (!item.name) continue;
      const segmentPath = `${userId}/${item.name}`;
      const { data: nested } = await supabase.storage
        .from(bucket)
        .list(segmentPath, { limit: 1000 });
      if (nested?.length) {
        for (const f of nested) {
          if (f.name) pathsToRemove.push(`${segmentPath}/${f.name}`);
        }
      }
      pathsToRemove.push(segmentPath);
    }
    if (pathsToRemove.length) {
      await supabase.storage.from(bucket).remove(pathsToRemove);
    }
  }
}

export async function deleteAccount(): Promise<DeleteAccountResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: "You must be signed in to delete your account." };
  }

  const userId = user.id;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return {
      error:
        "Account deletion is not configured. Please contact support if you need to delete your account.",
    };
  }

  try {
    await deleteUserStorageFiles(userId);
  } catch {
  }

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );

  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
    userId,
  );
  if (deleteError) {
    return { error: toSafeMessage(deleteError, "deleteAccount") };
  }

  const cookieStore = await cookies();
  const all = cookieStore.getAll();
  for (const c of all) {
    if (c.name.startsWith("sb-") && c.name.endsWith("-auth-token")) {
      cookieStore.set(c.name, "", { maxAge: 0, path: "/" });
    }
  }

  redirect("/");
}
