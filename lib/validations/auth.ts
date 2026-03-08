import { z } from "zod";

function createSignUpSchema(requireInviteCode: boolean) {
  return z
    .object({
      invite_code: requireInviteCode
        ? z.string().min(1, "Access code is required")
        : z.string().optional(),
      name: z.string().optional(),
      email: z
        .string()
        .min(1, "Email is required")
        .email("Please enter a valid email address"),
      password: z
        .string()
        .min(1, "Password is required")
        .min(8, "Password must be at least 8 characters"),
      confirmPassword: z.string().min(1, "Confirm password is required"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });
}

export type SignUpInput = z.infer<ReturnType<typeof createSignUpSchema>>;

export function getSignUpSchema(requireInviteCode: boolean) {
  return createSignUpSchema(requireInviteCode);
}

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
