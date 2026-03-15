"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { FormMessage } from "@/components/ui/FormMessage";
import { deleteAccount, type DeleteAccountResult } from "@/app/actions/delete-account";
import { AlertTriangle, Loader2 } from "lucide-react";

const CONFIRM_TEXT = "DELETE";

export function DeleteAccountCard() {
  const [open, setOpen] = useState(false);
  const [confirmValue, setConfirmValue] = useState("");
  const [result, setResult] = useState<DeleteAccountResult | null>(null);
  const [pending, setPending] = useState(false);

  const isConfirmValid = confirmValue.trim() === CONFIRM_TEXT;

  function handleOpenChange(next: boolean) {
    if (!pending) {
      setOpen(next);
      if (!next) {
        setConfirmValue("");
        setResult(null);
      }
    }
  }

  async function handleDelete() {
    if (!isConfirmValid || pending) return;
    setResult(null);
    setPending(true);
    try {
      await deleteAccount();
      setResult({ error: "Something went wrong. Please try again." });
    } catch (err) {
      if (
        err &&
        typeof err === "object" &&
        "digest" in err &&
        typeof (err as { digest?: string }).digest === "string" &&
        (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
      ) {
        throw err;
      }
      setResult({
        error: err instanceof Error ? err.message : "Failed to delete account.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Card className="w-full min-w-0 border-destructive/30 lg:sticky lg:top-8">
        <CardHeader className="text-left sm:text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-destructive sm:justify-center">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            Danger zone
          </CardTitle>
          <CardDescription className="text-left sm:text-center">
            Permanently delete your account and all associated data. This cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-stretch sm:items-center border-t pt-4 border-destructive/30">
          <Button
            type="button"
            variant="destructive"
            onClick={() => setOpen(true)}
            className="gap-2 max-w-lg w-full "
          >
            <AlertTriangle className="h-4 w-4" />
            Delete account
          </Button>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete account</DialogTitle>
            <DialogDescription asChild>
              <p>
                This will permanently delete your account and all your data: job applications,
                checklist, resume and cover letter files, and settings. You will be signed out and
                redirected to the home page. This cannot be undone.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="delete-confirm">
                Type <strong>{CONFIRM_TEXT}</strong> to confirm
              </Label>
              <Input
                id="delete-confirm"
                value={confirmValue}
                onChange={(e) => setConfirmValue(e.target.value)}
                placeholder={CONFIRM_TEXT}
                className="font-mono"
                autoComplete="off"
                disabled={pending}
              />
            </div>
            {result?.error && <FormMessage variant="error">{result.error}</FormMessage>}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={!isConfirmValid || pending}
              className="gap-2"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              Delete account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
