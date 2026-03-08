/** Authenticated app shell: sidebar, mobile nav, user context, and main content area. */
import { requireUser } from "@/lib/supabase/auth";
import { BackToTop } from "@/components/BackToTop";
import { DesktopSidebar } from "@/components/layout/Navigation/DesktopSidebar";
import { MobileNavProvider } from "@/components/layout/Navigation/MobileNavContext";
import { MobileNavSheet } from "@/components/layout/Navigation/MobileNavSheet";
import { UserProvider } from "@/lib/contexts/UserContext";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <UserProvider user={user}>
      <MobileNavProvider>
        <div className="flex h-screen overflow-hidden bg-background">
          <DesktopSidebar />
          <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
          <BackToTop />
        </div>
        <MobileNavSheet />
      </MobileNavProvider>
    </UserProvider>
  );
}
