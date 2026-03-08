/** Landing page: hero, features, how-it-works, and sign up / sign in modal. */
import Link from "next/link";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  HelpCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { AuthModalProvider, OpenAuthModalTrigger } from "@/components/auth";
import { LandingCarousel } from "@/components/landing/LandingCarousel";
import { getCurrentUser } from "@/lib/supabase/auth";
import { cn } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";

export type LandingPageContentProps = {
  user: User | null;
  requireInviteCode: boolean;
};

export function LandingPageContent({ user, requireInviteCode }: LandingPageContentProps) {
  return (
    <AuthModalProvider requireInviteCode={requireInviteCode}>
      <div className="min-h-screen flex flex-col">
        {/* Nav */}
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
              <span className="logo-brand">LandIt!</span>
            </Link>
            <nav className="flex items-center gap-6">
              <Link
                href="#features"
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                How it works
              </Link>
              {user ? (
                <Button asChild size="sm" className="gap-2">
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
              ) : (
                <OpenAuthModalTrigger>
                  <Button size="sm">Get started</Button>
                </OpenAuthModalTrigger>
              )}
            </nav>
          </div>
        </header>

        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/50 bg-background">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,var(--primary)_0%,transparent_50%)] opacity-20" />
          <div className="container relative mx-auto px-4 py-24 sm:py-32">
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                Track applications · Build resumes · Prep for interviews
              </p>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                One place to <span className="text-primary">land your next job</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                Manage applications on a kanban board, see your pipeline on the dashboard, build
                resumes and cover letters, and prepare answers to common interview questions.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                {user ? (
                  <Button asChild size="lg" className="gap-2 text-base">
                    <Link href="/dashboard">
                      Go to Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <>
                    <OpenAuthModalTrigger>
                      <Button size="lg" className="gap-2 text-base">
                        Start tracking free
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </OpenAuthModalTrigger>
                    <Button asChild variant="outline" size="lg" className="text-base">
                      <Link href="#features">See how it works</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="mt-16 flex justify-center px-2">
              <img
                src="/svg/illustration.svg"
                alt="Job application tracking"
                className="w-full max-w-2xl object-contain drop-shadow-lg"
              />
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="scroll-mt-[4.5rem] border-b border-border/50 bg-muted/30 py-20"
        >
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                Built for how you job hunt
              </h2>
              <p className="mt-4 text-muted-foreground">
                Track applications, interviews, resumes, and interview prep in one app.
              </p>
            </div>
            <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2">
              {[
                {
                  icon: LayoutDashboard,
                  title: "Job applications kanban",
                  description:
                    "Drag cards through To apply, Applied, Interview, Offer, Rejected, and Ghosted. Add interview dates, meeting links, and notes to each application.",
                },
                {
                  icon: Calendar,
                  title: "Dashboard & upcoming interviews",
                  description:
                    "See where your applications stand at a glance. Upcoming interviews with one-click join links for online meetings, plus quick links to your favorite job boards.",
                },
                {
                  icon: FileText,
                  title: "Resume & cover letter builder",
                  description:
                    "Build and edit your resume and cover letter in one place. Your documents are saved so you can update and download them whenever you need.",
                },
                {
                  icon: HelpCircle,
                  title: "Interview questions",
                  description:
                    "Prepare answers for common interview questions by category. Add your notes under each question and review them before your next interview.",
                },
              ].map(({ icon: Icon, title, description }) => (
                <Card
                  key={title}
                  className={cn(
                    "border-border/80 bg-card transition-colors hover:border-primary/30 hover:shadow-md",
                  )}
                >
                  <CardHeader>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Carousel: tap image to open full-screen dialog + details */}
        <section
          id="everything"
          className="scroll-mt-[4.5rem] border-b border-border/50 bg-background py-20"
        >
          <div className="container mx-auto max-w-[1400px] px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                Everything you need in one place
              </h2>
              <p className="mt-4 text-muted-foreground">Tap to see the full screen and details.</p>
            </div>
            <div className="mx-auto mt-12 w-full">
              <LandingCarousel />
            </div>
          </div>
        </section>

        {/* How it works / CTA */}
        <section id="how-it-works" className="scroll-mt-[4.5rem] bg-background py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8 text-center shadow-lg sm:p-12">
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Ready to land it?</h2>
              <p className="mt-4 text-muted-foreground">
                {user
                  ? "You're all set. Head to your dashboard to manage applications and prep for interviews."
                  : "Sign up free — track applications, build your resume, and prep for interviews in one place."}
              </p>
              {user ? (
                <Button asChild size="lg" className="mt-8 gap-2">
                  <Link href="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <OpenAuthModalTrigger>
                  <Button size="lg" className="mt-8 gap-2">
                    Get started — it&apos;s free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </OpenAuthModalTrigger>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-auto border-t border-border/50 bg-muted/30 py-8">
          <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 sm:flex-row">
            <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
              <span className="logo-brand">LandIt!</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} LandIt! Built for job seekers.
            </p>
          </div>
        </footer>
      </div>
    </AuthModalProvider>
  );
}

export default async function Home() {
  const user = await getCurrentUser();
  const requireInviteCode = !!process.env.INVITE_CODE?.trim();
  return <LandingPageContent user={user} requireInviteCode={requireInviteCode} />;
}
