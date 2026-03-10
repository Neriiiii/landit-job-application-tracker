"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { AppPageTitleBlock } from "@/components/layout/AppPageTitleBlock";
import { CreateJobApplicationDialog } from "@/features/job-applications";
import { CirclePlus } from "lucide-react";

const DASHBOARD_DESCRIPTION =
  "Track your job applications, weekly goals, and pipeline in one place. Add new applications below or open your board to manage them.";

type Props = {
  userId: string;
};

export function DashboardTitleBlock({ userId }: Props) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-4">
        <AppPageTitleBlock
          title="Let's get you hired"
          description={DASHBOARD_DESCRIPTION}
          action={
            <Button
              onClick={() => setCreateOpen(true)}
              size="lg"
              className="gap-2 shrink-0 rounded-lg px-6 text-base"
            >
              <CirclePlus className="h-5 w-5" />
              Add application
            </Button>
          }
        />
      </div>
      <CreateJobApplicationDialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) router.refresh();
        }}
        userId={userId}
      />
    </>
  );
}
