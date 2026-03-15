import { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { UserProvider } from "@/lib/contexts/UserContext";
import { MobileNavProvider } from "@/components/layout/Navigation/MobileNavContext";
import type { User } from "@supabase/supabase-js";

const mockUser = {
  id: "test-user-id",
  email: "test@example.com",
  user_metadata: { full_name: "Test User" },
} as unknown as User;

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <UserProvider user={mockUser}>
        <MobileNavProvider>{children}</MobileNavProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
