"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { FormMessage } from "@/components/ui/FormMessage";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { signUp as signUpAction, signIn as signInAction } from "@/app/actions/auth";
import {
  getSignUpSchema,
  loginSchema,
  type SignUpInput,
  type LoginInput,
} from "@/lib/validations/auth";
import { cn } from "@/lib/utils";
import { HelpCircle } from "lucide-react";

const ACCESS_CODE_TOOLTIP_DELAY_MS = 120;

type AuthModalContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
};

const AuthModalContext = React.createContext<AuthModalContextValue | null>(null);

function useAuthModal() {
  const ctx = React.useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used within AuthModalProvider");
  return ctx;
}

type AuthModalProviderProps = {
  children: React.ReactNode;
  requireInviteCode?: boolean;
};

function AuthModalProvider({ children, requireInviteCode = false }: AuthModalProviderProps) {
  const [open, setOpen] = React.useState(false);
  const value = React.useMemo(
    () => ({
      open,
      setOpen,
      openAuthModal: () => setOpen(true),
      closeAuthModal: () => setOpen(false),
    }),
    [open],
  );
  return (
    <AuthModalContext.Provider value={value}>
      {children}
      <AuthModal open={open} onOpenChange={setOpen} requireInviteCode={requireInviteCode} />
    </AuthModalContext.Provider>
  );
}

type AuthModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requireInviteCode?: boolean;
};

