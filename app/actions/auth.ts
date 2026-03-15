"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { ActionResult } from "@/lib/types/action-result";
import { toSafeAuthMessage } from "@/lib/safe-errors";
import { checkAuthRateLimit, clearAuthRateLimit } from "@/lib/rate-limit";

export type AuthResult = ActionResult;

export async function signUp(credentials: {
  email: string;
  password: string;
  full_name?: string;
  invite_code?: string;
}): Promise<AuthResult> {
  const expectedCode = process.env.INVITE_CODE?.trim();
  if (expectedCode) {
    const provided = credentials.invite_code?.trim();
    if (provided !== expectedCode) {
      return {
        success: false,
        error: "Invalid access code. Request a code to get access.",
      };
    }
  }

  const emailKey = credentials.email.trim().toLowerCase();
  if (!checkAuthRateLimit(emailKey, "signUp")) {
    return { success: false, error: "Too many attempts. Please try again later." };
  }
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: credentials.email.trim(),
    password: credentials.password,
    options: { data: { full_name: credentials.full_name?.trim() || undefined } },
  });
  if (error) return { success: false, error: toSafeAuthMessage(error, "signUp") };
  if (data.user && !data.session) {
    return { success: true, message: "Check your email to confirm your account." };
  }
  return { success: true };
}

export async function signIn(credentials: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  const emailKey = credentials.email.trim().toLowerCase();
  if (!checkAuthRateLimit(emailKey, "signIn")) {
    return { success: false, error: "Too many attempts. Please try again later." };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: credentials.email.trim(),
    password: credentials.password,
  });
  if (error) return { success: false, error: toSafeAuthMessage(error, "signIn") };
  clearAuthRateLimit(emailKey, "signIn");
  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
