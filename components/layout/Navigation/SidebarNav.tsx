"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  HelpCircle,
  ChevronDown,
  CheckSquare,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";

const jobRequirementsSubItems = [
  { href: "/job-requirements/checklist", label: "Checklist", icon: CheckSquare },
  { href: "/job-requirements/resume", label: "Resume", icon: FileText },
  { href: "/job-requirements/cover-letter", label: "Cover letter", icon: Mail },
] as const;

type SidebarNavProps = {
  onNavigate?: () => void;
  className?: string;
};

export function SidebarNav({ onNavigate, className }: SidebarNavProps) {
  const pathname = usePathname();
  const isUnderJobRequirements = pathname.startsWith("/job-requirements");
  const [jobRequirementsOpen, setJobRequirementsOpen] = useState(isUnderJobRequirements);

  useEffect(() => {
    if (isUnderJobRequirements) setJobRequirementsOpen(true);
  }, [isUnderJobRequirements]);

  const linkClass = (isActive: boolean) =>
    cn(
      "!h-14 w-full justify-start gap-3 xl:text-xl text-lg text-[var(--sidebar-text)] hover:bg-white/15 hover:text-[var(--sidebar-text)] ",
      isActive &&
        "bg-[var(--sidebar-bg-active)] font-semibold text-[var(--sidebar-text-active)] shadow-sm [&_svg]:text-[var(--sidebar-text-active)]",
    );

  const subLinkClass = (isActive: boolean) =>
    cn(
      "!h-12 lg:h-10 w-full justify-start gap-2 xl:text-lg text-base text-[var(--sidebar-text)]/90 hover:bg-white/15 hover:text-[var(--sidebar-text)] ",
      isActive &&
        "bg-[var(--sidebar-bg-active)] font-semibold text-[var(--sidebar-text-active)] shadow-sm [&_svg]:text-[var(--sidebar-text-active)]",
    );

  return (
    <nav className={cn("flex flex-1 flex-col gap-1 p-4", className)}>
      <div className="flex flex-col gap-1">
        <Link href="/dashboard" onClick={onNavigate}>
          <Button variant="ghost" size="default" className={linkClass(pathname === "/dashboard")}>
            <LayoutDashboard className="h-6 w-6" />
            Dashboard
          </Button>
        </Link>
        <Link href="/job-applications" onClick={onNavigate}>
          <Button
            variant="ghost"
            size="default"
            className={linkClass(pathname === "/job-applications")}
          >
            <ClipboardList className="h-6 w-6" />
            Job applications
          </Button>
        </Link>

        <div className="flex flex-col gap-1">
          <Button
            type="button"
            variant="ghost"
            size="default"
            className={cn(
              "lg:h-14 w-full justify-between gap-3 xl:text-xl text-lg text-[var(--sidebar-text)] hover:bg-white/15 hover:text-[var(--sidebar-text)] ",
              isUnderJobRequirements &&
                "bg-[var(--sidebar-bg-active)] font-medium text-[var(--sidebar-text-active)] [&_svg]:text-[var(--sidebar-text-active)]",
            )}
            onClick={() => setJobRequirementsOpen((o) => !o)}
          >
            <span className="flex gap-3 items-center">
              <FileText className="h-6 w-6" />
              Job Requirements
            </span>
            <ChevronDown
              className={cn(
                "h-8 w-8 shrink-0 transition-transform",
                jobRequirementsOpen && "rotate-180",
              )}
            />
          </Button>
          {jobRequirementsOpen && (
            <div className="ml-5 flex flex-col gap-0.5 border-l border-[var(--sidebar-border)] pl-3">
              {jobRequirementsSubItems.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link key={href} href={href} onClick={onNavigate}>
                    <Button variant="ghost" size="default" className={subLinkClass(isActive)}>
                      <Icon className="h-5 w-5" />
                      {label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <Link href="/interview-questions" onClick={onNavigate}>
          <Button
            variant="ghost"
            size="default"
            className={linkClass(pathname === "/interview-questions")}
          >
            <HelpCircle className="h-6 w-6" />
            Interview questions
          </Button>
        </Link>
      </div>
    </nav>
  );
}
