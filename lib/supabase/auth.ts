import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) return null;
  return user;
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    const { redirect } = await import("next/navigation");
    redirect("/");
  }
  return user as User;
}

export async function requireUserInAction(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("You must be signed in to do that.");
  }
  return user as User;
}