function AuthModal({ open, onOpenChange, requireInviteCode = false }: AuthModalProps) {
  const router = useRouter();
  const [tab, setTab] = React.useState<"signup" | "login">("signup");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [accessCodeTooltipOpen, setAccessCodeTooltipOpen] = React.useState(false);
  const accessCodeTooltipCloseTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (accessCodeTooltipCloseTimerRef.current) {
        clearTimeout(accessCodeTooltipCloseTimerRef.current);
      }
    };
  }, []);

  const signUpForm = useForm<SignUpInput>({
    resolver: zodResolver(getSignUpSchema(requireInviteCode)),
    defaultValues: {
      invite_code: "",
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function handleOpenChange(next: boolean) {
    if (!next) {
      setTab("signup");
      setError(null);
      setSuccessMessage(null);
      signUpForm.reset();
      loginForm.reset();
    }
    onOpenChange(next);
  }

  async function onSignUp(data: SignUpInput) {
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    const result = await signUpAction({
      email: data.email,
      password: data.password,
      full_name: data.name || undefined,
      invite_code: data.invite_code || undefined,
    });
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? "Sign up failed.");
      return;
    }
    if (result.message) {
      setSuccessMessage(result.message);
      return;
    }
    onOpenChange(false);
    router.push("/dashboard");
    router.refresh();
  }

  async function onLogin(data: LoginInput) {
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    const result = await signInAction({ email: data.email, password: data.password });
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? "Sign in failed.");
      return;
    }
    onOpenChange(false);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{tab === "signup" ? "Create an account" : "Welcome back"}</DialogTitle>
          <DialogDescription>
            {tab === "signup"
              ? "Enter your details to get started."
              : "Sign in to your account to continue."}
          </DialogDescription>
        </DialogHeader>
        <div className="p-2">
          <div className="flex gap-1 rounded-lg bg-muted p-1 mb-2 ">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                "flex-1",
                tab === "signup"
                  ? "bg-background text-foreground shadow-sm hover:bg-background/90"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => {
                setTab("signup");
                setError(null);
                setSuccessMessage(null);
                loginForm.clearErrors();
              }}
            >
              Sign up
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                "flex-1",
                tab === "login"
                  ? "bg-background text-foreground shadow-sm hover:bg-background/90"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => {
                setTab("login");
                setError(null);
                setSuccessMessage(null);
                signUpForm.clearErrors();
              }}
            >
              Log in
            </Button>
          </div>
          {error && <FormMessage variant="error">{error}</FormMessage>}
          {successMessage && <FormMessage variant="success">{successMessage}</FormMessage>}
          {tab === "signup" ? (
            <form className="grid gap-4" onSubmit={signUpForm.handleSubmit(onSignUp)}>
              <div className="grid gap-2">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="signup-code">Access code</Label>
                  <Popover open={accessCodeTooltipOpen} onOpenChange={setAccessCodeTooltipOpen}>
                    <div
                      className="inline-flex"
                      onMouseEnter={() => {
                        if (accessCodeTooltipCloseTimerRef.current) {
                          clearTimeout(accessCodeTooltipCloseTimerRef.current);
                          accessCodeTooltipCloseTimerRef.current = null;
                        }
                        setAccessCodeTooltipOpen(true);
                      }}
                      onMouseLeave={() => {
                        accessCodeTooltipCloseTimerRef.current = setTimeout(
                          () => setAccessCodeTooltipOpen(false),
                          ACCESS_CODE_TOOLTIP_DELAY_MS,
                        );
                      }}
                    >
                      <PopoverTrigger
                        type="button"
                        className="inline-flex shrink-0 rounded-full p-0.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label="What is this?"
                      >
                        <HelpCircle className="h-4 w-4" />
                      </PopoverTrigger>
                    </div>
                    <PopoverContent
                      side="top"
                      className="max-w-xs text-sm"
                      onMouseEnter={() => {
                        if (accessCodeTooltipCloseTimerRef.current) {
                          clearTimeout(accessCodeTooltipCloseTimerRef.current);
                          accessCodeTooltipCloseTimerRef.current = null;
                        }
                        setAccessCodeTooltipOpen(true);
                      }}
                      onMouseLeave={() => {
                        accessCodeTooltipCloseTimerRef.current = setTimeout(
                          () => setAccessCodeTooltipOpen(false),
                          ACCESS_CODE_TOOLTIP_DELAY_MS,
                        );
                      }}
                    >
                      Got your invite? Enter your access code here to create your account and start
                      tracking your job applications.
                    </PopoverContent>
                  </Popover>
                </div>
                <Input
                  id="signup-code"
                  placeholder="Enter your access code"
                  autoComplete="one-time-code"
                  aria-invalid={!!signUpForm.formState.errors.invite_code}
                  {...signUpForm.register("invite_code")}
                />
                {signUpForm.formState.errors.invite_code && (
                  <FormMessage variant="error" inline>
                    {signUpForm.formState.errors.invite_code.message}
                  </FormMessage>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="signup-name">Name</Label>
                <Input id="signup-name" placeholder="Your name" {...signUpForm.register("name")} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  aria-invalid={!!signUpForm.formState.errors.email}
                  {...signUpForm.register("email")}
                />
                {signUpForm.formState.errors.email && (
                  <FormMessage variant="error" inline>
                    {signUpForm.formState.errors.email.message}
                  </FormMessage>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  aria-invalid={!!signUpForm.formState.errors.password}
                  {...signUpForm.register("password")}
                />
                {signUpForm.formState.errors.password && (
                  <FormMessage variant="error" inline>
                    {signUpForm.formState.errors.password.message}
                  </FormMessage>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="signup-confirm-password">Confirm password</Label>
                <Input
                  id="signup-confirm-password"
                  type="password"
                  placeholder="••••••••"
                  aria-invalid={!!signUpForm.formState.errors.confirmPassword}
                  {...signUpForm.register("confirmPassword")}
                />
                {signUpForm.formState.errors.confirmPassword && (
                  <FormMessage variant="error" inline>
                    {signUpForm.formState.errors.confirmPassword.message}
                  </FormMessage>
                )}
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading || signUpForm.formState.isSubmitting}
              >
                {loading ? "Creating account…" : "Create account"}
              </Button>
            </form>
          ) : (
            <form className="grid gap-4 p-2" onSubmit={loginForm.handleSubmit(onLogin)}>
              <div className="grid gap-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  aria-invalid={!!loginForm.formState.errors.email}
                  {...loginForm.register("email")}
                />
                {loginForm.formState.errors.email && (
                  <FormMessage variant="error" inline>
                    {loginForm.formState.errors.email.message}
                  </FormMessage>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  aria-invalid={!!loginForm.formState.errors.password}
                  {...loginForm.register("password")}
                />
                {loginForm.formState.errors.password && (
                  <FormMessage variant="error" inline>
                    {loginForm.formState.errors.password.message}
                  </FormMessage>
                )}
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading || loginForm.formState.isSubmitting}
              >
                {loading ? "Signing in…" : "Log in"}
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function OpenAuthModalTrigger({ children }: { children: React.ReactNode }) {
  const { openAuthModal } = useAuthModal();
  const child = React.Children.only(children) as React.ReactElement<{
    onClick?: (e: React.MouseEvent) => void;
  }>;
  return React.cloneElement(child, {
    onClick: (e: React.MouseEvent) => {
      e.preventDefault();
      child.props.onClick?.(e);
      openAuthModal();
    },
  });
}

export { AuthModalProvider, useAuthModal, OpenAuthModalTrigger };
