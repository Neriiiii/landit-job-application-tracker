import { serverLogError } from "@/lib/server/logger";

const GENERIC_MESSAGE = "Something went wrong. Please try again.";

const AUTH_MESSAGES: Record<string, string> = {
  "invalid_credentials": "Invalid email or password.",
  "invalid_sign_in_credentials": "Invalid email or password.",
  "user_not_found": "Invalid email or password.",
  "email_not_confirmed": "Please confirm your email before signing in.",
  "signup_disabled": "Sign up is currently disabled.",
  "weak_password": "Password is too weak. Use at least 6 characters.",
  "email_rate_limit_exceeded": "Too many attempts. Please try again later.",
};

const STORAGE_SAFE_MESSAGES: Array<{ match: string | RegExp; message: string }> = [
  { match: "Bucket not found", message: "Storage is not configured. Please contact support." },
  { match: "not found", message: "File not found." },
  { match: "size limit", message: "File is too large." },
];

export function toSafeMessage(error: unknown, context: string): string {
  serverLogError(context, error);

  if (error instanceof Error) {
    const msg = error.message;
    const code = (error as { code?: string }).code;
    if (code && AUTH_MESSAGES[code]) return AUTH_MESSAGES[code];
    for (const { match, message } of STORAGE_SAFE_MESSAGES) {
      if (typeof match === "string" ? msg.includes(match) : match.test(msg)) return message;
    }
  }

  return GENERIC_MESSAGE;
}

export function toSafeAuthMessage(error: unknown, context: string): string {
  serverLogError(context, error);
  if (error instanceof Error) {
    const code = (error as { code?: string }).code;
    if (code && AUTH_MESSAGES[code]) return AUTH_MESSAGES[code];
  }
  return GENERIC_MESSAGE;
}

export function getGenericMessage(): string {
  return GENERIC_MESSAGE;
}
