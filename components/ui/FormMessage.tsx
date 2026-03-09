import { cn } from "@/lib/utils";

type FormMessageProps = {
  variant: "error" | "success";
  children: React.ReactNode;
  className?: string;
  role?: "alert";
  inline?: boolean;
};

export function FormMessage({
  variant,
  children,
  className,
  role = variant === "error" ? "alert" : undefined,
  inline = false,
}: FormMessageProps) {
  return (
    <p
      role={role}
      className={cn(
        "text-sm rounded-md",
        inline ? "py-0.5" : "px-3 py-2",
        variant === "error" &&
          (inline ? "text-destructive" : "text-destructive bg-destructive/10"),
        variant === "success" &&
          (inline ? "text-success" : "text-success bg-success/10"),
        className
      )}
    >
      {children}
    </p>
  );
}
