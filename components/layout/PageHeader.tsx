/** App page header: title, optional back link, user menu (avatar, sign out). */
"use client";

import Link from "next/link";
import { useUser } from "@/lib/contexts/UserContext";
import { useMobileNav } from "@/components/layout/Navigation/MobileNavContext";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { User, Menu, Settings, Sun, Moon, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { signOut } from "@/app/actions/auth";

interface AppPageHeaderProps {
  title: string;
  actions?: React.ReactNode;
}

export function AppPageHeader({ title, actions }: AppPageHeaderProps) {
  const user = useUser();
  const { setMobileNavOpen } = useMobileNav();
  const { setTheme, resolvedTheme } = useTheme();
  const displayName = user?.user_metadata?.full_name?.trim() || user?.email || "User";
  const avatarUrl = user?.user_metadata?.avatar_url?.split("?")[0] ?? null;
  const isDark = resolvedTheme === "dark";
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  return (
    <header className="flex h-20 shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-4 sm:px-6 lg:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="lg:hidden shrink-0"
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="min-w-0 truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-4">
        {actions}
        {user && (
          <div className="flex items-center gap-3">
            <span className="hidden truncate text-xs font-medium text-foreground sm:inline sm:text-sm">
              {displayName}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted transition-colors hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  aria-label="Open account menu"
                >
                  <span className="flex size-9 items-center justify-center">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="size-full object-cover" />
                    ) : (
                      <User className="size-5 text-muted-foreground" />
                    )}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-40">
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex cursor-pointer items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleTheme} className="gap-2">
                  {isDark ? (
                    <>
                      <Sun className="h-4 w-4" />
                      Light
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4" />
                      Dark
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={async (e) => {
                    e.preventDefault();
                    await signOut();
                  }}
                  className="flex cursor-pointer items-center gap-2 hover:bg-destructive hover:text-white "
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
}
