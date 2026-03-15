/** Settings page: profile, password, weekly goal, quick links, demo data, delete account. */
import { requireUser } from "@/lib/supabase/auth";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  const user = await requireUser();
  const demoEmail = process.env.DEMO_ACCOUNT_EMAIL?.trim()?.toLowerCase();
  const isDemoAccount =
    !!demoEmail && (user.email?.toLowerCase() === demoEmail);

  return (
    <SettingsForm
      user={{
        id: user.id,
        email: user.email ?? undefined,
        user_metadata: user.user_metadata as
          | { full_name?: string; avatar_url?: string }
          | undefined,
      }}
      isDemoAccount={isDemoAccount}
    />
  );
}
