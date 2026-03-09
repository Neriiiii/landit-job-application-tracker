"use client";

import Link from "next/link";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { useMobileNav } from "./MobileNavContext";
import { SidebarNav } from "./SidebarNav";
import { Briefcase, X } from "lucide-react";

export function MobileNavSheet() {
  const { mobileNavOpen, setMobileNavOpen } = useMobileNav();

  return (
    <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="flex w-72 max-w-[85vw] flex-col gap-0 border-0 p-0 sidebar-gradient"
      >
        <SheetTitle className="sr-only">Navigation menu</SheetTitle>
        <div className="flex h-20 items-center justify-between gap-3 border-b border-[var(--sidebar-border)] px-4 pr-12">
          <Link
            href="/"
            className="flex items-center gap-3 font-semibold text-[var(--sidebar-text)]"
            onClick={() => setMobileNavOpen(false)}
          >
            <Briefcase className="h-8 w-8 text-[var(--sidebar-text)]" />
            <span className="logo-brand-sidebar">LandIt!</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-[var(--sidebar-text)] hover:bg-white/15 hover:text-[var(--sidebar-text)]"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <SidebarNav onNavigate={() => setMobileNavOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
