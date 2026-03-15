"use client";

import { useState } from "react";
import { AppPageHeader } from "@/components/layout/PageHeader";
import { ProfileSettingsCard } from "./ProfileSettingsCard";
import { DeleteAccountCard } from "./DeleteAccountCard";
import { DemoDataCard } from "./DemoDataCard";

type UserInfo = {
  id: string;
  email?: string;
  user_metadata?: { full_name?: string; avatar_url?: string };
};

export function SettingsForm({
  user,
  isDemoAccount = false,
}: {
  user: UserInfo;
  isDemoAccount?: boolean;
}) {
  const initialAvatarUrl = user.user_metadata?.avatar_url?.split("?")[0] ?? null;
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(initialAvatarUrl);

  const displayName = user.user_metadata?.full_name?.trim() || user.email || "User";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <AppPageHeader title="Settings" />
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-6xl">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            {/* Main: Profile (2/3 on lg) */}
            <div className="min-w-0 lg:col-span-2">
              <ProfileSettingsCard
                initialAvatarUrl={initialAvatarUrl}
                displayName={displayName}
                email={user.email ?? ""}
                onAvatarUploaded={setCurrentAvatarUrl}
              />
            </div>

            {/* Sidebar: Demo data + Danger zone (1/3 on lg) */}
            <div className="flex min-w-0 flex-col gap-6 lg:gap-8 ">
              {isDemoAccount && <DemoDataCard userId={user.id} />}
              <DeleteAccountCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
