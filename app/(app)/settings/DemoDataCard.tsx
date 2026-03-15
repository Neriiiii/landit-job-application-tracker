"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { FormMessage } from "@/components/ui/FormMessage";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { seedFakeData, removeAllFakeData } from "@/app/actions/demo-data";
import { Database, Loader2, Trash2 } from "lucide-react";

type Props = { userId: string };

export function DemoDataCard({ userId }: Props) {
  const router = useRouter();
  const [seedPending, setSeedPending] = useState(false);
  const [removePending, setRemovePending] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSeed() {
    setMessage(null);
    setSeedPending(true);
    try {
      await seedFakeData(userId);
      setMessage({
        type: "success",
        text: "Demo data added. You can see it on the dashboard and job applications.",
      });
      router.refresh();
    } catch (e) {
      setMessage({
        type: "error",
        text: e instanceof Error ? e.message : "Failed to add demo data.",
      });
    } finally {
      setSeedPending(false);
    }
  }

  async function handleRemove() {
    setMessage(null);
    setRemovePending(true);
    try {
      const result = await removeAllFakeData(userId);
      const parts = [
        `${result.removedJobs} job application(s)`,
        `${result.removedChecklist} checklist item(s)`,
      ];
      if (result.removedResumes > 0) parts.push(`${result.removedResumes} resume(s)`);
      if (result.removedCoverLetters > 0) parts.push(`${result.removedCoverLetters} cover letter(s)`);
      setMessage({
        type: "success",
        text: `Removed ${parts.join(", ")}.`,
      });
      setRemoveOpen(false);
      router.refresh();
    } catch (e) {
      setMessage({
        type: "error",
        text: e instanceof Error ? e.message : "Failed to remove demo data.",
      });
    } finally {
      setRemovePending(false);
    }
  }

  return (
    <Card className="w-full min-w-0">
      <CardHeader className="text-left sm:text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-base sm:justify-center">
          <Database className="h-4 w-4 shrink-0" />
          Demo data
        </CardTitle>
        <CardDescription className="text-left sm:text-center">
          Add sample job applications and checklist items to try the app, or remove all demo entries
          in one go.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {message && (
          <FormMessage variant={message.type === "error" ? "error" : "success"}>
            {message.text}
          </FormMessage>
        )}
        <div className="flex flex-wrap gap-2 justify-center border-t pt-4 border-border">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleSeed}
            disabled={seedPending || removePending}
          >
            {seedPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add demo data"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setRemoveOpen(true)}
            disabled={seedPending || removePending}
          >
            {removePending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Remove demo data
              </>
            )}
          </Button>
        </div>
        <ConfirmDialog
          open={removeOpen}
          onOpenChange={setRemoveOpen}
          title="Remove all demo data?"
          description="Only entries that were added as demo data will be deleted. Your real job applications and checklist items will not be affected."
          confirmLabel="Remove demo data"
          cancelLabel="Cancel"
          variant="destructive"
          loading={removePending}
          onConfirm={handleRemove}
        />
      </CardContent>
    </Card>
  );
}
