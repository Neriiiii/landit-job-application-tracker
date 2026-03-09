"use client";

import Link from "next/link";
import { Briefcase } from "lucide-react";
import { SidebarNav } from "./SidebarNav";

export function DesktopSidebar() {
  return (
    <aside className="sidebar-gradient hidden lg:w-64 xl:w-72 2xl:w-80 shrink-0 flex-col border-r border-[var(--sidebar-border)] lg:flex">
      <div className="flex h-20 items-center gap-3 border-b border-[var(--sidebar-border)] px-5">
        <Link
          href="/"
          className="flex items-center justify-center gap-3 font-semibold text-[var(--sidebar-text)] w-full"
        >
          <span className="logo-brand-sidebar text-center">LandIt!</span>
        </Link>
      </div>
      <SidebarNav />
    </aside>
  );
}
