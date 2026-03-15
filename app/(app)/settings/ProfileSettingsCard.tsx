"use client";

import { useActionState, useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { FormMessage } from "@/components/ui/FormMessage";
import { updateProfileFull, updatePassword, type ProfileState } from "@/app/actions/profile";
import { Camera, Eye, EyeOff, Loader2, Mail, Pencil, User } from "lucide-react";

type Props = {
  initialAvatarUrl: string | null;
  displayName: string;
  email: string;
  onAvatarUploaded?: (url: string) => void;
};

function PasswordInput({
  id,
  name,
  placeholder,
  autoComplete,
  "aria-label": ariaLabel,
}: {
  id: string;
  name: string;
  placeholder: string;
  autoComplete: string;
  "aria-label"?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative max-w-lg w-full">
      <Input
        id={id}
        name={name}
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="pr-9"
      />
      <div className="absolute right-0 top-0 flex h-full items-center pr-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

export function ProfileSettingsCard({
  initialAvatarUrl,
  displayName,
  email,
  onAvatarUploaded,
}: Props) {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const prevSuccessRef = useRef(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editName, setEditName] = useState(displayName);
  const [editEmail, setEditEmail] = useState(email);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [profileState, profileAction, profilePending] = useActionState(
    updateProfileFull,
    null as (ProfileState & { avatarUrl?: string }) | null,
  );
  const [passwordState, passwordAction, passwordPending] = useActionState(
    updatePassword,
    null as ProfileState | null,
  );

  const displayAvatarUrl = avatarPreview ?? initialAvatarUrl;

  useEffect(() => {
    setEditName(displayName);
    setEditEmail(email);
  }, [displayName, email]);

  useEffect(() => {
    if (profileState?.success && profileState?.avatarUrl !== undefined) {
      onAvatarUploaded?.(profileState.avatarUrl);
    }
  }, [profileState?.success, profileState?.avatarUrl, onAvatarUploaded]);

  useEffect(() => {
    const justSucceeded = profileState?.success && !prevSuccessRef.current;
    prevSuccessRef.current = !!profileState?.success;
    if (isEditMode && justSucceeded) {
      cancelEdit();
    }
  }, [profileState?.success, isEditMode]);

  function enterEditMode() {
    setEditName(displayName);
    setEditEmail(email);
    setAvatarPreview(null);
    setAvatarFile(null);
    setIsEditMode(true);
  }

  function cancelEdit() {
    setIsEditMode(false);
    setAvatarPreview(null);
    setAvatarFile(null);
    setEditName(displayName);
    setEditEmail(email);
    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  }

  return (
    <Card className="relative w-full min-w-0">
      <CardHeader className="text-left">
        <CardTitle>Your profile</CardTitle>
        <CardDescription>
          Update your profile picture, display name, email, and password
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        {/* Profile photo + info in one section */}
        <section className="space-y-6 border-b border-border pb-6">
          {!isEditMode ? (
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="flex shrink-0 justify-center sm:justify-start">
                <button
                  type="button"
                  onClick={enterEditMode}
                  className="group relative flex h-24 w-24 overflow-hidden rounded-full border-2 border-border bg-muted sm:h-28 sm:w-28"
                  aria-label="Edit profile"
                >
                  {initialAvatarUrl ? (
                    <img src={initialAvatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <User className="h-10 w-10 sm:h-12 sm:w-12" />
                    </div>
                  )}
                  <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <Pencil className="h-6 w-6 text-white sm:h-7 sm:w-7" />
                  </span>
                </button>
              </div>
              <div className="min-w-0 flex-1 space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Display name</p>
                  <p className="truncate text-base font-medium">{displayName || "—"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="truncate text-base">{email || "—"}</p>
                </div>
              </div>
            </div>
          ) : (
            <form action={profileAction} className="flex flex-col gap-6">
              <input type="hidden" name="remove_avatar" value="" />
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                <div className="flex shrink-0 flex-col items-center gap-2 sm:items-start">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => avatarInputRef.current?.click()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        avatarInputRef.current?.click();
                      }
                    }}
                    className="group relative flex h-24 w-24 cursor-pointer overflow-hidden rounded-full border-2 border-border bg-muted sm:h-28 sm:w-28"
                    aria-label="Change profile photo"
                  >
                    <input
                      ref={avatarInputRef}
                      type="file"
                      name="avatar"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      className="sr-only"
                      onChange={handleAvatarChange}
                    />
                    {displayAvatarUrl ? (
                      <img src={displayAvatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <User className="h-10 w-10 sm:h-12 sm:w-12" />
                      </div>
                    )}
                    <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <Pencil className="h-6 w-6 text-white sm:h-7 sm:w-7" />
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">JPEG, PNG, GIF or WebP, max 2 MB</p>
                </div>
                <div className="grid min-w-0 flex-1 gap-4 sm:max-w-xs">
                  <div className="grid gap-2">
                    <Label htmlFor="profile-full_name">Display name</Label>
                    <Input
                      id="profile-full_name"
                      name="full_name"
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Your name"
                      className="w-full min-w-0"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="profile-email">Email</Label>
                    <Input
                      id="profile-email"
                      name="email"
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full min-w-0"
                    />
                  </div>
                </div>
              </div>

              {(profileState?.error || profileState?.success) && (
                <FormMessage variant={profileState?.error ? "error" : "success"} inline>
                  {profileState?.error ?? profileState?.success}
                </FormMessage>
              )}

              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={profilePending} size="sm">
                  {profilePending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={cancelEdit}
                  disabled={profilePending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </section>

        {/* Change password */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold sm:text-lg">Change password</h2>
          <form action={passwordAction} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="profile-current_password">Current password</Label>
              <PasswordInput
                id="profile-current_password"
                name="current_password"
                placeholder="••••••••"
                autoComplete="current-password"
                aria-label="Current password"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="profile-new_password">New password</Label>
                <PasswordInput
                  id="profile-new_password"
                  name="new_password"
                  placeholder="New password"
                  autoComplete="new-password"
                  aria-label="New password"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="profile-confirm_password">Confirm password</Label>
                <PasswordInput
                  id="profile-confirm_password"
                  name="confirm_password"
                  placeholder="Confirm password"
                  autoComplete="new-password"
                  aria-label="Confirm new password"
                />
              </div>
            </div>
            {passwordState?.error && (
              <FormMessage variant="error" inline>
                {passwordState.error}
              </FormMessage>
            )}
            {passwordState?.success && (
              <FormMessage variant="success" inline>
                {passwordState.success}
              </FormMessage>
            )}
            <Button type="submit" disabled={passwordPending} size="sm" className="w-fit">
              {passwordPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Change password"}
            </Button>
          </form>
        </section>
      </CardContent>
    </Card>
  );
}
