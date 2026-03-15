"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { toSafeMessage } from "@/lib/safe-errors";

const AVATAR_BUCKET = "avatars";
const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export type ProfileState = {
  error?: string;
  success?: string;
};

export async function updateProfile(
  _prev: ProfileState | null,
  formData: FormData
): Promise<ProfileState> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: "You must be signed in to update your profile." };
  }

  const fullName = formData.get("full_name") as string | null;
  const avatarUrl = formData.get("avatar_url") as string | null;

  const updates: { data: Record<string, string> } = {
    data: { ...user.user_metadata },
  };
  if (fullName != null && fullName.trim() !== "") {
    updates.data.full_name = fullName.trim();
  }
  if (avatarUrl != null && avatarUrl.trim() !== "") {
    updates.data.avatar_url = avatarUrl.trim();
  }

  const { error } = await supabase.auth.updateUser(updates);
  if (error) {
    return { error: toSafeMessage(error, "updateProfile") };
  }
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: "Profile updated." };
}

export async function uploadAvatar(
  _prev: ProfileState | null,
  formData: FormData
): Promise<ProfileState & { avatarUrl?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: "You must be signed in to upload an avatar." };
  }

  const file = formData.get("avatar") as File | null;
  if (!file || file.size === 0) {
    return { error: "Please select an image file." };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "Allowed types: JPEG, PNG, GIF, WebP." };
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return { error: "Image must be 2 MB or smaller." };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = ["jpeg", "jpg", "png", "gif", "webp"].includes(ext)
    ? ext === "jpeg"
      ? "jpg"
      : ext
    : "jpg";
  const path = `${user.id}/avatar.${safeExt}`;

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, { upsert: true });

  if (uploadError) {
    return { error: toSafeMessage(uploadError, "uploadAvatar") };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  const urlWithCache = `${publicUrl}?t=${Date.now()}`;

  const { error: updateError } = await supabase.auth.updateUser({
    data: { ...user.user_metadata, avatar_url: urlWithCache },
  });
  if (updateError) {
    return { error: toSafeMessage(updateError, "uploadAvatar") };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: "Avatar updated.", avatarUrl: urlWithCache };
}

export async function updatePassword(
  _prev: ProfileState | null,
  formData: FormData
): Promise<ProfileState> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user?.email) {
    return { error: "You must be signed in to change your password." };
  }

  const currentPassword = formData.get("current_password") as string;
  const newPassword = formData.get("new_password") as string;
  const confirmPassword = formData.get("confirm_password") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "Fill in current, new, and confirm password." };
  }
  if (newPassword !== confirmPassword) {
    return { error: "New password and confirmation do not match." };
  }
  if (newPassword.length < 6) {
    return { error: "New password must be at least 6 characters." };
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (signInError) {
    return { error: "Current password is incorrect." };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    return { error: toSafeMessage(error, "updatePassword") };
  }
  return { success: "Password updated." };
}

export async function removeAvatar(
  _prev: ProfileState | null,
  _formData: FormData
): Promise<ProfileState & { avatarUrl?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: "You must be signed in to remove your avatar." };
  }

  const { error } = await supabase.auth.updateUser({
    data: { ...user.user_metadata, avatar_url: "" },
  });
  if (error) {
    return { error: toSafeMessage(error, "removeAvatar") };
  }
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: "Avatar removed.", avatarUrl: "" };
}

export async function updateEmail(
  _prev: ProfileState | null,
  formData: FormData
): Promise<ProfileState> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: "You must be signed in to update your email." };
  }

  const email = formData.get("email") as string | null;
  const newEmail = email?.trim();
  if (!newEmail) {
    return { error: "Email is required." };
  }
  if (newEmail === user.email) {
    return { success: "Email unchanged." };
  }

  const { error } = await supabase.auth.updateUser({ email: newEmail });
  if (error) {
    return { error: toSafeMessage(error, "updateEmail") };
  }
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: "Check your inbox to confirm your new email address." };
}

export async function updateProfileFull(
  _prev: ProfileState | null,
  formData: FormData
): Promise<ProfileState & { avatarUrl?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: "You must be signed in to update your profile." };
  }

  const fullName = (formData.get("full_name") as string | null)?.trim() ?? "";
  const newEmail = (formData.get("email") as string | null)?.trim() ?? "";
  const removeAvatar = formData.get("remove_avatar") === "true";
  const avatarFile = formData.get("avatar") as File | null;
  const hasNewAvatar = avatarFile && avatarFile.size > 0;

  let avatarUrl: string = (user.user_metadata?.avatar_url as string) ?? "";

  if (removeAvatar) {
    avatarUrl = "";
  } else if (hasNewAvatar) {
    if (!ALLOWED_TYPES.includes(avatarFile.type)) {
      return { error: "Allowed types: JPEG, PNG, GIF, WebP." };
    }
    if (avatarFile.size > MAX_AVATAR_BYTES) {
      return { error: "Image must be 2 MB or smaller." };
    }
    const ext = avatarFile.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeExt = ["jpeg", "jpg", "png", "gif", "webp"].includes(ext)
      ? ext === "jpeg"
        ? "jpg"
        : ext
      : "jpg";
    const path = `${user.id}/avatar.${safeExt}`;
    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(path, avatarFile, { upsert: true });
    if (uploadError) {
      return { error: toSafeMessage(uploadError, "updateProfileFull") };
    }
    const { data: { publicUrl } } = supabase.storage
      .from(AVATAR_BUCKET)
      .getPublicUrl(path);
    avatarUrl = `${publicUrl}?t=${Date.now()}`;
  }

  const updates: { data: Record<string, string>; email?: string } = {
    data: { ...user.user_metadata, full_name: fullName || "", avatar_url: avatarUrl },
  };
  if (newEmail && newEmail !== user.email) {
    updates.email = newEmail;
  }

  const { error } = await supabase.auth.updateUser(updates);
  if (error) {
    return { error: toSafeMessage(error, "updateProfileFull") };
  }
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: "Profile updated.", avatarUrl };
}
