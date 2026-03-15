/** Offer accepted: congratulatory page with link back to dashboard. */
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AppPageHeader } from "@/components/layout/PageHeader";

export default function OfferAcceptedPage() {
  return (
    <div className="flex flex-col h-screen max-h-screen sm:overflow-hidden">
      <AppPageHeader title="Offer accepted" />
      <div className="flex-1 min-h-0 flex flex-col max-sm:p-4 p-8 overflow-hidden max-xl:overflow-y-auto">
        <div className="flex flex-1 flex-col items-center justify-center gap-6">
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
            Congratulations
          </h2>
          <p className="max-w-md text-center text-muted-foreground">
            You&apos;ve accepted the offer. Good luck in your new role!
          </p>
          <Button asChild>
            <Link href="/dashboard">Go back to dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
